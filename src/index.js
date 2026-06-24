require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'agentbook' });
});

// Create work item
app.post('/work', async (req, res) => {
  const { name, skill, agent, instructions, priority } = req.body;
  
  const { data, error } = await supabase
    .from('works')
    .insert({
      name,
      skill,
      agent,
      instructions,
      priority: priority || 0,
      status: 'pending'
    })
    .select()
    .single();
  
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// List available works
app.get('/work', async (req, res) => {
  const { status, skill, agent } = req.query;
  
  let query = supabase.from('works').select('*');
  
  if (status) query = query.eq('status', status);
  if (skill) query = query.eq('skill', skill);
  if (agent) query = query.eq('agent', agent);
  
  const { data, error } = await query.order('priority', { ascending: false });
  
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Get single work item
app.get('/work/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('works')
    .select('*')
    .eq('id', req.params.id)
    .single();
  
  if (error) return res.status(404).json({ error: 'Not found' });
  res.json(data);
});

// Claim work (agent picks it up)
app.post('/work/:id/claim', async (req, res) => {
  const { agent } = req.body;
  
  const { data, error } = await supabase
    .from('works')
    .update({
      status: 'in_progress',
      agent,
      started_at: new Date().toISOString()
    })
    .eq('id', req.params.id)
    .eq('status', 'pending')
    .select()
    .single();
  
  if (error) return res.status(400).json({ error: error.message });
  if (!data) return res.status(409).json({ error: 'Work already claimed' });
  res.json(data);
});

// Complete work
app.post('/work/:id/complete', async (req, res) => {
  const { result, agents_md, skills_md } = req.body;
  
  const updates = {
    status: 'completed',
    result,
    completed_at: new Date().toISOString()
  };
  
  if (agents_md) updates.agents_md = agents_md;
  if (skills_md) updates.skills_md = skills_md;
  
  const { data, error } = await supabase
    .from('works')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();
  
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Delete work item
app.delete('/work/:id', async (req, res) => {
  const { error } = await supabase
    .from('works')
    .delete()
    .eq('id', req.params.id);
  
  if (error) return res.status(400).json({ error: error.message });
  res.json({ deleted: true });
});

// Get agents.md content
app.get('/agents', async (req, res) => {
  const { data, error } = await supabase
    .from('works')
    .select('name, agent, status, skills_md')
    .not('agents_md', 'is', null)
    .order('completed_at', { ascending: false });
  
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Get skills.md content
app.get('/skills', async (req, res) => {
  const { data, error } = await supabase
    .from('works')
    .select('name, skill, status, skills_md')
    .not('skills_md', 'is', null)
    .order('completed_at', { ascending: false });
  
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`AgentBook running on port ${PORT}`);
});
