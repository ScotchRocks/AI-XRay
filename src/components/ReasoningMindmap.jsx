import React, { useCallback, useState, useRef, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toPng } from 'html-to-image';
import { parseReasoning, generateSummaryText, generateShareableUrl } from '../utils/parseReasoning';
import Header from './Header';
import AdBanner from './AdBanner';

const sampleTexts = [
  `Let me think about this step by step.

First, I need to understand the core problem. The user wants to build a visualizer for AI reasoning chains.

Let me consider the architecture options. We could use React Flow for the graph visualization layer. It provides zoom, pan, and node interaction out of the box.

Alternatively, we could use D3.js for more custom rendering. But that would take significantly longer to implement.

Another approach could be using a canvas-based solution with Pixi.js for performance. However, the development time would be much higher.

I think React Flow is the best choice here because it provides the interactivity we need with minimal custom code.

But this doesn't consider mobile support. React Flow has some mobile limitations.

However, for the MVP we can prioritize desktop and add mobile later.

Therefore, the final architecture is: React + Vite + React Flow for the frontend, with a custom parser for the reasoning text.`,

  `I need to calculate the total cost.

First, let's add up the base costs: $29.99 for the main item, $14.50 for accessories.

That gives us $44.49 before any discounts or taxes.

Now, the current promotion offers 15% off for orders over $40. Our subtotal of $44.49 qualifies.

15% of $44.49 is $6.67, so the discounted price would be $37.82.

Alternatively, we could apply the loyalty discount of 10% instead, which would be $4.45 off, bringing it to $40.04.

The 15% promotion gives a better discount, so let's use that.

Next, we need to add sales tax at 8.5%. 8.5% of $37.82 is $3.21.

This brings the final total to $37.82 + $3.21 = $41.03.

Let me double-check: $44.49 - $6.67 = $37.82. $37.82 × 0.085 = $3.2147. $37.82 + $3.21 = $41.03.

The answer is $41.03.`,
];

export default function ReasoningMindmap() {
  const [inputText, setInputText] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('input');
  const [showInfo, setShowInfo] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const textareaRef = useRef(null);

  const handleParse = useCallback(() => {
    if (!inputText.trim()) return;
    const result = parseReasoning(inputText);
    setNodes(result.nodes);
    setEdges(result.edges);
    setSummary(result.summary);
    setActiveTab('graph');
    setSelectedNode(null);
  }, [inputText, setNodes, setEdges]);

  const loadSample = useCallback((text) => {
    setInputText(text);
    const result = parseReasoning(text);
    setNodes(result.nodes);
    setEdges(result.edges);
    setSummary(result.summary);
    setActiveTab('graph');
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  const handleClear = useCallback(() => {
    setInputText('');
    setNodes([]);
    setEdges([]);
    setSummary(null);
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  const handleNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
  }, []);

  const handleExport = useCallback(() => {
    if (!summary) return;
    const text = generateSummaryText(summary);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-xray-analysis.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, [summary]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleParse();
    }
  }, [handleParse]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header onShowInfo={() => setShowInfo(!showInfo)} />

      {showInfo && (
        <div style={{
          background: '#1e293b', borderBottom: '1px solid #334155',
          padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6,
        }}>
          <strong style={{ color: '#e2e8f0' }}>How AI X-Ray Works</strong>
          <p style={{ marginTop: '0.5rem' }}>
            Paste any AI reasoning text — from DeepSeek R1's thinking section, Claude's chain-of-thought, or any LLM output.
            The parser identifies reasoning steps, branches (alternative paths explored), dead-ends (discarded approaches),
            and conclusions. Each node shows a reasoning step, connected by edges showing the flow of thought.
            Click any node to see the full text. Zoom and pan to explore the mindmap.
          </p>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Input Panel */}
        <div style={{
          width: activeTab === 'graph' ? '35%' : '50%',
          minWidth: '320px',
          display: 'flex', flexDirection: 'column',
          borderRight: '1px solid #1e293b',
          background: '#0a1628',
          transition: 'width 0.3s',
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #1e293b' }}>
            <button
              onClick={() => setActiveTab('input')}
              style={{
                flex: 1, padding: '0.6rem 1rem',
                background: activeTab === 'input' ? '#1e293b' : 'transparent',
                border: 'none', borderBottom: activeTab === 'input' ? '2px solid #22d3ee' : '2px solid transparent',
                color: activeTab === 'input' ? '#e2e8f0' : '#64748b',
                fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                transition: '0.15s',
              }}
            >
              ✏️ Input
            </button>
            <button
              onClick={() => setActiveTab('graph')}
              style={{
                flex: 1, padding: '0.6rem 1rem',
                background: activeTab === 'graph' ? '#1e293b' : 'transparent',
                border: 'none', borderBottom: activeTab === 'graph' ? '2px solid #22d3ee' : '2px solid transparent',
                color: activeTab === 'graph' ? '#e2e8f0' : '#64748b',
                fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                transition: '0.15s',
              }}
            >
              🗺️ Graph
              {summary && <span style={{ marginLeft: '0.3rem', color: '#22d3ee', fontSize: '0.7rem' }}>({summary.totalSteps} steps)</span>}
            </button>
          </div>

          {activeTab === 'input' ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem' }}>
              <label style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                Paste AI reasoning text below:
              </label>
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Paste AI reasoning here (DeepSeek R1 thinking, Claude chain-of-thought, etc.)..."
                style={{
                  flex: 1,
                  background: '#0f172a', border: '1px solid #334155',
                  borderRadius: '0.5rem', padding: '0.75rem',
                  color: '#e2e8f0', fontSize: '0.85rem',
                  fontFamily: "'JetBrains Mono', monospace",
                  resize: 'none', lineHeight: 1.6,
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                <button className="glow-blue" onClick={handleParse} disabled={!inputText.trim()}
                  style={{
                    background: 'linear-gradient(135deg, #0891b2, #6366f1)',
                    color: 'white', border: 'none',
                    padding: '0.6rem 1.25rem', borderRadius: '0.5rem',
                    fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                    opacity: !inputText.trim() ? 0.5 : 1,
                  }}>
                  🧠 Visualize
                </button>
                {sampleTexts.map((t, i) => (
                  <button key={i} onClick={() => loadSample(t)}
                    style={{
                      background: '#1e293b', border: '1px solid #334155',
                      color: '#94a3b8', padding: '0.4rem 0.75rem',
                      borderRadius: '0.375rem', fontSize: '0.75rem', cursor: 'pointer',
                    }}>
                    Sample {i + 1}
                  </button>
                ))}
                <button onClick={handleClear}
                  style={{
                    background: '#1e293b', border: '1px solid #334155',
                    color: '#94a3b8', padding: '0.4rem 0.75rem',
                    borderRadius: '0.375rem', fontSize: '0.75rem', cursor: 'pointer',
                    marginLeft: 'auto', color: '#ef4444',
                  }}>
                  Clear
                </button>
              </div>
              <p style={{ color: '#475569', fontSize: '0.7rem', marginTop: '0.5rem', textAlign: 'center' }}>
                Press ⌘+Enter or Ctrl+Enter to visualize
              </p>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem', overflow: 'auto' }}>
              {/* Summary cards */}
              {summary && (
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Steps', value: summary.totalSteps, color: '#22d3ee' },
                    { label: 'Branches', value: summary.branches, color: '#a78bfa' },
                    { label: 'Dead Ends', value: summary.deadEnds, color: '#f87171' },
                  ].map((s, i) => (
                    <div key={i} style={{
                      background: '#1e293b', borderRadius: '0.5rem',
                      padding: '0.5rem 0.75rem', textAlign: 'center', flex: 1, minWidth: 70,
                    }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                      <div style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 500 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected node detail */}
              {selectedNode && (
                <div style={{
                  background: '#1e293b', border: '1px solid #334155',
                  borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '0.75rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>
                      {selectedNode.data.type || 'Step'}
                    </span>
                    <button onClick={() => setSelectedNode(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.5 }}>
                    {selectedNode.data.fullText || selectedNode.data.label}
                  </p>
                </div>
              )}

              {/* Key insights */}
              {summary?.keyInsights?.length > 0 && (
                <div className="card" style={{ padding: '0.75rem' }}>
                  <h4 style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    🔍 Key Insights
                  </h4>
                  {summary.keyInsights.slice(0, 5).map((insight, i) => (
                    <div key={i} style={{
                      padding: '0.35rem 0', fontSize: '0.75rem', color: '#94a3b8',
                      borderBottom: i < summary.keyInsights.length - 1 ? '1px solid #1e293b' : 'none',
                    }}>
                      {insight}
                    </div>
                  ))}
                  <button onClick={handleExport}
                    style={{
                      marginTop: '0.5rem', background: '#0f172a', border: '1px solid #334155',
                      color: '#94a3b8', padding: '0.3rem 0.75rem', borderRadius: '0.375rem',
                      fontSize: '0.7rem', cursor: 'pointer', width: '100%',
                    }}>
                    📥 Export Summary
                  </button>
                </div>
              )}
              
              <AdBanner compact />
            </div>
          )}
        </div>

        {/* Graph Panel */}
        <div style={{ flex: 1, position: 'relative' }}>
          {nodes.length === 0 ? (
            <div style={{
              height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              color: '#475569', padding: '2rem',
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>🧠</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.5rem' }}>
                See the Mind Behind the AI
              </h2>
              <p style={{ textAlign: 'center', maxWidth: 400, lineHeight: 1.6, fontSize: '0.85rem' }}>
                Paste reasoning text on the left, and watch it transform into an interactive,
                glowing mindmap showing the AI's complete thought process.
              </p>
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                {sampleTexts.map((t, i) => (
                  <button key={i} onClick={() => loadSample(t)} className="glow-blue"
                    style={{
                      background: 'linear-gradient(135deg, #0891b2, #6366f1)',
                      color: 'white', border: 'none',
                      padding: '0.6rem 1.25rem', borderRadius: '0.5rem',
                      fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                    }}>
                    Try Sample {i + 1}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={handleNodeClick}
              fitView
              attributionPosition="bottom-left"
              nodesDraggable={true}
              panOnDrag={true}
              zoomOnScroll={true}
            >
              <Controls style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', button: { color: '#e2e8f0', fill: '#e2e8f0' } }} />
              <MiniMap
                style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '0.5rem' }}
                nodeColor={(n) => n.data?.type === 'conclusion' ? '#22c55e' : n.data?.type === 'deadend' ? '#ef4444' : n.data?.type === 'branch' ? '#818cf8' : '#475569'}
              />
              <Background color="#1e293b" gap={24} />
            </ReactFlow>
          )}
        </div>
      </div>

      <AdBanner />
    </div>
  );
}