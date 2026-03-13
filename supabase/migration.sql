-- Blog posts
CREATE TABLE IF NOT EXISTS sunisfree_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT,
  cover_image_url TEXT,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  author_id UUID,
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE sunisfree_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "Public can read published posts" ON sunisfree_posts
  FOR SELECT USING (published = true);

-- All operations allowed (security handled at app layer via passphrase)
CREATE POLICY "Allow all operations" ON sunisfree_posts
  FOR ALL USING (true) WITH CHECK (true);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_sunisfree_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sunisfree_posts_updated_at
  BEFORE UPDATE ON sunisfree_posts
  FOR EACH ROW EXECUTE FUNCTION update_sunisfree_updated_at();
