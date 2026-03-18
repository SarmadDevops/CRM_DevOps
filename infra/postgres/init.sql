-- Global database is already created via POSTGRES_DB env var
-- This runs on first startup

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Super admins table (global)
CREATE TABLE IF NOT EXISTS super_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tenants table (global)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    plan VARCHAR(20) DEFAULT 'starter',
    status VARCHAR(20) DEFAULT 'trial',
    max_agents INT DEFAULT 5,
    max_channels INT DEFAULT 3,
    db_schema VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- Seed first super admin (password: Admin@123)
INSERT INTO super_admins (email, password_hash, name)
VALUES (
    'admin@crm.com',
    '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqQqQqQqQqQqQ',
    'Super Admin'
) ON CONFLICT DO NOTHING;

SELECT 'Database initialized successfully' AS status;
```

---

### Step 9 — Create .gitignore

Open `.gitignore` and paste:
```
node_modules/
dist/
.env
*.log
.DS_Store