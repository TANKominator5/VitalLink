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
 * Handle general questions without profile context using Groq
 */
async function handleGeneralQuestion(question: string) {
    try {
        const prompt = `
            You are VitalLink Assistant, a helpful AI companion for the VitalLink organ donation platform. 
            You are answering a general question that doesn't require specific user profile information.

            Provide helpful, accurate, and supportive information about:
            - General health and medical topics
            - Organ donation information and processes
            - Blood type compatibility and medical facts
            - Healthcare guidance and support

            Be friendly, professional, and maintain a caring tone suitable for a healthcare context.
            If asked about something completely unrelated to health or the platform, politely redirect to health-related topics.

            Question: "${question}"
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama3-70b-8192",
        });

        return { answer: completion.choices[0]?.message?.content || "Sorry, I could not generate a response." };

    } catch (error) {
        console.error("Error in handleGeneralQuestion:", error);
        return { error: "Sorry, I'm having trouble processing your question right now." };
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

        // 3. First, check if this is a general question that doesn't need profile data
        const lowerQuestion = question.toLowerCase();
        
        // Check for profile-specific indicators first
        const profileIndicators = [
            'my', 'mine', 'i am', "i'm", 'my profile', 'my account', 'my information',
            'what is my', 'tell me my', 'show me my', 'what are my'
        ];
        
        const hasProfileIndicators = profileIndicators.some(indicator => 
            lowerQuestion.includes(indicator)
        );

        // General question patterns (medical/health questions that don't need personal data)
        const generalQuestionPatterns = [
            // Greetings and basic interactions
            'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
            'help', 'what can you do', 'what are your capabilities',
            
            // General medical/health questions
            'will i die', 'is it safe', 'what happens if', 'what are the risks',
            'how does', 'what is', 'why does', 'can you explain',
            'what are the side effects', 'what are the benefits',
            'how long does', 'how often', 'when should',
            
            // General organ donation questions
            'what is organ donation', 'how does organ donation work', 'organ donation process',
            'what are the benefits', 'why donate', 'how to become donor',
            'what organs can be donated', 'organ transplant', 'transplantation',
            
            // General blood/medical questions
            'blood donation', 'donate blood', 'giving blood', 'blood drive',
            'blood type compatibility', 'blood types', 'blood groups',
            'what blood type', 'which blood type', 'blood type matching',
            
            // Health and medical general questions
            'health', 'medical', 'disease', 'condition', 'treatment',
            'diagnosis', 'symptoms', 'medicine', 'medication',
            
            // Polite interactions
            'thank you', 'thanks', 'bye', 'goodbye'
        ];

        // Check if it's a general question
        const isGeneralQuestion = generalQuestionPatterns.some(pattern => 
            lowerQuestion.includes(pattern)
        ) && !hasProfileIndicators;

        // Special cases: Override profile routing for clearly general medical questions
        const generalMedicalOverrides = [
            'will i die', 'is it dangerous', 'what are the risks', 'side effects',
            'how safe is', 'what happens if i donate', 'donate blood',
            'blood donation risks', 'organ donation risks'
        ];
        
        const isGeneralMedical = generalMedicalOverrides.some(pattern => 
            lowerQuestion.includes(pattern)
        );

        if (isGeneralQuestion || isGeneralMedical) {
            // Handle as general question without profile context
            return await handleGeneralQuestion(question);
        }

        // 4. Create an embedding from the user's question
        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: question,
        });
        const questionEmbedding = embeddingResponse.data[0].embedding;

        // 5. Retrieve relevant profile data from vector DB
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

        // 6. Construct the prompt for the LLM
        const prompt = `
            You are VitalLink Assistant, a helpful AI companion for the VitalLink organ donation platform. You have two main roles:

            1. Answer questions about the user's specific profile information (provided below)
            2. Answer general health, medical, and organ donation related questions

            Here is the user's profile information:
            ---
            ${contextText}
            ---

            Guidelines:
            - For questions about the user's specific information (blood type, account details, etc.), use the profile data above
            - For general health, medical, or organ donation questions, provide helpful and accurate information
            - Be friendly, supportive, and informative
            - If asked about something completely unrelated to health or the platform, politely redirect to health-related topics
            - Always maintain a caring and professional tone suitable for a healthcare context

            Question: "${question}"
        `;

        // 7. Call Groq with the Llama 3.1 70B model
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

        // Default response for general questions
        if (lowerQuestion.includes('hello') || lowerQuestion.includes('hi')) {
            return { answer: "Hello! I'm your VitalLink AI Assistant. I can help you with information about your profile or answer general health and organ donation questions. How can I assist you today?" };
        }
        
        if (lowerQuestion.includes('help') || lowerQuestion.includes('what can you do')) {
            return { answer: `I can help you with:
• Your profile information (blood type, account details, etc.)
• General health and medical questions
• Organ donation information
• Platform guidance and support

What would you like to know?` };
        }
        
        if (lowerQuestion.includes('organ donation') || lowerQuestion.includes('donate organ')) {
            return { answer: "Organ donation is a life-saving medical process where healthy organs from a donor are transplanted to recipients who need them. It can save multiple lives - one donor can potentially help up to 8 people through organ donation and many more through tissue donation. Would you like to know more about the donation process or your profile?" };
        }
        
        if (lowerQuestion.includes('blood type') && lowerQuestion.includes('important')) {
            return { answer: "Blood type compatibility is crucial for organ transplantation. Donors and recipients must have compatible blood types to prevent rejection. Your blood type determines which organs you can donate or receive. Type O donors are universal donors for many organs, while Type AB recipients can often receive from multiple blood types." };
        }

        // Default response for unrecognized questions
        return { 
            answer: `I can help you with information about your profile${
                profile.role === 'donor' ? ' (including organs you\'re willing to donate)' : 
                profile.role === 'recipient' ? ' (including organs you need)' : ''
            }, general health questions, or organ donation information. You can ask me about your blood type, account details, medical conditions, or general health topics. What would you like to know?` 
        };

    } catch (error) {
        console.error("Error in askAISimple:", error);
        return { error: "Sorry, I'm having trouble accessing your profile information right now." };
    }
}