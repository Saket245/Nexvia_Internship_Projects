
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS workspaces (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    icon VARCHAR(64) DEFAULT '🚀',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    avatar VARCHAR(512),
    color VARCHAR(32) NOT NULL DEFAULT '#6366f1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workspace_members (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL DEFAULT 'editor',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_workspace_member UNIQUE (workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title VARCHAR(512) NOT NULL DEFAULT 'Untitled Document',
    icon VARCHAR(64) DEFAULT '📄',
    cover_image VARCHAR(512),
    content TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_blocks (
    id VARCHAR(64) PRIMARY KEY,
    document_id VARCHAR(64) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    type VARCHAR(64) NOT NULL DEFAULT 'paragraph',
    content TEXT NOT NULL DEFAULT '',
    order_index INT NOT NULL DEFAULT 0,
    properties JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS canvases (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title VARCHAR(512) NOT NULL DEFAULT 'Untitled Canvas',
    icon VARCHAR(64) DEFAULT '🎨',
    background VARCHAR(32) DEFAULT '#f8fafc',
    zoom FLOAT DEFAULT 1.0,
    pan_x FLOAT DEFAULT 0.0,
    pan_y FLOAT DEFAULT 0.0,
    created_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS canvas_elements (
    id VARCHAR(64) PRIMARY KEY,
    canvas_id VARCHAR(64) NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
    type VARCHAR(64) NOT NULL,
    x FLOAT NOT NULL DEFAULT 0,
    y FLOAT NOT NULL DEFAULT 0,
    width FLOAT NOT NULL DEFAULT 200,
    height FLOAT NOT NULL DEFAULT 160,
    content TEXT DEFAULT '',
    color VARCHAR(64) DEFAULT '#fef08a',
    stroke_color VARCHAR(64) DEFAULT '#cbd5e1',
    stroke_width FLOAT DEFAULT 2,
    z_index INT DEFAULT 1,
    properties JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(64) PRIMARY KEY,
    target_type VARCHAR(32) NOT NULL,
    target_id VARCHAR(64) NOT NULL,
    author_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_snapshots (
    id VARCHAR(64) PRIMARY KEY,
    document_id VARCHAR(64) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    title VARCHAR(512) NOT NULL,
    content TEXT NOT NULL,
    created_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    entity_title VARCHAR(512) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_workspace ON documents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_document_blocks_doc ON document_blocks(document_id, order_index);
CREATE INDEX IF NOT EXISTS idx_canvases_workspace ON canvases(workspace_id);
CREATE INDEX IF NOT EXISTS idx_canvas_elements_canvas ON canvas_elements(canvas_id);
CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_activities_workspace ON activities(workspace_id, created_at DESC);

CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_workspaces_updated ON workspaces;
CREATE TRIGGER trg_workspaces_updated BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_users_updated ON users;
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_documents_updated ON documents;
CREATE TRIGGER trg_documents_updated BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_document_blocks_updated ON document_blocks;
CREATE TRIGGER trg_document_blocks_updated BEFORE UPDATE ON document_blocks FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_canvases_updated ON canvases;
CREATE TRIGGER trg_canvases_updated BEFORE UPDATE ON canvases FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_canvas_elements_updated ON canvas_elements;
CREATE TRIGGER trg_canvas_elements_updated BEFORE UPDATE ON canvas_elements FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

INSERT INTO workspaces (id, name, slug, icon)
VALUES ('ws-default', 'Engineering & Design Core', 'engineering-core', '⚡')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, name, email, avatar, color) VALUES
('u-alex', 'Alex Rivers', 'alex@collab.internal', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces', '#6366f1'),
('u-sophia', 'Sophia Chen', 'sophia@collab.internal', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces', '#ec4899'),
('u-david', 'David Kim', 'david@collab.internal', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces', '#10b981')
ON CONFLICT (id) DO NOTHING;

INSERT INTO workspace_members (id, workspace_id, user_id, role) VALUES
('wm-1', 'ws-default', 'u-alex', 'admin'),
('wm-2', 'ws-default', 'u-sophia', 'editor'),
('wm-3', 'ws-default', 'u-david', 'editor')
ON CONFLICT (id) DO NOTHING;

INSERT INTO documents (id, workspace_id, title, icon, cover_image, is_published, created_by)
VALUES (
    'doc-roadmap',
    'ws-default',
    'Product Roadmap & Real-Time CRDT Architecture',
    '🗺️',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&h=500&fit=crop',
    TRUE,
    'u-alex'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO document_blocks (id, document_id, type, content, order_index, properties) VALUES
('b-1', 'doc-roadmap', 'h1', 'Quarterly Collaborative Engine Roadmap', 0, '{"level": 1}'::jsonb),
('b-2', 'doc-roadmap', 'paragraph', 'Our team is shipping conflict-free collaborative editing for high-concurrency documents and infinite visual whiteboards.', 1, '{}'::jsonb),
('b-3', 'doc-roadmap', 'callout', 'High priority: Zero latency peer cursors, instant offline reconnections, and sub-millisecond CRDT sync.', 2, '{"icon": "💡", "color": "amber"}'::jsonb),
('b-4', 'doc-roadmap', 'h2', 'Core Milestones', 3, '{"level": 2}'::jsonb),
('b-5', 'doc-roadmap', 'todo', 'Database-First PostgreSQL schema with automated migration and triggers', 4, '{"checked": true}'::jsonb),
('b-6', 'doc-roadmap', 'todo', 'Express REST API with full Zod payload validation middleware', 5, '{"checked": true}'::jsonb),
('b-7', 'doc-roadmap', 'todo', 'Sub-millisecond WebSockets for live presence and cursor broadcasts', 6, '{"checked": true}'::jsonb),
('b-8', 'doc-roadmap', 'code', 'const syncVector = Y.encodeStateVector(yDoc);\nconst update = Y.encodeStateAsUpdate(yDoc, syncVector);', 7, '{"language": "typescript"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO canvases (id, workspace_id, title, icon, background, zoom, pan_x, pan_y, created_by)
VALUES (
    'canvas-brainstorm',
    'ws-default',
    'System Architecture & Design Whiteboard',
    '🎯',
    '#f8fafc',
    1.0,
    0.0,
    0.0,
    'u-sophia'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO canvas_elements (id, canvas_id, type, x, y, width, height, content, color, stroke_color, stroke_width, z_index, properties) VALUES
('el-1', 'canvas-brainstorm', 'sticky', 160, 140, 220, 180, 'React + TypeScript\nResponsive UI, Slash Menu, FigJam Canvas', '#fef08a', '#facc15', 2, 1, '{"author": "Sophia Chen"}'::jsonb),
('el-2', 'canvas-brainstorm', 'sticky', 440, 140, 220, 180, 'Node.js + Express API\nZod Validation Middleware & Realtime WebSockets', '#bae6fd', '#38bdf8', 2, 2, '{"author": "Alex Rivers"}'::jsonb),
('el-3', 'canvas-brainstorm', 'sticky', 720, 140, 220, 180, 'Database-First PostgreSQL\nRaw SQL DDL + Prisma Client Introspection', '#bbf7d0', '#4ade80', 2, 3, '{"author": "David Kim"}'::jsonb),
('el-4', 'canvas-brainstorm', 'shape', 160, 380, 780, 120, 'Docker Multi-Container Orchestration (Postgres + Redis + App)', '#f1f5f9', '#94a3b8', 2, 0, '{"shapeType": "rectangle", "borderRadius": 12}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO activities (id, workspace_id, user_id, action, entity_type, entity_id, entity_title, details) VALUES
('act-1', 'ws-default', 'u-alex', 'create', 'document', 'doc-roadmap', 'Product Roadmap & Real-Time CRDT Architecture', 'Created initial document with blocks'),
('act-2', 'ws-default', 'u-sophia', 'create', 'canvas', 'canvas-brainstorm', 'System Architecture & Design Whiteboard', 'Created whiteboard with FigJam sticky notes'),
('act-3', 'ws-default', 'u-david', 'update', 'database', 'pg-ddl', 'Database-First Schema', 'Initialized SQL DDL and Prisma introspection')
ON CONFLICT (id) DO NOTHING;
