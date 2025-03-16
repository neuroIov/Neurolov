-- Enable RLS
ALTER TABLE model_likes ENABLE ROW LEVEL SECURITY;

-- Policy for inserting likes (only authenticated users can like)
CREATE POLICY "Users can create their own likes"
ON model_likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy for deleting likes (users can only delete their own likes)
CREATE POLICY "Users can delete their own likes"
ON model_likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Policy for viewing likes (everyone can view all likes)
CREATE POLICY "Anyone can view likes"
ON model_likes FOR SELECT
TO authenticated
USING (true);

-- Grant access to the view
GRANT SELECT ON model_like_counts TO authenticated;
