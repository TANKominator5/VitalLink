-- Add organ_specific_details columns to store JSON data
-- Run this SQL in your Supabase SQL editor

-- Add to donor_details table
ALTER TABLE donor_details ADD COLUMN IF NOT EXISTS organ_specific_details JSONB DEFAULT '{}';
ALTER TABLE donor_details ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add to recipient_details table  
ALTER TABLE recipient_details ADD COLUMN IF NOT EXISTS organ_specific_details JSONB DEFAULT '{}';
ALTER TABLE recipient_details ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add registration timestamp to profiles for priority matching
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS registered_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_donor_details_organ_specific ON donor_details USING GIN (organ_specific_details);
CREATE INDEX IF NOT EXISTS idx_recipient_details_organ_specific ON recipient_details USING GIN (organ_specific_details);
CREATE INDEX IF NOT EXISTS idx_profiles_registered_at ON profiles (registered_at);

-- Update existing profiles to set registration time (run only once)
UPDATE profiles SET registered_at = created_at WHERE registered_at IS NULL;

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating updated_at
DROP TRIGGER IF EXISTS update_donor_details_updated_at ON donor_details;
CREATE TRIGGER update_donor_details_updated_at BEFORE UPDATE ON donor_details FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_recipient_details_updated_at ON recipient_details;
CREATE TRIGGER update_recipient_details_updated_at BEFORE UPDATE ON recipient_details FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
