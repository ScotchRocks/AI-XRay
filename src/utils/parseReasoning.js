/**
 * AI Reasoning Chain Parser
 * Parses AI reasoning text into a graph with Start, Step, Correction,
 * Insight, End node types for the mindmap visualization.
 */

export function parseReasoning(text) {
  if (!text || text.trim().length < 10) {
    return { nodes: [], edges: [], summary: { error: 'Text too short' } };
  }

  const lines = text.split('\n').filter(l => l.trim());
  const steps = [];
  let stepIndex = 0;
  let currentStep = null;

  // Detect step boundaries
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const isNewStep = 
      /^\d+[\.\)]\s/.test(line) ||
      /^##?\s/.test(line) ||
      /^Step\s+\d+/i.test(line) ||
      /^(First|Second|Third|Finally|Next)\b/i.test(line) ||
      line.startsWith('Let me') ||
      line.startsWith('I need');

    const isCorrection =
      /^(But|However|Wait|Actually|This doesn't|This fails|This won't work|Discard|Abandon|Let me reconsider)/i.test(line);

    const isAlternative =
      /^(Alternatively|Another approach|Another way|Option|Possibly|Could also|We could)/i.test(line);

    const isInsight =
      /^(I think|I notice|The key|Important|This means|So the)/i.test(line);

    const isEnd =
      /^(Therefore|Thus|So|In conclusion|Finally|The answer is|Answer:)/i.test(line) ||
      i === lines.length - 1;

    let type = 'step';
    if (i === 0 || (steps.length === 0 && !currentStep)) type = 'step';
    else if (isEnd) type = 'end';
    else if (isCorrection) type = 'correction';
    else if (isAlternative) type = 'branch';
    else if (isInsight) type = 'insight';

    if (isNewStep || isCorrection || isAlternative || isInsight || isEnd) {
      if (currentStep) steps.push(currentStep);
      currentStep = {
        id: `step-${stepIndex++}`,
        text: type === 'end' ? (line.length > 50 ? line.slice(0, 50) + '...' : line) : (line.length > 55 ? line.slice(0, 55) + '...' : line),
        fullText: line,
        type,
      };
    } else if (currentStep) {
      currentStep.fullText += '\n' + line;
    }
  }
  if (currentStep) steps.push(currentStep);

  // Build graph
  const nodes = [];
  const edges = [];
  const summary = { totalSteps: steps.length, branches: 0, corrections: 0, insights: 0 };

  // Node style presets
  const nodeStyles = {
    step: { bg: 'linear-gradient(135deg, #1e293b, #0f172a)', border: '#475569', glow: '0 0 10px rgba(71,85,105,0.1)', icon: '⚡' },
    correction: { bg: 'linear-gradient(135deg, #7f1d1d, #450a0a)', border: '#ef4444', glow: '0 0 20px rgba(239,68,68,0.3)', icon: '🔴' },
    branch: { bg: 'linear-gradient(135deg, #1e1b4b, #090810)', border: '#818cf8', glow: '0 0 20px rgba(129,140,248,0.3)', icon: '🔄' },
    insight: { bg: 'linear-gradient(135deg, #713f12, #292524)', border: '#facc15', glow: '0 0 20px rgba(250,204,21,0.2)', icon: '💡' },
    end: { bg: 'linear-gradient(135deg, #065f46, #022c22)', border: '#22c55e', glow: '0 0 25px rgba(34,197,94,0.4)', icon: '✅' },
  };

  // Root node
  nodes.push({
    id: 'root',
    type: 'input',
    position: { x: 400, y: 0 },
    data: { label: '🧠 AI Reasoning', fullText: text.slice(0, 120) + (text.length > 120 ? '...' : '') },
    style: {
      background: 'linear-gradient(135deg, #0891b2, #6366f1)',
      border: '2px solid #22d3ee', borderRadius: '14px',
      color: 'white', padding: '12px 22px', fontWeight: 700, fontSize: '14px',
      boxShadow: '0 0 35px rgba(34,211,238,0.25)',
    },
  });

  let prevId = 'root';
  const ySpacing = 120;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const s = nodeStyles[step.type] || nodeStyles.step;

    const xPos = 400 + (step.type === 'branch' ? 260 : step.type === 'correction' ? -260 : 0);
    const yPos = (i + 1) * ySpacing;

    nodes.push({
      id: step.id,
      type: 'default',
      position: { x: xPos, y: yPos },
      data: {
        label: `${s.icon} ${step.text}`,
        fullText: step.fullText,
        type: step.type,
      },
      className: 'node-hover',
      style: {
        background: s.bg,
        border: `2px solid ${s.border}`, borderRadius: '12px',
        color: '#e2e8f0', padding: '10px 18px',
        fontWeight: step.type === 'end' ? 700 : 500,
        fontSize: '11px', maxWidth: '250px',
        boxShadow: s.glow,
        transition: 'all 0.3s ease',
      },
    });

    const edgeColor = step.type === 'end' ? '#22c55e' : step.type === 'correction' ? '#ef4444' : step.type === 'branch' ? '#818cf8' : step.type === 'insight' ? '#facc15' : '#475569';

    edges.push({
      id: `e-${prevId}-${step.id}`,
      source: prevId,
      target: step.id,
      animated: true,
      style: { stroke: edgeColor, strokeWidth: 2, strokeDasharray: step.type === 'branch' ? '6,3' : undefined },
      label: step.type === 'branch' ? 'Alternative' : step.type === 'correction' ? '✗ Correction' : step.type === 'end' ? '✓ Solution' : '',
      labelStyle: { fill: edgeColor, fontWeight: 700, fontSize: 10, textShadow: '0 0 5px rgba(0,0,0,0.5)' },
    });

    if (step.type === 'branch') summary.branches++;
    if (step.type === 'correction') summary.corrections++;
    if (step.type === 'insight') summary.insights++;
    prevId = step.id;
  }

  return { nodes, edges, summary };
}

export function generateSummaryText(summary) {
  return `AI X-Ray Analysis
• ${summary.totalSteps} reasoning steps
• ${summary.branches} alternative paths explored
• ${summary.corrections} self-corrections
• ${summary.insights} key insights`;
}

export function generateShareableUrl(text) {
  if (!text) return null;
  try {
    const encoded = btoa(encodeURIComponent(text));
    const url = new URL(window.location.href);
    url.searchParams.set('r', encoded);
    return url.toString();
  } catch {
    const short = text.slice(0, 500);
    const encoded = btoa(encodeURIComponent(short));
    const url = new URL(window.location.href);
    url.searchParams.set('r', encoded);
    url.searchParams.set('truncated', 'true');
    return url.toString();
  }
}

export function decodeShareableUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('r');
    if (!encoded) return null;
    return decodeURIComponent(atob(encoded));
  } catch { return null; }
}