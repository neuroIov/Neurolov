-- Create model_likes table
CREATE TABLE IF NOT EXISTS model_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    model_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(model_id, user_id)
);

-- Create view for like counts
CREATE VIEW model_like_counts AS
SELECT 
    model_id,
    7869 + COUNT(*)::INT as like_count
FROM model_likes
GROUP BY model_id;
