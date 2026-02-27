-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create slideshows table
CREATE TABLE slideshows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Slideshow',
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create slides table
CREATE TABLE slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slideshow_id UUID NOT NULL REFERENCES slideshows(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  slide_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_slideshow_order UNIQUE (slideshow_id, order_index)
);

-- Create user_profiles table (optional, for future features)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_slideshows_user_id ON slideshows(user_id);
CREATE INDEX idx_slideshows_updated_at ON slideshows(updated_at DESC);
CREATE INDEX idx_slides_slideshow_id ON slides(slideshow_id);
CREATE INDEX idx_slides_order_index ON slides(slideshow_id, order_index);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_slideshows_updated_at
  BEFORE UPDATE ON slideshows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_slides_updated_at
  BEFORE UPDATE ON slides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to check if user owns a slideshow
CREATE OR REPLACE FUNCTION user_owns_slideshow(slideshow_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM slideshows
    WHERE id = slideshow_uuid
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE slideshows ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for slideshows
CREATE POLICY "Users can view their own slideshows"
  ON slideshows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own slideshows"
  ON slideshows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own slideshows"
  ON slideshows FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own slideshows"
  ON slideshows FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for slides
CREATE POLICY "Users can view slides in their slideshows"
  ON slides FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM slideshows
      WHERE slideshows.id = slides.slideshow_id
      AND slideshows.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create slides in their slideshows"
  ON slides FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM slideshows
      WHERE slideshows.id = slides.slideshow_id
      AND slideshows.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update slides in their slideshows"
  ON slides FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM slideshows
      WHERE slideshows.id = slides.slideshow_id
      AND slideshows.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM slideshows
      WHERE slideshows.id = slides.slideshow_id
      AND slideshows.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete slides in their slideshows"
  ON slides FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM slideshows
      WHERE slideshows.id = slides.slideshow_id
      AND slideshows.user_id = auth.uid()
    )
  );

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
