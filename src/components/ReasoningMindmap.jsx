import React, { useCallback, useState, useRef, useEffect } from 'react';
import ReactFlow, {
  MiniMap, Controls, Background, useNodesState, useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { parseReasoning, generateSummaryText, generateShareableUrl, decodeShareableUrl } from '../utils/parseReasoning';
import NeuralBackground from './NeuralBackground';
import Header from './Header';
import AdBanner from './AdBanner';

const sampleTexts = [
  `Let me analyze this step by step.

First, I need to understand the core problem. The user wants a reasoning visualizer.

Let me consider the options. We could use React Flow for the graph layer. It provides zoom, pan, and node interaction out of the box.

Alternatively, we could use D3.js for more custom rendering. But that would take significantly longer to implement.

Wait, that approach has a problem. D3.js doesn't handle zooming and panning as smoothly for interactive graphs.

Actually, I think the right approach is React Flow. It's purpose-built for this.

But this doesn't consider mobile. React Flow has some mobile limitations.

However, for an MVP we can optimize desktop first and add mobile later.

So the final architecture is: React + Vite + React Flow for the frontend, with a custom parser for reasoning text.`,

  `I need to calculate the total cost.

First, add up the base costs: $29.99 for the main item, $14.50 for accessories. That gives us $44.49.

Now, the promotion offers 15% off for orders over $40. Our subtotal qualifies.

15% of $44.49 is $6.67, so the discounted price would be $37.82.

Alternatively, we could apply the loyalty discount of 10% instead, which would be $4.45 off.

The 15% promotion gives a better discount, so let's use that.

Next, add sales tax at 8.5%. 8.5% of $37.82 is $3.21.

Let me double-check: $44.49 - $6.67 = $37.82. $37.82 × 0.085 = $3.21.

Therefore, the final total is $41.03. The answer is $41.03.`,
];

export default function ReasoningMindmap() {
  const [inputText, setInputText] = useState(() => decodeShareableUrl() || '');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('input');
  const [showInfo, setShowInfo] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [copied, setCopied] = useState(false);
  const reactFlowWrapper = useRef(null);
  const textareaRef = useRef(null);
  const animFrameRef = useRef(0);

  // Auto-parse from shareable URL on mount
  useEffect(() => {
    const text = decodeShareableUrl();
    if (text) {
      setInputText(text);
      const result = parseReasoning(text);
      setNodes(result.nodes);
      setEdges(result.edges);
      setSummary(result.summary);
      setActiveTab('graph');
    }
  }, []);

  const handleParse = useCallback(() => {
    if (!inputText.trim()) return;
    const result = parseReasoning(inputText);
    setNodes(result.nodes);
    setEdges(result.edges);
    setSummary(result.summary);
    setActiveTab('graph');
    setSelectedNode(null);
    animFrameRef.current = Date.now();
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
    // Highlight animation
    document.querySelectorAll('.react-flow__node').forEach(n => n.style.opacity = '0.4');
    setTimeout(() => {
      document.querySelectorAll('.react-flow__node').forEach(n => n.style.opacity = '1');
    }, 800);
  }, []);

  const handleExportPng = useCallback(async () => {
    if (!reactFlowWrapper.current) return;
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(reactFlowWrapper.current.querySelector('.react-flow'), {
        backgroundColor: '#070b15',
        pixelRatio: 2,
      });
      const a = document.createElement('a');
      a.download = 'ai-xray-mindmap.png';
      a.href = dataUrl;
      a.click();
    } catch (e) {
      // Fallback to text export
      if (!summary) return;
      const text = generateSummaryText(summary);
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ai-xray-analysis.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [summary]);

  const handleShare = useCallback(() => {
    const url = generateShareableUrl(inputText);
    if (url) {
      navigator.clipboard?.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        window.prompt('Copy this shareable URL:', url);
      });
    }
  }, [inputText]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleParse();
  }, [handleParse]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <NeuralBackground isActive={nodes.length === 0} />
      <Header onShowInfo={() => setShowInfo(!showInfo)} />

      {showInfo && (
        <div style={{
          background: '#1e293b', borderBottom: '1px solid #334155', position: 'relative', zIndex: 10,
          padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6,
          animation: 'fadeInUp 0.3s ease',
        }}>
          <strong style={{ color: '#e2e8f0' }}>How AI X-Ray Works</strong>
          <p style={{ marginTop: '0.5rem' }}>
            Paste any AI reasoning text and the parser identifies reasoning steps, corrections, branches, insights, and conclusions.
            Each node type has its own color and icon. Click any node to see full text. Zoom/pan to explore.
            Export as PNG or share via URL. No signup required.
          </p>
        </div>
      )}

      <div className="split-panel" style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        {/* Input Panel */}
        <div className="panel-input" style={{
          width: activeTab === 'graph' ? '35%' : '50%', minWidth: '280px',
          display: 'flex', flexDirection: 'column',
          borderRight: '1px solid #1e293b',
          background: 'rgba(7, 11, 21, 0.95)', backdropFilter: 'blur(8px)',
          transition: 'width 0.3s ease',
        }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #1e293b' }}>
            <button onClick={() => setActiveTab('input')} style={{
              flex: 1, padding: '0.7rem 1rem',
              background: activeTab === 'input' ? '#1e293b' : 'transparent',
              border: 'none', borderBottom: activeTab === 'input' ? '2px solid #22d3ee' : '2px solid transparent',
              color: activeTab === 'input' ? '#e2e8f0' : '#475569',
              fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: '0.2s ease',
            }}>✏️ Input</button>
            <button onClick={() => setActiveTab('graph')} style={{
              flex: 1, padding: '0.7rem 1rem',
              background: activeTab === 'graph' ? '#1e293b' : 'transparent',
              border: 'none', borderBottom: activeTab === 'graph' ? '2px solid #22d3ee' : '2px solid transparent',
              color: activeTab === 'graph' ? '#e2e8f0' : '#475569',
              fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: '0.2s ease',
            }}>
              🗺️ Graph {summary && <span style={{ color: '#22d3ee', fontSize: '0.7rem', marginLeft: '0.2rem' }}>({summary.totalSteps})</span>}
            </button>
          </div>

          {activeTab === 'input' ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem' }}>
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Paste AI reasoning text here..."
                style={{
                  flex: 1, minHeight: '200px',
                  background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #1e293b',
                  borderRadius: '0.75rem', padding: '1rem',
                  color: '#e2e8f0', fontSize: '0.85rem',
                  fontFamily: "'JetBrains Mono', monospace",
                  resize: 'none', lineHeight: 1.7, outline: 'none',
                  transition: 'border 0.3s ease',
                }}
                onFocus={e => e.target.style.borderColor = '#22d3ee'}
                onBlur={e => e.target.style.borderColor = '#1e293b'}
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button onClick={handleParse} disabled={!inputText.trim()}
                  style={{
                    background: 'linear-gradient(135deg, #0891b2, #6366f1)',
                    color: 'white', border: 'none',
                    padding: '0.65rem 1.25rem', borderRadius: '0.5rem',
                    fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                    opacity: !inputText.trim() ? 0.4 : 1,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
                  }}
                >🧠 Visualize</button>
                {sampleTexts.map((t, i) => (
                  <button key={i} onClick={() => loadSample(t)}
                    style={{
                      background: 'rgba(30, 41, 59, 0.8)', border: '1px solid #334155',
                      color: '#94a3b8', padding: '0.4rem 0.75rem',
                      borderRadius: '0.5rem', fontSize: '0.75rem', cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseOver={e => { e.target.style.background = '#334155'; e.target.style.color = '#e2e8f0'; }}
                    onMouseOut={e => { e.target.style.background = 'rgba(30,41,59,0.8)'; e.target.style.color = '#94a3b8'; }}
                  >
                    Sample {i + 1}
                  </button>
                ))}
                <button onClick={handleClear}
                  style={{
                    background: 'transparent', border: '1px solid #334155',
                    color: '#ef4444', padding: '0.4rem 0.75rem',
                    borderRadius: '0.5rem', fontSize: '0.75rem', cursor: 'pointer',
                    marginLeft: 'auto',
                  }}
                >Clear</button>
              </div>
              <p style={{ color: '#334155', fontSize: '0.65rem', marginTop: '0.5rem', textAlign: 'center' }}>
                ⌘+Enter to visualize
              </p>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem', overflow: 'auto', gap: '0.5rem' }}>
              {summary && (
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Steps', value: summary.totalSteps, color: '#22d3ee', icon: '⚡' },
                    { label: 'Branches', value: summary.branches, color: '#818cf8', icon: '🔄' },
                    { label: 'Corrections', value: summary.corrections, color: '#f87171', icon: '🔴' },
                    { label: 'Insights', value: summary.insights, color: '#facc15', icon: '💡' },
                  ].map((s, i) => (
                    <div key={i} style={{
                      background: 'rgba(30,41,59,0.8)', borderRadius: '0.5rem',
                      padding: '0.4rem 0.6rem', textAlign: 'center', flex: 1, minWidth: 60,
                    }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                      <div style={{ color: '#64748b', fontSize: '0.6rem', fontWeight: 500 }}>{s.icon} {s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {selectedNode && (
                <div style={{
                  background: 'rgba(30,41,59,0.9)', border: '1px solid #334155', borderRadius: '0.75rem',
                  padding: '0.75rem', animation: 'fadeInUp 0.2s ease',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {selectedNode.data.type || 'Step'}
                    </span>
                    <button onClick={() => setSelectedNode(null)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.6 }}>
                    {selectedNode.data.fullText || selectedNode.data.label}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.4rem', marginTop: 'auto', flexWrap: 'wrap' }}>
                <button onClick={handleExportPng} style={{
                  flex: 1, background: '#1e293b', border: '1px solid #334155',
                  color: '#94a3b8', padding: '0.45rem', borderRadius: '0.5rem',
                  fontSize: '0.7rem', cursor: 'pointer', transition: '0.2s',
                }}>📥 Export PNG</button>
                <button onClick={handleShare} style={{
                  flex: 1, background: copied ? '#065f46' : '#1e293b',
                  border: `1px solid ${copied ? '#22c55e' : '#334155'}`,
                  color: copied ? '#6ee7b7' : '#94a3b8',
                  padding: '0.45rem', borderRadius: '0.5rem',
                  fontSize: '0.7rem', cursor: 'pointer', transition: '0.2s',
                }}>{copied ? '✅ Copied!' : '🔗 Share URL'}</button>
              </div>
              <AdBanner compact />
            </div>
          )}
        </div>

        {/* Graph Panel */}
        <div ref={reactFlowWrapper} style={{ flex: 1, position: 'relative', background: '#070b15' }}>
          {nodes.length === 0 ? (
            <div style={{
              height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              color: '#475569', padding: '2rem', position: 'relative', zIndex: 2,
              animation: 'fadeInUp 0.6s ease',
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.6, animation: 'float 3s ease infinite' }}>🧠</div>
              <h2 className="gradient-text-lg" style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                See How AI Thinks
              </h2>
              <p style={{ textAlign: 'center', maxWidth: 420, lineHeight: 1.7, fontSize: '0.9rem', color: '#64748b' }}>
                Paste reasoning text on the left and watch it transform into a glowing, interactive mindmap.
              </p>
              <div style={{ marginTop: '0.75rem', background: 'rgba(30,41,59,0.6)', borderRadius: '0.5rem', padding: '0.6rem 1rem', maxWidth: 400, border: '1px solid #1e293b' }}>
                <code style={{ color: '#64748b', fontSize: '0.7rem' }}>
                  "First, I need to understand the problem... {`\n`}  Alternatively, we could use D3... {`\n`}  Wait, that approach has issues..."
                </code>
              </div>
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                {sampleTexts.map((t, i) => (
                  <button key={i} onClick={() => loadSample(t)}
                    style={{
                      background: 'linear-gradient(135deg, #0891b2, #6366f1)',
                      color: 'white', border: 'none',
                      padding: '0.7rem 1.5rem', borderRadius: '0.5rem',
                      fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 0 25px rgba(99, 102, 241, 0.3)',
                    }}
                    onMouseOver={e => e.target.style.transform = 'translateY(-2px)'}
                    onMouseOut={e => e.target.style.transform = 'translateY(0)'}
                  >
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
              defaultEdgeOptions={{ animated: true }}
            >
              <Controls style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', button: { color: '#e2e8f0', fill: '#e2e8f0', border: 'none', transition: '0.2s' } }} />
              <MiniMap
                style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '0.5rem' }}
                nodeColor={(n) =>
                  n.data?.type === 'end' ? '#22c55e' :
                  n.data?.type === 'correction' ? '#ef4444' :
                  n.data?.type === 'branch' ? '#818cf8' :
                  n.data?.type === 'insight' ? '#facc15' :
                  n.data?.type === 'input' ? '#22d3ee' : '#475569'
                }
                maskColor="rgba(7, 11, 21, 0.8)"
              />
              <Background color="#1e293b" gap={28} size={2} />
            </ReactFlow>
          )}
        </div>
      </div>
    </div>
  );
}