async function loadJSON(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json();
}

export async function loadSimulationData() {
  const [leadership, programs, athletes, behaviors, compliance, agents, scenarios, revenue] = await Promise.all([
    loadJSON('./data/leadership.json'),
    loadJSON('./data/programs.json'),
    loadJSON('./data/athletes.json'),
    loadJSON('./data/behaviors.json'),
    loadJSON('./data/compliance.json'),
    loadJSON('./data/agent-evidence.json'),
    loadJSON('./data/scenarios.json'),
    loadJSON('./data/revenue.json')
  ]);

  return {
    leadership,
    programs,
    athletes,
    behaviors,
    compliance,
    agents,
    scenarios,
    revenue
  };
}
