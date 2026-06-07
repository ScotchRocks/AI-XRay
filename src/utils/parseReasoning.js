/**
 * AI Reasoning Chain Parser
 * Parses AI reasoning text (DeepSeek R1, Claude, etc.) into a graph structure
 * with nodes and edges for visualization as an interactive mindmap.
 */

/**
 * Parse a block of AI reasoning text into a graph
 * @param {string} text - Raw AI reasoning/thinking text
 * @returns {{ nodes: Array, edges: Array, summary: object }}
 */
export function parseReasoning(text) {
  if (!text || text.trim().length < 10) {
    return { nodes: [], edges: [], summary: { error: 'Text too short to analyze' } };
  }

  const lines = text.split('\n').filter(l => l.trim());
  const steps = [];

  // Detect format: thinking/response (DeepSeek), numbered steps, or plain
  const hasThinking = text.includes('</think>') || text.includes('');
  
  let currentStep = null;
  let stepIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check for reasoning step indicators
    const isNewStep = 
      /^\d+[\.\)]\s/.test(line) ||                    // "1. " or "1) "
      /^##?\s/.test(line) ||                           // Markdown headings
      /^Step\s+\d+/i.test(line) ||                     // "Step 1"
      line.startsWith(' thinking') ||                   // DeepSeek thinking tag
      line.startsWith('') ||
      line.startsWith('Alternatively') ||
      line.startsWith('Another') ||
      line.startsWith('Let me') ||
      /^(First|Second|Third|Finally|Next)\b/i.test(line);

    // Check for branch indicators
    const isBranch = 
      /^(Alternatively|Another approach|Another way|Option|Possibly|Could also)/i.test(line);

    // Check for dead-end indicators
    const isDeadEnd =
      /^(But this doesn't|However.*not|This fails because|This won't work|Discard|Abandon)/i.test(line);

    // Check for conclusion
    const isConclusion =
      /^(Therefore|Thus|So|In conclusion|Finally|The answer|The result|I think|Answer:)/i.test(line);

    if (isNewStep || isBranch || isDeadEnd || isConclusion) {
      if (currentStep) {
        steps.push(currentStep);
      }
      currentStep = {
        id: `step-${stepIndex++}`,
        text: line,
        fullText: line,
        type: isConclusion ? 'conclusion' : isDeadEnd ? 'deadend' : isBranch ? 'branch' : 'step',
        depth: 0,
        children: [],
      };
    } else if (currentStep) {
      currentStep.fullText += '\n' + line;
    } else {
      // First lines without a clear step header
      currentStep = {
        id: `step-${stepIndex++}`,
        text: line.slice(0, 80) + (line.length > 80 ? '...' : ''),
        fullText: line,
        type: 'step',
        depth: 0,
        children: [],
      };
    }
  }
  if (currentStep) steps.push(currentStep);

  // Build graph nodes and edges
  const nodes = [];
  const edges = [];
  const summary = {
    totalSteps: steps.length,
    branches: 0,
    deadEnds: 0,
    keyInsights: [],
  };

  // Root node — the input
  nodes.push({
    id: 'root',
    type: 'input',
    position: { x: 400, y: 0 },
    data: { 
      label: '🧠 AI Reasoning',
      description: text.slice(0, 120) + (text.length > 120 ? '...' : ''),
    },
    style: {
      background: 'linear-gradient(135deg, #1e293b, #334155)',
      border: '2px solid #22d3ee',
      borderRadius: '12px',
      color: '#e2e8f0',
      padding: '12px 20px',
      fontWeight: 700,
      fontSize: '14px',
      boxShadow: '0 0 30px rgba(34, 211, 238, 0.2)',
    },
  });

  // Determine layout: branching tree
  let prevId = 'root';
  let xOffset = 0;
  const ySpacing = 120;
  const xSpacing = 280;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const nodeId = step.id;
    
    // Determine which branch column
    if (step.type === 'branch') {
      xOffset += xSpacing;
    } else if (step.type === 'deadend' || step.type === 'conclusion') {
      // Keep same column but offset
    }

    // Node styling based on type
    let bg, border, glow;
    if (step.type === 'conclusion') {
      bg = 'linear-gradient(135deg, #065f46, #047857)';
      border = '#22c55e';
      glow = '0 0 20px rgba(34, 197, 94, 0.3)';
    } else if (step.type === 'deadend') {
      bg = 'linear-gradient(135deg, #7f1d1d, #991b1b)';
      border = '#ef4444';
      glow = '0 0 20px rgba(239, 68, 68, 0.2)';
    } else if (step.type === 'branch') {
      bg = 'linear-gradient(135deg, #1e1b4b, #312e81)';
      border = '#818cf8';
      glow = '0 0 20px rgba(129, 140, 248, 0.2)';
    } else {
      bg = 'linear-gradient(135deg, #0f172a, #1e293b)';
      border = '#475569';
      glow = '0 0 10px rgba(71, 85, 105, 0.1)';
    }

    const xPos = 400 + (step.type === 'branch' ? xOffset : step.type === 'deadend' ? -xSpacing : 0);
    const yPos = (i + 1) * ySpacing;

    nodes.push({
      id: nodeId,
      type: 'default',
      position: { x: xPos, y: yPos },
      data: { 
        label: step.text.slice(0, 50) + (step.text.length > 50 ? '...' : ''),
        fullText: step.fullText,
        type: step.type,
      },
      style: {
        background: bg,
        border: `2px solid ${border}`,
        borderRadius: '10px',
        color: '#e2e8f0',
        padding: '10px 16px',
        fontWeight: step.type === 'conclusion' ? 700 : 500,
        fontSize: '12px',
        maxWidth: '240px',
        boxShadow: glow,
      },
    });

    // Edge from previous node
    const edgeColor = step.type === 'conclusion' ? '#22c55e' : 
                      step.type === 'deadend' ? '#ef4444' : 
                      step.type === 'branch' ? '#818cf8' : '#475569';

    edges.push({
      id: `e-${prevId}-${nodeId}`,
      source: prevId,
      target: nodeId,
      animated: step.type === 'conclusion',
      style: { stroke: edgeColor, strokeWidth: 2 },
      label: step.type === 'branch' ? 'Alternative' : 
             step.type === 'deadend' ? 'Dead End' : 
             step.type === 'conclusion' ? '✓ Solution' : '',
      labelStyle: { fill: edgeColor, fontWeight: 600, fontSize: 10 },
    });

    // Dead-ends and branches get a visual indicator in summary
    if (step.type === 'branch') {
      summary.branches++;
      summary.keyInsights.push(`Explored alternative: "${step.text.slice(0, 60)}..."`);
    }
    if (step.type === 'deadend') {
      summary.deadEnds++;
      summary.keyInsights.push(`Discarded path: "${step.text.slice(0, 60)}..."`);
    }

    prevId = nodeId;
  }

  return { nodes, edges, summary };
}

/**
 * Generate a shareable text summary of the reasoning chain
 */
export function generateSummaryText(summary) {
  return `AI X-Ray Analysis
• ${summary.totalSteps} reasoning steps identified
• ${summary.branches} alternative paths explored
• ${summary.deadEnds} dead-ends abandoned
${summary.keyInsights.length > 0 ? '\nKey Insights:\n' + summary.keyInsights.map(k => '• ' + k).join('\n') : ''}`;
}

/**
 * Generate a shareable URL that encodes the reasoning text
 * Uses URL-safe base64 encoding for the reasoning text
 */
export function generateShareableUrl(text) {
  if (!text) return null;
  try {
    const encoded = btoa(encodeURIComponent(text));
    const url = new URL(window.location.href);
    url.searchParams.set('r', encoded);
    return url.toString();
  } catch {
    // Fallback for very long texts — use a hash fragment
    const short = text.slice(0, 500);
    const encoded = btoa(encodeURIComponent(short));
    const url = new URL(window.location.href);
    url.searchParams.set('r', encoded);
    url.searchParams.set('truncated', 'true');
    return url.toString();
  }
}

/**
 * Decode reasoning text from a shareable URL
 */
export function decodeShareableUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('r');
    if (!encoded) return null;
    return decodeURIComponent(atob(encoded));
  } catch {
    return null;
  }
}