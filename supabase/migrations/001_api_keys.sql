-- ================================================
-- HIREGO AI - API KEY MANAGEMENT TABLES
-- Production-Level Secure Storage
-- ================================================

-- Table for AI API Keys (Gemini, OpenAI, Claude, etc.)
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL UNIQUE,
    api_key TEXT,
    client_id TEXT,
    client_secret TEXT,
    access_token TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for YouTube Configuration
CREATE TABLE IF NOT EXISTS youtube_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key TEXT,
    client_id TEXT,
    client_secret TEXT,
    access_token TEXT,
    channel_id VARCHAR(255),
    privacy_status VARCHAR(20) DEFAULT 'private',
    auto_upload BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_api_keys_provider ON api_keys(provider);
CREATE INDEX IF NOT EXISTS idx_api_keys_created_at ON api_keys(created_at);

-- Row Level Security (RLS) Policies
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_config ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated admin users can access API keys
CREATE POLICY "Admin users can view API keys" ON api_keys
    FOR SELECT
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'email' IN (
            SELECT email FROM users WHERE role = 'admin'
        )
    );

CREATE POLICY "Admin users can insert API keys" ON api_keys
    FOR INSERT
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'email' IN (
            SELECT email FROM users WHERE role = 'admin'
        )
    );

CREATE POLICY "Admin users can update API keys" ON api_keys
    FOR UPDATE
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'email' IN (
            SELECT email FROM users WHERE role = 'admin'
        )
    );

-- Similar policies for YouTube config
CREATE POLICY "Admin users can view YouTube config" ON youtube_config
    FOR SELECT
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'email' IN (
            SELECT email FROM users WHERE role = 'admin'
        )
    );

CREATE POLICY "Admin users can insert YouTube config" ON youtube_config
    FOR INSERT
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'email' IN (
            SELECT email FROM users WHERE role = 'admin'
        )
    );

CREATE POLICY "Admin users can update YouTube config" ON youtube_config
    FOR UPDATE
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'email' IN (
            SELECT email FROM users WHERE role = 'admin'
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_api_keys_updated_at
    BEFORE UPDATE ON api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_youtube_config_updated_at
    BEFORE UPDATE ON youtube_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default providers (with null keys - to be filled by admin)
INSERT INTO api_keys (provider, metadata) VALUES
    ('gemini', '{"name": "Google Gemini Pro", "endpoint": "https://generativelanguage.googleapis.com"}'),
    ('gpt4', '{"name": "OpenAI GPT-4", "endpoint": "https://api.openai.com"}'),
    ('claude', '{"name": "Anthropic Claude 3", "endpoint": "https://api.anthropic.com"}'),
    ('deepseek', '{"name": "DeepSeek R1", "endpoint": "https://api.deepseek.com"}')
ON CONFLICT (provider) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE api_keys IS 'Stores encrypted API keys for various AI providers';
COMMENT ON TABLE youtube_config IS 'Stores encrypted YouTube API configuration for video uploads';
COMMENT ON COLUMN api_keys.api_key IS 'Encrypted API key';
COMMENT ON COLUMN api_keys.client_id IS 'Encrypted OAuth client ID';
COMMENT ON COLUMN api_keys.client_secret IS 'Encrypted OAuth client secret';
COMMENT ON COLUMN api_keys.access_token IS 'Encrypted OAuth access token';
COMMENT ON COLUMN api_keys.metadata IS 'Additional provider-specific metadata (not encrypted)';
