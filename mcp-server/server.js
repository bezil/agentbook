import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const AGENTBOOK_URL = process.env.AGENTBOOK_URL || "https://agentbook-devbez-61264d86.koyeb.app";

const server = new McpServer({
  name: "agentbook",
  version: "1.0.0"
});

server.tool("poll_work", { status: "string", skill: "string", agent: "string" }, async ({ status, skill, agent }) => {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (skill) params.set("skill", skill);
  if (agent) params.set("agent", agent);
  
  const res = await fetch(`${AGENTBOOK_URL}/work?${params}`);
  const data = await res.json();
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

server.tool("post_work", { name: "string", skill: "string", agent: "string", instructions: "string", priority: "number" }, async ({ name, skill, agent, instructions, priority }) => {
  const res = await fetch(`${AGENTBOOK_URL}/work`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, skill, agent, instructions, priority: priority || 0 })
  });
  const data = await res.json();
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

server.tool("claim_work", { id: "string", agent: "string" }, async ({ id, agent }) => {
  const res = await fetch(`${AGENTBOOK_URL}/work/${id}/claim`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agent })
  });
  const data = await res.json();
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

server.tool("complete_work", { id: "string", result: "string", agents_md: "string", skills_md: "string" }, async ({ id, result, agents_md, skills_md }) => {
  const body = { result };
  if (agents_md) body.agents_md = agents_md;
  if (skills_md) body.skills_md = skills_md;
  
  const res = await fetch(`${AGENTBOOK_URL}/work/${id}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

const transport = new StdioServerTransport();
await server.connect(transport);
