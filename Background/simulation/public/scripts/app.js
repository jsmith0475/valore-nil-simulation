import { loadSimulationData } from './data-loader.js';

const selectors = {
  leadershipGrid: '.leadership-grid',
  constellation: '.constellation',
  constellationDetail: '.constellation-detail',
  athleteCard: '.athlete-card',
  behaviorRings: '.behavior-rings',
  compliancePanel: '.compliance-panel',
  agentArena: '.agent-corridor',
  agentTranscript: '.agent-transcript',
  court: '.court',
  scenarioControls: '.scenario-controls',
  momentumWave: '.momentum-wave',
  revenueStreams: '.revenue-streams',
  expansionHorizon: '.expansion-horizon',
  heroCta: '.hero__cta'
};

let state = {
  data: null,
  selectedProgram: null,
  selectedAthlete: null,
  selectedScenario: null
};

const agentNotes = {
  'Social Media': 'Tracks engagement velocity and sentiment patterns to quantify parasocial activation.',
  'Performance': 'Benchmarks on-court impact so NIL projections reflect credibility and consistency.',
  'Market Intelligence': 'Evaluates sponsor demand, timing, and payout trends across the NIL marketplace.',
  'Brand Alignment': 'Aligns athlete identity signals with sponsor categories and audience resonance.',
  'Psychology': 'Interprets parasocial bonds and social identity fit using behavioral science frameworks.',
  'Compliance': 'Applies the RAG compliance feed to keep valuations defensible and audit-ready.',
  'Ethics': 'Enforces fairness guardrails and bias mitigation across the entire consensus process.'
};

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const data = await loadSimulationData();
    state.data = data;
    renderAll();
    bindInteractions();
  } catch (error) {
    console.error(error);
    const app = document.getElementById('app');
    if (app) {
      const notice = document.createElement('div');
      notice.className = 'error';
      notice.textContent = 'Simulation data failed to load.';
      app.prepend(notice);
    }
  }
});

function renderAll() {
  renderLeadership(state.data.leadership);
  renderPrograms(state.data.programs);
  const firstProgram = state.data.programs[0];
  if (firstProgram) {
    selectProgram(firstProgram.id);
  }
  renderRevenue(state.data.revenue);
}

function bindInteractions() {
  const heroCta = document.querySelector(selectors.heroCta);
  if (heroCta) {
    heroCta.addEventListener('click', () => {
      const target = document.getElementById('leadership');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
}

function renderLeadership(items) {
  const container = document.querySelector(selectors.leadershipGrid);
  if (!container) return;
  container.innerHTML = '';
  items.forEach(item => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <span class="badge">${item.role}</span>
      <h3 class="card__title">${item.name}</h3>
      <p class="card__subtitle">${item.title}</p>
      <p>${item.mandate}</p>
    `;
    container.appendChild(card);
  });
}

function renderPrograms(programs) {
  const container = document.querySelector(selectors.constellation);
  const detail = document.querySelector(selectors.constellationDetail);
  if (!container || !detail) return;
  container.innerHTML = '';
  programs.forEach(program => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'constellation__item';
    item.setAttribute('data-program', program.id);
    item.innerHTML = `
      <strong>${program.shortLabel}</strong>
      <p>${program.conference}</p>
      <p class="metric">Fan Reach Index: ${formatNumber(program.fanReach.localIndex, 2)}</p>
    `;
    item.addEventListener('click', () => selectProgram(program.id));
    container.appendChild(item);
  });
  detail.innerHTML = '<p>Select a program to see NIL context.</p>';
}

function selectProgram(programId) {
  const program = state.data.programs.find(p => p.id === programId);
  if (!program) return;
  state.selectedProgram = program;
  updateProgramDetail(program);
  const athletes = state.data.athletes.filter(a => a.programId === program.id);
  const athlete = athletes[0] || null;
  if (athlete) {
    state.selectedAthlete = athlete;
    updateAthleteView(athlete);
  }
  const scenario = state.data.scenarios.find(s => s.programId === program.id);
  if (scenario) {
    state.selectedScenario = scenario;
    updateScenario(scenario);
  }
  highlightProgram(program.id);
  updateAgents(program.id);
  updateRevenueFocus(program.id);
}

function updateProgramDetail(program) {
  const detail = document.querySelector(selectors.constellationDetail);
  if (!detail) return;
  detail.innerHTML = `
    <h3>${program.name}</h3>
    <p>${program.narrative}</p>
    <div class="detail-metrics">
      <div><span>Program Phase</span><strong>${program.phase}</strong></div>
      <div><span>Fan Reach</span><strong>${formatNumber(program.fanReach.composite, 2)}</strong></div>
      <div><span>NIL Baseline</span><strong>$${formatThousands(program.nilBaseline)}</strong></div>
      <div><span>Community Nodes</span><strong>${program.communityHighlights.join(', ')}</strong></div>
    </div>
  `;
}

function updateAthleteView(athlete) {
  const card = document.querySelector(selectors.athleteCard);
  const rings = document.querySelector(selectors.behaviorRings);
  const compliance = document.querySelector(selectors.compliancePanel);
  if (!card || !rings || !compliance) return;
  const behavior = state.data.behaviors.find(b => b.id === athlete.behaviorId);
  const complianceItem = state.data.compliance.find(c => c.athleteId === athlete.id);

  card.innerHTML = `
    <h3>${athlete.name}</h3>
    <p>${athlete.position} · ${athlete.classYear}</p>
    <p>${athlete.archetype}</p>
    <div class="athlete-highlights">
      ${athlete.spotlights.map(renderSpotlight).join('')}
    </div>
  `;

  if (behavior) {
    rings.innerHTML = `
      <h4>Behavioral Resonance</h4>
      <ul class="metric-list">
        <li><span>Parasocial Strength</span><strong>${formatNumber(behavior.parasocialStrength)}</strong></li>
        <li><span>Identity Alignment</span><strong>${formatNumber(behavior.identityAlignment)}</strong></li>
        <li><span>Authenticity Signal</span><strong>${formatNumber(behavior.authenticitySignal)}</strong></li>
        <li><span>Community Multiplier</span><strong>${formatNumber(behavior.networkMultiplier)}</strong></li>
      </ul>
      <p class="metric-notes">${behavior.notes.join(' • ')}</p>
      <p class="theory-callout"><strong>Grounded In:</strong> ${behavior.references.join(' • ')}</p>
    `;
  }

  if (complianceItem) {
    compliance.innerHTML = `
      <h4>Compliance Snapshot</h4>
      <p>Status: <strong>${complianceItem.riskLevel}</strong></p>
      <ul>
        ${complianceItem.ruleUpdates.map(rule => `<li>${rule.title} · ${rule.effective}</li>`).join('')}
      </ul>
      <p class="metric-notes">Audit Log: ${complianceItem.auditTrail}</p>
    `;
  }
}

function renderSpotlight(item) {
  return `
    <div class="spotlight">
      <span class="badge">${item.type}</span>
      <p>${item.description}</p>
    </div>
  `;
}

function updateAgents(programId) {
  const arena = document.querySelector(selectors.agentArena);
  const transcript = document.querySelector(selectors.agentTranscript);
  if (!arena || !transcript) return;
  const packet = state.data.agents.find(set => set.programId === programId);
  if (!packet) {
    arena.innerHTML = '';
    transcript.innerHTML = '';
    return;
  }
  arena.innerHTML = packet.evidence.map(agent => {
    const note = agentNotes[agent.name] || 'Synthesizes evidence toward consensus weighting.';
    const confidencePct = Math.round(agent.confidence * 100);
    return `
    <div class="agent-node" style="--color:${agent.color}; --confidence:${agent.confidence};">
      <div class="agent-node__header">
        <span class="agent-node__name">${agent.name}</span>
        <span class="agent-node__confidence">${confidencePct}% confidence</span>
      </div>
      <div class="agent-node__bar"></div>
      <p class="agent-node__note">${note}</p>
    </div>
  `;
  }).join('');

  transcript.innerHTML = `
    <h4>Consensus Outcome</h4>
    <p class="headline">Projected NIL Value: $${formatThousands(packet.consensus.finalValue)}</p>
    <ul>
      ${packet.consensus.rationale.map(item => `<li>${item}</li>`).join('')}
    </ul>
  `;
}

function updateScenario(scenario) {
  const court = document.querySelector(selectors.court);
  const controls = document.querySelector(selectors.scenarioControls);
  const wave = document.querySelector(selectors.momentumWave);
  if (!court || !controls || !wave) return;

  court.innerHTML = scenario.lineup.map((athleteId, index) => {
    const athlete = state.data.athletes.find(a => a.id === athleteId);
    return `<div class="court-node" style="--index:${index}">${athlete ? athlete.name : athleteId}</div>`;
  }).join('');

  controls.innerHTML = `
    <h4>Scenario</h4>
    <p>Opponent: ${scenario.opponent}</p>
    <p>Win Probability: ${formatNumber(scenario.winProbability)}</p>
    <p>NIL Uplift Projection: ${formatNumber(scenario.nilUplift)}</p>
  `;

  wave.innerHTML = `
    <h4>Momentum Wave</h4>
    <div class="wave">
      ${scenario.fanSentiment.map((value, idx) => `<span style="--value:${value}; --i:${idx}"></span>`).join('')}
    </div>
  `;
}

function renderRevenue(entries) {
  const streams = document.querySelector(selectors.revenueStreams);
  const horizon = document.querySelector(selectors.expansionHorizon);
  if (!streams || !horizon) return;
  streams.innerHTML = entries.phase1.map(item => `
    <div class="revenue-card" data-program="${item.programId}">
      <h4>${item.program}</h4>
      <p>POC Licensing: $${formatThousands(item.licensing)}</p>
      <p>Annual Subscription: $${formatThousands(item.subscription)}</p>
    </div>
  `).join('');

  horizon.innerHTML = `
    <h4>Football Expansion</h4>
    <p>Target Launch: Q3 ${entries.phase2.launch}</p>
    <ul>
      ${entries.phase2.targets.map(target => `<li>${target.program} · ${target.highlight}</li>`).join('')}
    </ul>
    ${entries.impactMetrics ? `<div class="impact-metrics"><h5>Impact Targets</h5><ul>${entries.impactMetrics.map(metric => `<li>${metric}</li>`).join('')}</ul></div>` : ''}
  `;
}

function updateRevenueFocus(programId) {
  const cards = document.querySelectorAll('.revenue-card');
  cards.forEach(card => {
    if (card.getAttribute('data-program') === programId) {
      card.classList.add('is-active');
    } else {
      card.classList.remove('is-active');
    }
  });
}

function highlightProgram(programId) {
  const items = document.querySelectorAll('.constellation__item');
  items.forEach(item => {
    if (item.getAttribute('data-program') === programId) {
      item.classList.add('is-active');
    } else {
      item.classList.remove('is-active');
    }
  });
}

function formatNumber(value, decimals = 0) {
  return Number(value).toFixed(decimals);
}

function formatThousands(value) {
  return Number(value).toLocaleString('en-US');
}
