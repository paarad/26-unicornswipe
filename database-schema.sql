-- =====================================================
-- UnicornSwipe Database Schema for Supabase
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. STARTUP PITCHES TABLE
-- =====================================================
CREATE TABLE unicornswipe_startup_pitches (
    id BIGSERIAL PRIMARY KEY,
    pitch TEXT NOT NULL,
    is_seed BOOLEAN DEFAULT TRUE,
    category VARCHAR(50),
    source VARCHAR(100) DEFAULT 'seed_data',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Analytics fields
    total_views INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    total_rejects INTEGER DEFAULT 0,
    like_rate DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN (total_likes + total_rejects) > 0 
            THEN (total_likes::DECIMAL / (total_likes + total_rejects)) * 100
            ELSE 0 
        END
    ) STORED
);

-- =====================================================
-- 2. SWIPE SESSIONS TABLE
-- =====================================================
CREATE TABLE unicornswipe_swipe_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- Optional user ID for logged-in users
    session_token VARCHAR(255), -- For anonymous sessions
    
    -- Session metadata
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    is_completed BOOLEAN DEFAULT FALSE,
    
    -- Swipe data (stored as JSONB for flexibility)
    swipes JSONB DEFAULT '[]'::jsonb,
    total_swipes INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    total_rejects INTEGER DEFAULT 0,
    
    -- Generated results
    founder_archetype JSONB,
    startup_pack JSONB,
    
    -- Analytics
    user_agent TEXT,
    ip_address INET,
    country VARCHAR(2),
    device_type VARCHAR(20),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. INDIVIDUAL SWIPE DECISIONS TABLE
-- =====================================================
CREATE TABLE unicornswipe_swipe_decisions (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID REFERENCES unicornswipe_swipe_sessions(id) ON DELETE CASCADE,
    pitch_id BIGINT REFERENCES unicornswipe_startup_pitches(id) ON DELETE CASCADE,
    
    -- Swipe data
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('left', 'right')),
    swipe_order INTEGER NOT NULL, -- Order within the session (1-10)
    
    -- Timing data
    decision_time_ms INTEGER, -- Time taken to make decision
    swiped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(session_id, pitch_id),
    UNIQUE(session_id, swipe_order)
);

-- =====================================================
-- 4. FOUNDER ARCHETYPES TABLE (for predefined types)
-- =====================================================
CREATE TABLE unicornswipe_founder_archetypes (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    traits JSONB NOT NULL, -- Array of trait strings
    emoji VARCHAR(10) NOT NULL,
    color VARCHAR(100) NOT NULL, -- CSS class or color code
    
    -- Criteria for matching
    min_investment_rate DECIMAL(5,2) DEFAULT 0,
    max_investment_rate DECIMAL(5,2) DEFAULT 100,
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. GENERATED STARTUP PACKS TABLE
-- =====================================================
CREATE TABLE unicornswipe_startup_packs (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID REFERENCES unicornswipe_swipe_sessions(id) ON DELETE CASCADE,
    
    company_name VARCHAR(100) NOT NULL,
    user_persona TEXT NOT NULL,
    tagline VARCHAR(200) NOT NULL,
    viral_growth_hack TEXT NOT NULL,
    slogan VARCHAR(200) NOT NULL,
    
    -- Generation metadata
    generated_by VARCHAR(50) DEFAULT 'openai', -- 'openai', 'demo', 'manual'
    generation_prompt TEXT,
    generation_time_ms INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. ANALYTICS & INSIGHTS TABLE
-- =====================================================
CREATE TABLE unicornswipe_analytics (
    id BIGSERIAL PRIMARY KEY,
    
    -- What we're measuring
    event_type VARCHAR(50) NOT NULL, -- 'session_start', 'session_complete', 'pitch_view', 'swipe', 'share'
    event_data JSONB,
    
    -- Session context
    session_id UUID REFERENCES unicornswipe_swipe_sessions(id) ON DELETE CASCADE,
    
    -- User context
    user_agent TEXT,
    ip_address INET,
    referrer TEXT,
    
    -- Timing
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Startup pitches indexes
CREATE INDEX idx_unicornswipe_pitches_active ON unicornswipe_startup_pitches(is_active);
CREATE INDEX idx_unicornswipe_pitches_category ON unicornswipe_startup_pitches(category);
CREATE INDEX idx_unicornswipe_pitches_like_rate ON unicornswipe_startup_pitches(like_rate DESC);

-- Sessions indexes
CREATE INDEX idx_unicornswipe_sessions_completed ON unicornswipe_swipe_sessions(is_completed, completed_at);
CREATE INDEX idx_unicornswipe_sessions_user ON unicornswipe_swipe_sessions(user_id);
CREATE INDEX idx_unicornswipe_sessions_token ON unicornswipe_swipe_sessions(session_token);
CREATE INDEX idx_unicornswipe_sessions_created ON unicornswipe_swipe_sessions(created_at);

-- Swipe decisions indexes
CREATE INDEX idx_unicornswipe_decisions_session ON unicornswipe_swipe_decisions(session_id);
CREATE INDEX idx_unicornswipe_decisions_pitch ON unicornswipe_swipe_decisions(pitch_id);
CREATE INDEX idx_unicornswipe_decisions_direction ON unicornswipe_swipe_decisions(direction);

-- Analytics indexes
CREATE INDEX idx_unicornswipe_analytics_event_type ON unicornswipe_analytics(event_type);
CREATE INDEX idx_unicornswipe_analytics_session ON unicornswipe_analytics(session_id);
CREATE INDEX idx_unicornswipe_analytics_occurred ON unicornswipe_analytics(occurred_at);

-- =====================================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- =====================================================

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables with updated_at
CREATE TRIGGER update_unicornswipe_pitches_updated_at 
    BEFORE UPDATE ON unicornswipe_startup_pitches 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_unicornswipe_sessions_updated_at 
    BEFORE UPDATE ON unicornswipe_swipe_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_unicornswipe_archetypes_updated_at 
    BEFORE UPDATE ON unicornswipe_founder_archetypes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGERS FOR ANALYTICS AUTO-UPDATE
-- =====================================================

-- Function to update pitch analytics
CREATE OR REPLACE FUNCTION update_pitch_analytics()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update pitch view/swipe counts
        UPDATE unicornswipe_startup_pitches 
        SET 
            total_views = total_views + 1,
            total_likes = total_likes + CASE WHEN NEW.direction = 'right' THEN 1 ELSE 0 END,
            total_rejects = total_rejects + CASE WHEN NEW.direction = 'left' THEN 1 ELSE 0 END
        WHERE id = NEW.pitch_id;
        
        -- Update session counts
        UPDATE unicornswipe_swipe_sessions 
        SET 
            total_swipes = total_swipes + 1,
            total_likes = total_likes + CASE WHEN NEW.direction = 'right' THEN 1 ELSE 0 END,
            total_rejects = total_rejects + CASE WHEN NEW.direction = 'left' THEN 1 ELSE 0 END,
            updated_at = NOW()
        WHERE id = NEW.session_id;
        
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_pitch_analytics
    AFTER INSERT ON unicornswipe_swipe_decisions
    FOR EACH ROW EXECUTE FUNCTION update_pitch_analytics();

-- =====================================================
-- RLS (Row Level Security) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE unicornswipe_swipe_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE unicornswipe_swipe_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE unicornswipe_startup_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE unicornswipe_analytics ENABLE ROW LEVEL SECURITY;

-- Public read access to pitches and archetypes (no RLS needed)
-- Sessions: users can only access their own sessions
CREATE POLICY "Users can access own sessions" ON unicornswipe_swipe_sessions
    FOR ALL USING (
        auth.uid() = user_id OR 
        session_token = current_setting('request.headers')::json->>'x-session-token'
    );

-- Swipe decisions: users can only access their own decisions
CREATE POLICY "Users can access own swipe decisions" ON unicornswipe_swipe_decisions
    FOR ALL USING (
        session_id IN (
            SELECT id FROM unicornswipe_swipe_sessions 
            WHERE auth.uid() = user_id OR 
                  session_token = current_setting('request.headers')::json->>'x-session-token'
        )
    );

-- Startup packs: users can only access their own packs
CREATE POLICY "Users can access own startup packs" ON unicornswipe_startup_packs
    FOR ALL USING (
        session_id IN (
            SELECT id FROM unicornswipe_swipe_sessions 
            WHERE auth.uid() = user_id OR 
                  session_token = current_setting('request.headers')::json->>'x-session-token'
        )
    );

-- Analytics: users can only access their own analytics
CREATE POLICY "Users can access own analytics" ON unicornswipe_analytics
    FOR ALL USING (
        session_id IN (
            SELECT id FROM unicornswipe_swipe_sessions 
            WHERE auth.uid() = user_id OR 
                  session_token = current_setting('request.headers')::json->>'x-session-token'
        )
    );

-- =====================================================
-- SEED DATA: Insert predefined founder archetypes
-- =====================================================

INSERT INTO unicornswipe_founder_archetypes (title, description, traits, emoji, color, min_investment_rate, max_investment_rate) VALUES
('The Hype Founder', 'You''re drawn to shiny objects and viral potential. Every startup sounds like the next big thing to you, and you''re not afraid to take risks on bold ideas.', '["Risk-Taker", "Optimistic", "Trend-Spotter", "Ambitious"]', '🚀', 'bg-gradient-to-br from-orange-400 to-red-600', 70, 100),
('The Balanced Visionary', 'You have a keen eye for practical innovation. You can spot real potential while avoiding the obvious traps, making you a thoughtful investor.', '["Strategic", "Analytical", "Visionary", "Prudent"]', '🎯', 'bg-gradient-to-br from-blue-400 to-purple-600', 40, 69),
('The Skeptical Sage', 'You''re incredibly selective and see through the hype. Most ideas don''t impress you, but when you invest, it''s usually gold. Your standards are sky-high.', '["Discerning", "Realistic", "Critical", "Perfectionist"]', '🧙‍♂️', 'bg-gradient-to-br from-gray-400 to-gray-700', 0, 39),
('The Chaos Goblin', 'You''re attracted to the weird, cursed, and absolutely unhinged startup ideas. Normal is boring - you want the chaos and the memes.', '["Unpredictable", "Creative", "Chaotic", "Meme-Lord"]', '👹', 'bg-gradient-to-br from-purple-500 to-pink-600', 60, 100),
('The AI Maximalist', 'Everything must have AI, even if it doesn''t need it. You see artificial intelligence as the solution to every problem, real or imagined.', '["Tech-Forward", "AI-Obsessed", "Futurist", "Disruptor"]', '🤖', 'bg-gradient-to-br from-cyan-400 to-blue-600', 50, 100);

-- =====================================================
-- USEFUL VIEWS FOR ANALYTICS
-- =====================================================

-- Most popular pitches
CREATE VIEW unicornswipe_popular_pitches AS
SELECT 
    p.*,
    ROUND(p.like_rate, 2) as like_percentage,
    p.total_likes + p.total_rejects as total_swipes
FROM unicornswipe_startup_pitches p
WHERE p.is_active = true
ORDER BY p.like_rate DESC, (p.total_likes + p.total_rejects) DESC;

-- Session summary stats
CREATE VIEW unicornswipe_session_stats AS
SELECT 
    s.id,
    s.started_at,
    s.completed_at,
    s.is_completed,
    s.total_swipes,
    s.total_likes,
    s.total_rejects,
    CASE 
        WHEN s.total_swipes > 0 
        THEN ROUND((s.total_likes::DECIMAL / s.total_swipes) * 100, 2)
        ELSE 0 
    END as investment_rate,
    (s.founder_archetype->>'title') as archetype_title,
    (s.startup_pack->>'company_name') as company_name
FROM unicornswipe_swipe_sessions s;

-- Daily analytics
CREATE VIEW unicornswipe_daily_stats AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_sessions,
    COUNT(CASE WHEN is_completed = true THEN 1 END) as completed_sessions,
    AVG(total_swipes) as avg_swipes_per_session,
    AVG(CASE WHEN total_swipes > 0 THEN (total_likes::DECIMAL / total_swipes) * 100 ELSE 0 END) as avg_investment_rate
FROM unicornswipe_swipe_sessions
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- =====================================================
-- FUNCTIONS FOR COMMON OPERATIONS
-- =====================================================

-- Function to get random pitches for a session
CREATE OR REPLACE FUNCTION get_random_pitches(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(id BIGINT, pitch TEXT, is_seed BOOLEAN, category VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.pitch, p.is_seed, p.category
    FROM unicornswipe_startup_pitches p
    WHERE p.is_active = true
    ORDER BY RANDOM()
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to determine founder archetype
CREATE OR REPLACE FUNCTION determine_founder_archetype(investment_rate DECIMAL)
RETURNS TABLE(title VARCHAR, description TEXT, traits JSONB, emoji VARCHAR, color VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT a.title, a.description, a.traits, a.emoji, a.color
    FROM unicornswipe_founder_archetypes a
    WHERE investment_rate >= a.min_investment_rate 
      AND investment_rate <= a.max_investment_rate
      AND a.is_active = true
    ORDER BY (a.max_investment_rate - a.min_investment_rate) ASC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Create a comment with setup instructions
COMMENT ON SCHEMA public IS 'UnicornSwipe Database Schema - Run this script in your Supabase SQL editor to set up all tables, indexes, triggers, and seed data for the UnicornSwipe app.';

SELECT 'UnicornSwipe database schema created successfully! 🦄' as status; 