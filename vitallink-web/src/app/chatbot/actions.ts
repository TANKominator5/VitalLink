// src/app/chatbot/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import Groq from "groq-sdk";

// Type definitions
interface ProfileDocument {
  content: string;
  user_id: string;
  similarity?: number;
}

// Initialize clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Action 1: Generates and stores embeddings for a user's profile.
 * This should be called whenever a user's profile is updated.
 */
export async function generateAndStoreEmbeddings(userId: string) {
  const supabase = createClient();

  try {
    // 1. Fetch all profile data for the user
    const { data: profile, error: profileError } = await supabase
      .from('profiles').select('*').eq('id', userId).single();
    
    let details = null;
    if (profile?.role === 'donor') {
      const { data } = await supabase.from('donor_details').select('*').eq('user_id', userId).single();
      details = data;
    } else if (profile?.role === 'recipient') {
      const { data } = await supabase.from('recipient_details').select('*').eq('user_id', userId).single();
      details = data;
    }

    if (profileError || !profile) {
      console.error("Embedding Error: Could not fetch profile.", profileError);
      return { error: "Could not fetch profile." };
    }

    // 2. Format the data into a single text block
    let content = `
      Account Type: ${profile.role || 'Not specified'}
      Full Name: ${profile.full_name || 'Not specified'}
      Date of Birth: ${profile.dob || 'Not specified'}
      Blood Group: ${profile.blood_group || 'Not specified'}
      Rh Factor: ${profile.rh_factor || 'Not specified'}
    `;
    if (details) {
      content += `\nCurrently Diagnosed With: ${details.diagnosed_with || 'None'}`;
    }
    if (profile.role === 'donor' && details) {
      content += `\nHLA Factor: ${details.hla_factor || 'Not specified'}`;
      content += `\nWilling to Donate: ${(details.willing_to_donate || []).join(', ') || 'None specified'}`;
    }
    if (profile.role === 'recipient' && details) {
      content += `\nRequired Organ: ${details.required_organ || 'Not specified'}`;
    }

    // 3. Generate embedding using OpenAI
    if (!process.env.OPENAI_API_KEY) {
      return { error: "OpenAI API key is not configured." };
    }

    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: content,
    });
    const embedding = embeddingResponse.data[0].embedding;

    // 4. Store the content and embedding in the database
    const { error: upsertError } = await supabase
      .from('user_profile_embeddings')
      .upsert({ user_id: userId, content, embedding }, { onConflict: 'user_id' });
    
    if (upsertError) {
      console.error("Upsert Error:", upsertError);
      return { error: "Failed to store profile embedding." };
    }

    console.log(`Successfully generated and stored embedding for user ${userId}`);
    return { success: true };

  } catch (error) {
    console.error("Error in generateAndStoreEmbeddings:", error);
    return { error: "An error occurred while generating embeddings." };
  }
}


/**
 * Action 2: The main RAG function to ask a question.
 */
export async function askAI(question: string) {
    const supabase = createClient();

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "You must be logged in to ask a question." };
    }

    try {
        // 2. Check if we can use the full RAG system
        if (!process.env.OPENAI_API_KEY || !process.env.GROQ_API_KEY) {
            return await askAISimple(question, user.id);
        }

        // 3. Create an embedding from the user's question
        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: question,
        });
        const questionEmbedding = embeddingResponse.data[0].embedding;

        // 4. Retrieve relevant profile data from vector DB
        const { data: documents, error: matchError } = await supabase.rpc('match_user_profile', {
            p_user_id: user.id,
            p_query_embedding: questionEmbedding,
            p_match_threshold: 0.5, // Lower threshold for broader matches
            p_match_count: 1,
        });

        if (matchError || !documents || documents.length === 0) {
            console.error("Match Error:", matchError);
            // Fallback to simple method if vector search fails
            return await askAISimple(question, user.id);
        }

        const contextText = (documents as ProfileDocument[]).map((doc: ProfileDocument) => doc.content).join("\n\n");

        // 5. Construct the prompt for the LLM
        const prompt = `
            You are a helpful AI assistant for the VitalLink platform. Your role is to answer questions based ONLY on the user's profile information provided below.
            Do not make up information or answer questions outside of this context.
            If the answer is not in the provided context, say "That information is not available in your profile."

            Here is the user's profile information:
            ---
            ${contextText}
            ---

            Based on this information, please answer the following question:
            Question: "${question}"
        `;

        // 6. Call Groq with the Llama 3.1 70B model
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama3-70b-8192", 
        });

        return { answer: completion.choices[0]?.message?.content || "Sorry, I could not generate a response." };

    } catch (error) {
        console.error("Error in askAI:", error);
        // Fallback to simple method on any error
        return await askAISimple(question, user.id);
    }
}

/**
 * Fallback function that works without external APIs
 */
async function askAISimple(question: string, userId: string) {
    const supabase = createClient();

    try {
        // Fetch user profile data directly
        const { data: profile } = await supabase
            .from('profiles').select('*').eq('id', userId).single();
        
        let details = null;
        if (profile?.role === 'donor') {
            const { data } = await supabase.from('donor_details').select('*').eq('user_id', userId).single();
            details = data;
        } else if (profile?.role === 'recipient') {
            const { data } = await supabase.from('recipient_details').select('*').eq('user_id', userId).single();
            details = data;
        }

        if (!profile) {
            return { error: "Could not find your profile information." };
        }

        // Simple keyword-based matching
        const lowerQuestion = question.toLowerCase();
        
        if (lowerQuestion.includes('blood') || lowerQuestion.includes('blood type') || lowerQuestion.includes('blood group')) {
            return { answer: `Your blood type is ${profile.blood_group || 'not specified'} ${profile.rh_factor || ''}.` };
        }
        
        if (lowerQuestion.includes('name')) {
            return { answer: `Your name is ${profile.full_name || 'not specified'}.` };
        }
        
        if (lowerQuestion.includes('role') || lowerQuestion.includes('account type')) {
            const roleText = profile.role === 'donor' ? 'Organ Donor' : 
                            profile.role === 'recipient' ? 'Organ Recipient' : 
                            profile.role === 'medical_professional' ? 'Medical Professional' : 'User';
            return { answer: `You are registered as a ${roleText}.` };
        }
        
        if (lowerQuestion.includes('birth') || lowerQuestion.includes('age') || lowerQuestion.includes('dob')) {
            return { answer: `Your date of birth is ${profile.dob || 'not specified'}.` };
        }
        
        if (profile.role === 'donor' && details && (lowerQuestion.includes('donate') || lowerQuestion.includes('organ'))) {
            const organs = details.willing_to_donate || [];
            if (Array.isArray(organs) && organs.length > 0) {
                return { answer: `You are willing to donate: ${organs.join(', ')}.` };
            } else {
                return { answer: `You haven't specified which organs you're willing to donate yet.` };
            }
        }
        
        if (profile.role === 'recipient' && details && (lowerQuestion.includes('need') || lowerQuestion.includes('require') || lowerQuestion.includes('organ'))) {
            return { answer: `You require: ${details.required_organ || 'not specified'}.` };
        }

        if (lowerQuestion.includes('diagnos') || lowerQuestion.includes('condition')) {
            const diagnosis = details?.diagnosed_with || 'none specified';
            return { answer: `Current diagnosis: ${diagnosis}.` };
        }

        // Default response
        return { 
            answer: `I can help you with information about your profile. You can ask me about your blood type, name, account type, date of birth, ${
                profile.role === 'donor' ? 'organs you\'re willing to donate, ' : 
                profile.role === 'recipient' ? 'organs you need, ' : ''
            }or medical conditions.` 
        };

    } catch (error) {
        console.error("Error in askAISimple:", error);
        return { error: "Sorry, I'm having trouble accessing your profile information right now." };
    }
}