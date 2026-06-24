CREATE TABLE works (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  skill TEXT,
  agent TEXT,
  instructions TEXT,
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  result TEXT,
  agents_md TEXT,
  skills_md TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_works_status ON works(status);
CREATE INDEX idx_works_skill ON works(skill);
CREATE INDEX idx_works_agent ON works(agent);
