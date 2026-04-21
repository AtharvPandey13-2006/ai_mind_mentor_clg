import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../i18n/i18n';
import { buildGraphFromInputs } from '../services/knowledgeGraph';
import { Loader2, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const GraphVisualization = ({ nodes = [], links = [], seed = 0, showLabels = true, highContrast = false }) => {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [positions, setPositions] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Initialize deterministic layout with improved positioning
  useEffect(() => {
    const width = 1600;
    const height = 1000;
    const roleNodes = nodes.filter((n) => n.type === 'role');
    const skillNodes = nodes.filter((n) => n.type === 'skill');
    const futureSkillNodes = nodes.filter((n) => n.type === 'future-skill');
    const projectNodes = nodes.filter((n) => n.type === 'project');
    const accountNodes = nodes.filter((n) => n.type === 'account');

    const newPositions = {};
    
    // Debug: Log node counts
    console.log('GraphVisualization nodes:', {
      total: nodes.length,
      roles: roleNodes.length,
      skills: skillNodes.length,
      futureSkills: futureSkillNodes.length,
      projects: projectNodes.length,
      accounts: accountNodes.length
    });
    
    // ==== CLEAN HIERARCHICAL FLOW LAYOUT ====
    const centerX = width / 2;
    const nodeSpacing = 120; // tighter vertical spacing between levels
    let currentY = 100;
    
    // LEVEL 1: Career Goals - Center top
    if (roleNodes.length > 0) {
      const spacing = 280;
      const totalWidth = Math.max(0, (roleNodes.length - 1) * spacing);
      const startX = centerX - totalWidth / 2;
      roleNodes.forEach((n, i) => {
        newPositions[n.id] = { x: startX + i * spacing, y: currentY };
      });
      currentY += nodeSpacing;
    }
    
    // LEVEL 2: Skills - Clean horizontal layout
    if (skillNodes.length > 0) {
      const spacing = 220;
      const itemsPerRow = 4; // Max 4 per row
      const rows = Math.ceil(skillNodes.length / itemsPerRow);
      
      skillNodes.forEach((n, i) => {
        const row = Math.floor(i / itemsPerRow);
        const col = i % itemsPerRow;
        const rowWidth = Math.min(skillNodes.length - row * itemsPerRow, itemsPerRow);
        const totalWidth = (rowWidth - 1) * spacing;
        const startX = centerX - totalWidth / 2;
        
        newPositions[n.id] = {
          x: startX + col * spacing,
          y: currentY + row * 140
        };
      });
      currentY += (Math.ceil(skillNodes.length / itemsPerRow) * 140) + nodeSpacing;
    }
    
    // LEVEL 3: Future Skills - Clean horizontal layout  
    if (futureSkillNodes.length > 0) {
      const spacing = 220;
      const itemsPerRow = 4; // Max 4 per row
      
      futureSkillNodes.forEach((n, i) => {
        const row = Math.floor(i / itemsPerRow);
        const col = i % itemsPerRow;
        const rowWidth = Math.min(futureSkillNodes.length - row * itemsPerRow, itemsPerRow);
        const totalWidth = (rowWidth - 1) * spacing;
        const startX = centerX - totalWidth / 2;
        
        newPositions[n.id] = {
          x: startX + col * spacing,
          y: currentY + row * 140
        };
      });
      currentY += (Math.ceil(futureSkillNodes.length / itemsPerRow) * 140) + nodeSpacing;
    }
    
    // LEVEL 4: Projects - Bottom center
    if (projectNodes.length > 0) {
      const spacing = 250;
      const totalWidth = Math.max(0, (projectNodes.length - 1) * spacing);
      const startX = centerX - totalWidth / 2;
      projectNodes.forEach((n, i) => {
        newPositions[n.id] = { x: startX + i * spacing, y: currentY };
      });
      currentY += nodeSpacing;
    }
    
    // Social Accounts - Bottom horizontal
    if (accountNodes.length > 0) {
      const spacing = 150;
      const totalWidth = Math.max(0, (accountNodes.length - 1) * spacing);
      const startX = centerX - totalWidth / 2;
      accountNodes.forEach((n, i) => {
        newPositions[n.id] = { x: startX + i * spacing, y: currentY };
      });
    }
    
    // Fallback: Position any remaining nodes that weren't categorized
    nodes.forEach((n, i) => {
      if (!newPositions[n.id]) {
        console.warn('Uncategorized node:', n);
        const x = 100 + (i % 5) * 180;
        const y = 100 + Math.floor(i / 5) * 120;
        newPositions[n.id] = { x, y };
      }
    });
    
    console.log('Final positions:', Object.keys(newPositions).length, 'nodes positioned');
    setPositions(newPositions);
  }, [nodes, seed]);

  const getSVGCoordinates = (e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: svgP.x, y: svgP.y };
  };

  const handleMouseDown = (nodeId, e) => {
    e.stopPropagation();
    setDraggedNode(nodeId);
  };

  const handleMouseMove = (e) => {
    if (!draggedNode) return;
    const { x, y } = getSVGCoordinates(e);
    setPositions((prev) => ({ ...prev, [draggedNode]: { x, y } }));
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  const getNodeStyle = (n) => {
    const isHovered = hoveredNode === n.id;
    const isDragged = draggedNode === n.id;
    const isSelected = selectedNode === n.id;
    
    // BRIGHT solid colors for maximum visibility
    const colorMap = {
      'role': { color: '#2563eb', bg: '#dbeafe', gradient: 'from-blue-400 to-blue-600' },
      'skill': { color: '#7c3aed', bg: '#ede9fe', gradient: 'from-purple-400 to-purple-600' },
      'future-skill': { color: '#ea580c', bg: '#fef3c7', gradient: 'from-amber-400 to-orange-500' },
      'project': { color: '#059669', bg: '#d1fae5', gradient: 'from-emerald-400 to-green-600' },
      'account': { color: '#475569', bg: '#e5e7eb', gradient: 'from-gray-400 to-gray-600' }
    };
    
    const style = colorMap[n.type] || colorMap['account'];
    const radius = n.type === 'role' ? 45 : n.type === 'account' ? 35 : n.type === 'project' ? 42 : 40;
    const strokeWidth = isSelected ? 5 : (isHovered || isDragged ? 4 : 3);
    
    return { ...style, radius, strokeWidth, isSelected };
  };

  return (
    <div className="relative overflow-hidden rounded-2xl w-full bg-white p-6 shadow-lg border border-slate-200">
      {/* Stats Dashboard */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-xl shadow-md border border-slate-200 p-4 w-[240px]">
        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <span className="text-lg">📊</span> 
          <span>Career Progress</span>
        </h3>
        
        <div className="space-y-4">
          {/* Skills Mastered */}
          <div className="relative group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <span className="text-xs text-slate-700 font-bold">Skills Mastered</span>
              </div>
              <span className="text-2xl font-black text-purple-600">{nodes.filter(n => n.type === 'skill').length}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-purple-500 h-2 rounded-full" style={{width: '75%'}}></div>
            </div>
          </div>
          
          {/* Skills to Learn */}
          <div className="relative group mt-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                <span className="text-xs text-slate-700 font-bold">Growth Path</span>
              </div>
              <span className="text-2xl font-black text-orange-600">{nodes.filter(n => n.type === 'future-skill').length}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-orange-500 h-2 rounded-full" style={{width: '50%'}}></div>
            </div>
          </div>
          
          {/* Projects */}
          <div className="relative group mt-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💼</span>
                <span className="text-xs text-slate-700 font-bold">Portfolio</span>
              </div>
              <span className="text-2xl font-black text-green-600">{nodes.filter(n => n.type === 'project').length}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-green-500 h-2 rounded-full" style={{width: '65%'}}></div>
            </div>
          </div>
          
          {/* Summary */}
          <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">Total Nodes</span>
              <span className="text-sm font-bold text-slate-700">{nodes.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">Connections</span>
              <span className="text-sm font-bold text-slate-700">{links.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-lg shadow-lg hover:shadow-xl hover:scale-110 transition-all border border-gray-200 flex items-center justify-center text-gray-700 font-bold text-xl"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-lg shadow-lg hover:shadow-xl hover:scale-110 transition-all border border-gray-200 flex items-center justify-center text-gray-700 font-bold text-xl"
          title="Zoom Out"
        >
          −
        </button>
        <button
          onClick={handleResetView}
          className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-lg shadow-lg hover:shadow-xl hover:scale-110 transition-all border border-gray-200 flex items-center justify-center text-gray-700 font-bold text-xs"
          title="Reset View"
        >
          ⟲
        </button>
        <div className="mt-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow-lg text-xs font-bold text-center">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      <svg
        ref={svgRef}
        width="100%"
        height="auto"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid meet"
        className="rounded-lg w-full"
        style={{ maxHeight: '1000px', minHeight: '700px', background: '#fafafa' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Enhanced gradient definitions */}
        <defs>
          {/* Arrow markers for different connection types */}
          <marker id="arrowhead-role" markerWidth="12" markerHeight="12" refX="10" refY="3" orient="auto">
            <polygon points="0 0, 12 3, 0 6" fill="#3b82f6" />
          </marker>
          <marker id="arrowhead-skill" markerWidth="12" markerHeight="12" refX="10" refY="3" orient="auto">
            <polygon points="0 0, 12 3, 0 6" fill="#8b5cf6" />
          </marker>
          <marker id="arrowhead-project" markerWidth="12" markerHeight="12" refX="10" refY="3" orient="auto">
            <polygon points="0 0, 12 3, 0 6" fill="#10b981" />
          </marker>
          <marker id="arrowhead-future" markerWidth="12" markerHeight="12" refX="10" refY="3" orient="auto">
            <polygon points="0 0, 12 3, 0 6" fill="#f59e0b" />
          </marker>
        </defs>

        {/* Apply zoom and pan transform */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
        {/* Connections */}
        {links.map((l, idx) => {
          const s = positions[l.source];
          const t = positions[l.target];
          if (!s || !t) return null;
          const isHighlighted = hoveredNode === l.source || hoveredNode === l.target || selectedNode === l.source || selectedNode === l.target;

          // Determine connection type and color
          const sourceNode = nodes.find(n => n.id === l.source);
          const targetNode = nodes.find(n => n.id === l.target);

          let linkColor = '#cbd5e1'; // Light gray default
          let markerType = 'arrowhead-skill';
          let linkLabel = '';

          if (targetNode?.type === 'role') {
            linkColor = '#3b82f6';
            markerType = 'arrowhead-role';
          } else if (targetNode?.type === 'future-skill') {
            linkColor = '#f59e0b';
            markerType = 'arrowhead-future';
          } else if (targetNode?.type === 'project') {
            linkColor = '#10b981';
            markerType = 'arrowhead-project';
          } else if (targetNode?.type === 'skill') {
            linkColor = '#8b5cf6';
            markerType = 'arrowhead-skill';
          } else if (targetNode?.type === 'account') {
            linkColor = '#94a3b8';
          }

          // Simple curved path for all connections
          const dx = t.x - s.x;
          const dy = t.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const curve = dist * 0.2;
          const cx = (s.x + t.x) / 2 - dy * curve / dist;
          const cy = (s.y + t.y) / 2 + dx * curve / dist;
          const pathD = `M ${s.x} ${s.y} Q ${cx} ${cy} ${t.x} ${t.y}`;
          const labelX = cx;
          const labelY = cy - 15;

          return (
            <g key={idx}>
              {/* Clean simple connection line */}
              <path
                d={pathD}
                stroke={linkColor}
                strokeWidth={isHighlighted ? 3 : 1.5}
                fill="none"
                opacity={isHighlighted ? 0.9 : 0.4}
                markerEnd={`url(#${markerType})`}
                style={{ transition: 'all 0.3s ease' }}
              />
              
              {/* Show label on hover if needed */}
              {isHighlighted && linkLabel && (
                <g style={{ pointerEvents: 'none' }}>
                  <rect
                    x={labelX - linkLabel.length * 3.5}
                    y={labelY - 14}
                    width={linkLabel.length * 7}
                    height={24}
                    rx="12"
                    fill="white"
                    opacity="0.98"
                    stroke={linkColor}
                    strokeWidth="2"
                    filter="url(#dropShadow)"
                  />
                  <text
                    x={labelX}
                    y={labelY + 2}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="700"
                    fill={linkColor}
                  >
                    {linkLabel}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Modern 3D nodes with glass morphism */}
        {nodes.map((n) => {
          const p = positions[n.id];
          if (!p) {
            console.warn('Node missing position:', n.id, n.type, n.label);
            return null;
          }
          const { color, bg, radius, strokeWidth, gradient, isSelected } = getNodeStyle(n);
          const clickable = n.type === 'project' && n.url;
          const isHovered = hoveredNode === n.id;
          const handle = () => { 
            if (clickable) window.open(n.url, '_blank', 'noopener');
            setSelectedNode(n.id === selectedNode ? null : n.id);
          };
          
          // Simple node rendering
          if (nodes.indexOf(n) < 3) {
            console.log('Rendering node:', n.label, 'at', p.x, p.y, 'radius:', radius, 'color:', color);
          }

          const scale = (isHovered || isSelected) ? 1.08 : 1;

          return (
            <g
              key={n.id}
              transform={`translate(${p.x}, ${p.y})`}
              onClick={handle}
              onMouseDown={(e) => handleMouseDown(n.id, e)}
              onMouseEnter={() => setHoveredNode(n.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ 
                cursor: draggedNode === n.id ? 'grabbing' : clickable ? 'pointer' : 'grab', 
                transition: 'all 0.3s ease'
              }}
            >
              <g transform={`scale(${scale})`}>
              {/* Simple shadow on hover */}
              {isHovered && (
                <circle 
                  r={radius + 3} 
                  fill="rgba(0,0,0,0.1)"
                  style={{ pointerEvents: 'none' }}
                />
              )}
              
              {/* Main node - clean flat design */}
              <circle 
                r={radius} 
                fill={color}
                stroke="white" 
                strokeWidth={strokeWidth}
                style={{ transition: 'all 0.2s ease' }}
              />

              {/* Center dot to ensure visibility */}
              <circle r="2.5" fill="#111827" opacity="0.9" style={{ pointerEvents: 'none' }} />
              
              {/* Selection ring */}
              {isSelected && (
                <circle 
                  r={radius + 4} 
                  fill="none"
                  stroke={color} 
                  strokeWidth="3" 
                  opacity="0.6"
                  className="animate-pulse"
                  style={{ pointerEvents: 'none' }}
                />
              )}
              
              {showLabels && (
                <>
                  {/* Simple clean label */}
                  <text 
                    textAnchor="middle" 
                    y="5" 
                    fontSize="12" 
                    fontWeight="600" 
                    fill="white"
                    style={{ pointerEvents: 'none' }}
                  >
                    {n.label.length > 12 ? n.label.substring(0, 12) + '...' : n.label}
                  </text>
                  
                  {/* Simple type indicator below */}
                  {isHovered && (
                    <g>
                      <rect
                        x="-70"
                        y={radius + 25}
                        width="140"
                        height="28"
                        rx="14"
                        fill="rgba(0,0,0,0.85)"
                        filter="url(#dropShadow)"
                      />
                      <text
                        textAnchor="middle"
                        y={radius + 44}
                        fontSize="11"
                        fontWeight="600"
                        fill="white"
                      >
                        {n.type === 'role' ? 'Your Career Target' :
                         n.type === 'skill' ? 'Current Expertise' :
                         n.type === 'future-skill' ? 'Skill to Master' :
                         n.type === 'project' ? 'Portfolio Work' :
                         'Social Profile'}
                      </text>
                    </g>
                  )}
                </>
              )}

              </g>

              {clickable && showLabels && (
                <text 
                  textAnchor="middle" 
                  y={radius + 22} 
                  fontSize="14" 
                  fill={color}
                  fontWeight="700"
                >
                  🔗 Click to open
                </text>
              )}
            </g>
          );
        })}
        </g> {/* Close zoom transform group */}
      </svg>

      {/* Simple Legend */}
      <div className="absolute bottom-4 left-4 bg-white border border-slate-200 rounded-lg shadow-md p-3 z-40" style={{maxWidth: '200px'}}>
        <h4 className="text-xs font-semibold text-slate-700 mb-2">Node Types</h4>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-slate-600">Career Goals</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-slate-600">Skills</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-slate-600">Growth Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-slate-600">Projects</span>
          </div>
        </div>
      </div>

      {/* Enhanced hover tooltip with animations */}
      {hoveredNode && (
        <div className="absolute top-4 right-4 bg-gradient-to-br from-white via-white to-gray-50 backdrop-blur-xl border-2 border-purple-300/50 rounded-2xl shadow-2xl p-4 max-w-sm z-50 animate-in fade-in slide-in-from-right-4 duration-300">
          {(() => {
            const node = nodes.find((n) => n.id === hoveredNode);
            if (!node) return null;
            const { color, gradient } = getNodeStyle(node);
            const connectedLinks = links.filter(l => l.source === node.id || l.target === node.id);
            
            return (
              <div className="space-y-3">
                {/* Header with gradient badge */}
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <span className="text-2xl">
                      {node.type === 'role' ? '🎯' :
                       node.type === 'skill' ? '✨' :
                       node.type === 'future-skill' ? '🚀' :
                       node.type === 'project' ? '💼' : '👤'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide px-2 py-1 bg-gray-100 rounded-full">
                        {node.type.replace('-', ' ')}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg leading-tight">{node.label}</h4>
                  </div>
                </div>
                
                {/* Description */}
                <div className={`p-3 rounded-xl bg-gradient-to-br ${
                  node.type === 'role' ? 'from-blue-50 to-blue-100/50' :
                  node.type === 'skill' ? 'from-purple-50 to-purple-100/50' :
                  node.type === 'future-skill' ? 'from-amber-50 to-orange-100/50' :
                  node.type === 'project' ? 'from-emerald-50 to-green-100/50' :
                  'from-gray-50 to-gray-100/50'
                } border border-${node.type === 'role' ? 'blue' : node.type === 'skill' ? 'purple' : node.type === 'future-skill' ? 'orange' : node.type === 'project' ? 'green' : 'gray'}-200`}>
                  <p className="text-sm text-gray-700 font-medium leading-relaxed">
                    {node.type === 'role' ? '🎯 Your career aspiration and target role' :
                     node.type === 'skill' ? '✅ Current expertise in your skill set' :
                     node.type === 'future-skill' ? '🚀 Recommended skill to boost your career' :
                     node.type === 'project' ? '💼 Portfolio project showcasing your work' :
                     node.type === 'account' ? '👤 Professional profile and online presence' : 'Node information'}
                  </p>
                </div>
                
                {/* URL if available */}
                {node.url && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-blue-600">🔗</span>
                    <a 
                      href={node.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium truncate flex-1 underline"
                    >
                      {node.url.replace(/^https?:\/\/(www\.)?/, '')}
                    </a>
                  </div>
                )}
                
                {/* Connection count */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-xs text-gray-500 font-medium">Connections</span>
                  <div className="flex items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-purple-700">{connectedLinks.length}</span>
                    </div>
                  </div>
                </div>
                
                {/* Interactive hint */}
                <div className="text-xs text-gray-400 italic text-center pt-1 border-t border-gray-100">
                  💡 Drag to reposition • Click to {node.type === 'project' ? 'open' : 'select'}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

const ForceGraph = ({ nodes = [], links = [], seed = 0, showLabels = true, highContrast = false }) => {
  const canvasRef = useRef(null);
  const [size, setSize] = useState({ w: 900, h: 520 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const simRef = useRef({});

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const resize = () => {
      const rect = cvs.parentElement?.getBoundingClientRect();
      const w = Math.floor(rect?.width || 900);
      const h = Math.min(600, Math.max(400, Math.floor(w * 0.6))); // Maintain aspect ratio
      setSize({ w, h });
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    const N = nodes.map((n, i) => ({ id: n.id, label: n.label, type: n.type, x: Math.random() * size.w, y: Math.random() * size.h, vx: 0, vy: 0 }));
    nodes.forEach((n, i) => { if (n.type === 'project' && n.url) N[i].url = n.url; });
    const idToIndex = new Map(N.map((n, i) => [n.id, i]));
    const L = links
      .map((l) => ({ s: idToIndex.get(l.source), t: idToIndex.get(l.target) }))
      .filter((e) => e.s != null && e.t != null);

    simRef.current = { N, L, paused: false };

    let raf;
    const tick = () => {
      const { N, L, paused } = simRef.current;
      if (paused) {
        draw();
        raf = requestAnimationFrame(tick);
        return;
      }

      const repulsion = 1400;
      const springK = 0.06;
      const springLen = 100;
      const friction = 0.86;

      // repulsion
      for (let i = 0; i < N.length; i++) {
        for (let j = i + 1; j < N.length; j++) {
          const dx = N[j].x - N[i].x;
          const dy = N[j].y - N[i].y;
          const d2 = dx * dx + dy * dy + 0.01;
          const f = repulsion / d2;
          const fx = f * dx;
          const fy = f * dy;
          N[i].vx -= fx;
          N[i].vy -= fy;
          N[j].vx += fx;
          N[j].vy += fy;
        }
      }

      // springs
      for (const e of L) {
        const a = N[e.s];
        const b = N[e.t];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
        const delta = (dist - springLen) * springK;
        const fx = (dx / dist) * delta;
        const fy = (dy / dist) * delta;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }

      // integrate
      for (const n of N) {
        if (n.id === draggedNode) continue;
        n.vx *= friction;
        n.vy *= friction;
        n.x += n.vx * 0.5;
        n.y += n.vy * 0.5;
        n.x = Math.max(30, Math.min(size.w - 30, n.x));
        n.y = Math.max(30, Math.min(size.h - 30, n.y));
      }

      draw();
      raf = requestAnimationFrame(tick);
    };

    const ctx = canvasRef.current?.getContext('2d');
    const draw = () => {
      if (!ctx) return;
      // Gradient background
      const gradient = ctx.createLinearGradient(0, 0, size.w, size.h);
      gradient.addColorStop(0, 'rgba(248, 250, 252, 0.95)');
      gradient.addColorStop(0.5, 'rgba(243, 232, 255, 0.9)');
      gradient.addColorStop(1, 'rgba(252, 231, 243, 0.9)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size.w, size.h);

      const { N, L } = simRef.current;

      // links with gradient
      for (const e of L) {
        const a = N[e.s];
        const b = N[e.t];
        const isHighlighted = hoveredNode === a.id || hoveredNode === b.id;
        const linkGradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        linkGradient.addColorStop(0, isHighlighted ? 'rgba(99, 102, 241, 0.9)' : 'rgba(139, 92, 246, 0.6)');
        linkGradient.addColorStop(1, isHighlighted ? 'rgba(139, 92, 246, 0.9)' : 'rgba(99, 102, 241, 0.6)');
        ctx.strokeStyle = linkGradient;
        ctx.lineWidth = isHighlighted ? (highContrast ? 3 : 2.5) : (highContrast ? 2.5 : 2);
        ctx.setLineDash(isHighlighted ? [] : [4, 2]);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // nodes with enhanced gradients and effects
      for (const n of N) {
        const isHovered = hoveredNode === n.id;
        const color = n.type === 'role' ? '#3b82f6' : n.type === 'skill' ? '#8b5cf6' : n.type === 'future-skill' ? '#f59e0b' : n.type === 'project' ? '#10b981' : '#6b7280';
        const colorLight = n.type === 'role' ? '#60a5fa' : n.type === 'skill' ? '#a78bfa' : n.type === 'future-skill' ? '#fbbf24' : n.type === 'project' ? '#34d399' : '#9ca3af';
        const radius = n.type === 'role' ? 16 : n.type === 'account' ? 13 : n.type === 'project' ? 15 : 14;

        // Enhanced glow effect for hover
        if (isHovered) {
          // Outer glow
          ctx.shadowBlur = 20;
          ctx.shadowColor = color;
          ctx.beginPath();
          ctx.arc(n.x, n.y, radius + 12, 0, Math.PI * 2);
          ctx.fillStyle = color + '15';
          ctx.fill();
          
          // Middle glow
          ctx.beginPath();
          ctx.arc(n.x, n.y, radius + 8, 0, Math.PI * 2);
          ctx.fillStyle = color + '25';
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Create gradient for node
        const gradient = ctx.createRadialGradient(n.x - radius/3, n.y - radius/3, 0, n.x, n.y, radius);
        gradient.addColorStop(0, colorLight);
        gradient.addColorStop(1, color);

        // Main node circle with gradient
        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.strokeStyle = highContrast ? '#111827' : 'white';
        ctx.lineWidth = isHovered ? (highContrast ? 4 : 3.5) : (highContrast ? 3 : 2.5);
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Inner highlight for 3D effect
        ctx.beginPath();
        ctx.arc(n.x - radius/4, n.y - radius/4, radius/2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();

        if (showLabels) {
          // Type emoji badge
          ctx.font = isHovered ? '14px sans-serif' : '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const emoji = n.type === 'role' ? '🎯' :
                       n.type === 'skill' ? '✨' :
                       n.type === 'future-skill' ? '🚀' :
                       n.type === 'project' ? '💼' : '👤';
          ctx.fillText(emoji, n.x, n.y - radius - 14);
          
          // Label with shadow
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 3;
          ctx.shadowOffsetY = 1;
          ctx.fillStyle = 'white';
          ctx.font = isHovered ? 'bold 12px sans-serif' : 'bold 11px sans-serif';
          ctx.fillText(n.label, n.x, n.y);
          ctx.shadowBlur = 0;
          ctx.shadowOffsetY = 0;

          // Type badge below
          if (!isHovered) {
            ctx.fillStyle = color;
            ctx.font = 'bold 8px sans-serif';
            ctx.fillText(n.type.replace('-', ' ').toUpperCase(), n.x, n.y + radius + 12);
          }
        }
      }
    };

    // seed initial tiers with better positioning
    for (const n of N) {
      if (n.type === 'role') { 
        n.y = 80; 
        n.x = size.w / 2 + (Math.random() - 0.5) * 100;
      }
      else if (n.type === 'account') { 
        n.y = 150; 
        n.x = size.w / 2 + (Math.random() - 0.5) * 150;
      }
      else if (n.type === 'future-skill') { 
        n.x = size.w * 0.7 + (Math.random() - 0.5) * 100; 
        n.y = size.h / 2 + (Math.random() - 0.5) * 100;
      }
      else if (n.type === 'skill') { 
        n.x = size.w * 0.3 + (Math.random() - 0.5) * 100; 
        n.y = size.h / 2 + (Math.random() - 0.5) * 100;
      }
      else if (n.type === 'project') { 
        n.y = size.h - 80; 
        n.x = size.w / 2 + (Math.random() - 0.5) * 200;
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [nodes, links, size.w, size.h, seed, hoveredNode, draggedNode, highContrast, showLabels]);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;

    const getNodeAt = (x, y) => {
      const { N } = simRef.current;
      if (!N) return null;
      for (const n of N) {
        const dx = n.x - x;
        const dy = n.y - y;
        if (dx * dx + dy * dy <= 15 * 15) return n;
      }
      return null;
    };

    const onClick = (e) => {
      const rect = cvs.getBoundingClientRect();
      const x = ((e.clientX - rect.left) * size.w) / rect.width;
      const y = ((e.clientY - rect.top) * size.h) / rect.height;
      const picked = getNodeAt(x, y);
      if (picked && picked.url) {
        window.open(picked.url, '_blank', 'noopener');
      }
    };

    const onMouseMove = (e) => {
      const rect = cvs.getBoundingClientRect();
      const x = ((e.clientX - rect.left) * size.w) / rect.width;
      const y = ((e.clientY - rect.top) * size.h) / rect.height;
      const node = getNodeAt(x, y);
      setHoveredNode(node ? node.id : null);
      cvs.style.cursor = node ? (node.url ? 'pointer' : 'grab') : 'default';
      if (draggedNode) {
        const dragged = simRef.current.N.find((n) => n.id === draggedNode);
        if (dragged) {
          dragged.x = x;
          dragged.y = y;
          dragged.vx = 0;
          dragged.vy = 0;
        }
      }
    };

    const onMouseDown = (e) => {
      const rect = cvs.getBoundingClientRect();
      const x = ((e.clientX - rect.left) * size.w) / rect.width;
      const y = ((e.clientY - rect.top) * size.h) / rect.height;
      const node = getNodeAt(x, y);
      if (node) {
        setDraggedNode(node.id);
        simRef.current.paused = true;
        cvs.style.cursor = 'grabbing';
      }
    };

    const onMouseUp = () => {
      setDraggedNode(null);
      simRef.current.paused = false;
      cvs.style.cursor = hoveredNode ? 'grab' : 'default';
    };

    cvs.addEventListener('click', onClick);
    cvs.addEventListener('mousemove', onMouseMove);
    cvs.addEventListener('mousedown', onMouseDown);
    cvs.addEventListener('mouseup', onMouseUp);
    cvs.addEventListener('mouseleave', () => {
      setHoveredNode(null);
      onMouseUp();
    });

    return () => {
      cvs.removeEventListener('click', onClick);
      cvs.removeEventListener('mousemove', onMouseMove);
      cvs.removeEventListener('mousedown', onMouseDown);
      cvs.removeEventListener('mouseup', onMouseUp);
    };
  }, [size.w, size.h, hoveredNode, draggedNode]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      <canvas
        ref={canvasRef}
        width={size.w}
        height={size.h}
        className="bg-white rounded-xl border-4 border-purple-200 shadow-lg w-full"
        style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
      />
      {hoveredNode && (
        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-md border-2 border-purple-200 rounded-lg shadow-xl p-3 max-w-xs z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {(() => {
            const node = simRef.current.N?.find((n) => n.id === hoveredNode);
            if (!node) return null;
            return (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: node.type === 'role' ? '#2563eb' : node.type === 'skill' ? '#7c3aed' : node.type === 'future-skill' ? '#f59e0b' : node.type === 'project' ? '#059669' : '#6b7280' }}></span>
                  <span className="text-xs font-bold text-gray-600 uppercase">{node.type}</span>
                </div>
                <p className="font-bold text-gray-800 mb-1">{node.label}</p>
                {node.url && (
                  <p className="text-xs text-blue-600 break-all mb-1">{node.url}</p>
                )}
                <p className="text-xs text-gray-500 italic">
                  {node.type === 'role' ? '🎯 Career target' :
                   node.type === 'skill' ? '✅ Current expertise' :
                   node.type === 'future-skill' ? '🚀 Skill to acquire' :
                   node.type === 'project' ? '💼 Portfolio project (click to open)' :
                   node.type === 'account' ? '👤 Profile link' : ''}
                </p>
                <p className="text-xs text-purple-600 mt-2 font-semibold">💡 Drag to reposition</p>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

const KnowledgeGraph = () => {
  const { t } = useI18n();
  const { user } = useAuthStore();
  const [resume, setResume] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [leetcode, setLeetcode] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [graph, setGraph] = useState({ nodes: [], links: [] });
  const [futureGraph, setFutureGraph] = useState({ nodes: [], links: [] });
  const [suggestions, setSuggestions] = useState({ skills: [], projects: [], roles: [] });
  const [leetcodeStats, setLeetcodeStats] = useState(null);
  const [layout, setLayout] = useState('simple'); // 'simple' | 'force'
  const [errorMsg, setErrorMsg] = useState('');
  const [showLabels, setShowLabels] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [layoutSeed, setLayoutSeed] = useState(0);

  useEffect(() => {
    if (user?.targetCareer && !targetRole) setTargetRole(user.targetCareer);
  }, [user?.targetCareer]);

  // persist inputs
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('brain-inputs') || '{}');
    if (saved.resume) setResume(saved.resume);
    if (saved.github) setGithub(saved.github);
    if (saved.linkedin) setLinkedin(saved.linkedin);
    if (saved.leetcode) setLeetcode(saved.leetcode);
    if (saved.targetRole) setTargetRole(saved.targetRole);
  }, []);
  useEffect(() => {
    localStorage.setItem('brain-inputs', JSON.stringify({ resume, github, linkedin, leetcode, targetRole }));
  }, [resume, github, linkedin, leetcode, targetRole]);

  const buildGraph = async () => {
    setLoading(true);
    try {
      setErrorMsg('');
      const result = await buildGraphFromInputs({ resume, github, linkedin, leetcode, targetRole });
      setGraph({ nodes: result.nodes, links: result.links });
      setSuggestions(result.suggestions);
      setLeetcodeStats(result.leetcode || null);
      // Build Future Graph: target role + recommended skills not in current skills
      const currSkillIds = new Set((result.currentSkills || []).map((s) => `skill:${s}`));
      const target = targetRole || (result.suggestions.roles && result.suggestions.roles[0]) || '';
      const baseNodes = [...result.nodes];
      const baseLinks = [...result.links];
      let roleNodeId = target ? `role:${target}` : null;
      if (roleNodeId && !baseNodes.find((n) => n.id === roleNodeId)) {
        baseNodes.push({ id: roleNodeId, label: target, type: 'role' });
      }
      const futureSkillNodes = [];
      const futureSkillLinks = [];
      (result.suggestions.skills || []).forEach((s) => {
        const id = `skill:${s}`;
        if (!currSkillIds.has(id)) {
          const fid = `future-skill:${s}`;
          if (!baseNodes.find((n) => n.id === fid)) futureSkillNodes.push({ id: fid, label: s, type: 'future-skill' });
          if (roleNodeId) futureSkillLinks.push({ source: roleNodeId, target: fid });
        }
      });
      setFutureGraph({ nodes: [...baseNodes, ...futureSkillNodes], links: [...baseLinks, ...futureSkillLinks] });
    } catch (e) {
      console.error(e);
      setErrorMsg('Could not build the graph. Please try again with resume text and/or a GitHub username.');
      setSuggestions({ skills: [], projects: [], roles: [] });
      setGraph({ nodes: [], links: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = () => {
    const target = targetRole || (suggestions.roles && suggestions.roles[0]) || 'Professional';
    const currentSkills = graph.nodes.filter((n) => n.type === 'skill').map((n) => n.label);
    const futureSkills = futureGraph.nodes.filter((n) => n.type === 'future-skill').slice(0, 5).map((n) => n.label);
    const skills = Array.from(new Set([...(currentSkills || []), ...(futureSkills || [])]));
    const prefill = {
      targetCareer: target,
      currentLevel: 'Beginner',
      skills
    };
    localStorage.setItem('roadmap_prefill', JSON.stringify(prefill));
    localStorage.setItem('roadmap_autogenerate', 'true');
    localStorage.setItem('activeTab', 'roadmap');
    window.dispatchEvent(new CustomEvent('navigateTo', { detail: { tab: 'roadmap' } }));
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      <div className="card">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold gradient-text">{t('graph.title')}</h2>
            <p className="text-xs md:text-sm text-gray-600">{t('graph.ingestTitle')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="bg-white/70 border border-white/60 rounded-lg overflow-hidden">
              <button onClick={() => setLayout('simple')} className={`px-3 py-2 text-xs md:text-sm ${layout==='simple' ? 'bg-purple-100 text-purple-700' : ''}`}>Simple</button>
              <button onClick={() => setLayout('force')} className={`px-3 py-2 text-xs md:text-sm ${layout==='force' ? 'bg-purple-100 text-purple-700' : ''}`}>Force</button>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white/70 border border-white/60 rounded-lg px-2 py-1">
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} />
                Labels
              </label>
              <span className="text-gray-300">|</span>
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" checked={highContrast} onChange={(e) => setHighContrast(e.target.checked)} />
                High Contrast
              </label>
            </div>
            <button onClick={() => setLayoutSeed((s) => s + 1)} className="px-3 py-2 text-xs md:text-sm rounded-lg border border-white/60 bg-white/70 hover:bg-white whitespace-nowrap">Reset</button>
            <button onClick={buildGraph} className="btn-primary flex items-center gap-2 text-xs md:text-sm whitespace-nowrap" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span className="hidden sm:inline">{t('graph.buildGraph')}</span>
            <span className="sm:hidden">Build</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <textarea
            className="input-field min-h-[120px]"
            placeholder={t('graph.resumePlaceholder')}
            value={resume}
            onChange={(e) => setResume(e.target.value)}
          />
          <div className="grid grid-cols-1 gap-3">
            <input className="input-field" placeholder={t('graph.github')} value={github} onChange={(e) => setGithub(e.target.value)} />
            <input className="input-field" placeholder={t('graph.linkedin')} value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
            <input className="input-field" placeholder={t('graph.leetcode')} value={leetcode} onChange={(e) => setLeetcode(e.target.value)} />
            <div className="grid grid-cols-1 gap-2">
              <input className="input-field" placeholder={t('graph.targetRole') || 'Target Role (optional)'} value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
              <select className="input-field" value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
                <option value="">-- Select Common Role --</option>
                <option>Marketing</option>
                <option>Growth Marketing</option>
                <option>Brand Manager</option>
                <option>SEO Specialist</option>
                <option>Product Manager</option>
                <option>UI/UX Designer</option>
                <option>Data Analyst</option>
                <option>AI/ML Engineer</option>
                <option>Software Engineer</option>
                <option>DevOps Engineer</option>
              </select>
            </div>
          </div>
        </div>
        {errorMsg && (
          <div className="mt-3 text-sm text-red-600">{errorMsg}</div>
        )}
      </div>

      <div className="card bg-gradient-to-br from-white/95 via-purple-50/30 to-pink-50/30 shadow-2xl overflow-hidden">
        {graph.nodes.length > 0 && (
          <div className="mb-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4 overflow-x-auto">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl border-2 border-blue-200/50 shadow-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">{graph.nodes.filter(n => n.type === 'role').length}</div>
                  <div className="text-xs text-blue-600 font-semibold uppercase tracking-wide">🎯 Roles</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl border-2 border-purple-200/50 shadow-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-700">{graph.nodes.filter(n => n.type === 'skill').length}</div>
                  <div className="text-xs text-purple-600 font-semibold uppercase tracking-wide">✨ Skills</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-xl border-2 border-orange-200/50 shadow-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-700">{graph.nodes.filter(n => n.type === 'future-skill').length}</div>
                  <div className="text-xs text-orange-600 font-semibold uppercase tracking-wide">🚀 Future</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl border-2 border-green-200/50 shadow-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">{graph.nodes.filter(n => n.type === 'project').length}</div>
                  <div className="text-xs text-green-600 font-semibold uppercase tracking-wide">💼 Projects</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl border-2 border-gray-200/50 shadow-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-700">{graph.links.length}</div>
                  <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide">🔗 Links</div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Legend */}
            <div className="flex flex-wrap items-center gap-2 p-4 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-white/90 shadow-lg">
              <div className="flex items-center gap-2 mr-3">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"></div>
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Legend</span>
              </div>
              <span className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                <span className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white shadow-sm"></span>
                <span className="text-xs font-bold text-blue-700">🎯 Role</span>
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <span className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border-2 border-white shadow-sm"></span>
                <span className="text-xs font-bold text-gray-700">👤 Account</span>
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                <span className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white shadow-sm"></span>
                <span className="text-xs font-bold text-purple-700">✨ Skill</span>
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                <span className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-white shadow-sm"></span>
                <span className="text-xs font-bold text-orange-700">🚀 Future</span>
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                <span className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 border-2 border-white shadow-sm"></span>
                <span className="text-xs font-bold text-green-700">💼 Project</span>
              </span>
            </div>
          </div>
        )}
        {graph.nodes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-5xl">🧠</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Build Your Career Knowledge Graph</h3>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              Visualize your skills, projects, and career path in an interactive graph
            </p>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 max-w-lg mx-auto">
              <p className="text-sm font-semibold text-gray-700 mb-3">📝 To get started:</p>
              <ol className="text-left text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">1.</span>
                  <span>Paste your resume text in the box above</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">2.</span>
                  <span>Add your GitHub username (optional)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">3.</span>
                  <span>Click the <strong>"Build Graph"</strong> button</span>
                </li>
              </ol>
            </div>
            <button
              onClick={() => {
                setResume('Software Engineer with 3 years of experience in React, Node.js, Python, and MongoDB. Built multiple full-stack applications.');
                setGithub('octocat');
                setTargetRole('Full Stack Developer');
                setTimeout(() => buildGraph(), 100);
              }}
              className="mt-6 px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              ✨ Try Sample Data
            </button>
          </div>
        ) : layout === 'simple' ? (
          <>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <h3 className="text-xl md:text-2xl font-bold gradient-text">{t('graph.currentGraph')}</h3>
                <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1.5 rounded-full font-bold shadow-md">Hierarchical View</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                <span className="px-2 py-1 bg-gray-100 rounded-lg">🖱️ Drag nodes</span>
                <span className="px-2 py-1 bg-gray-100 rounded-lg">👆 Hover for info</span>
              </div>
            </div>
            <GraphVisualization nodes={graph.nodes} links={graph.links} seed={layoutSeed} showLabels={showLabels} highContrast={highContrast} />
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <p className="text-sm text-gray-700 text-center flex items-center justify-center gap-2 flex-wrap">
                <span className="font-semibold">💡 Interactive Tips:</span>
                <span className="px-2 py-1 bg-white rounded-lg text-xs">Hover nodes for details</span>
                <span className="px-2 py-1 bg-white rounded-lg text-xs">Drag to reposition</span>
                <span className="px-2 py-1 bg-white rounded-lg text-xs">Click projects to open</span>
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <h3 className="text-xl md:text-2xl font-bold gradient-text">{t('graph.currentGraph')}</h3>
                <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full font-bold shadow-md">Physics Simulation</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                <span className="px-2 py-1 bg-purple-100 rounded-lg animate-pulse">⚡ Live Physics</span>
              </div>
            </div>
            <ForceGraph nodes={graph.nodes} links={graph.links} seed={layoutSeed} showLabels={showLabels} highContrast={highContrast} />
            <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <p className="text-sm text-gray-700 text-center flex items-center justify-center gap-2 flex-wrap">
                <span className="font-semibold">⚡ Physics-Based:</span>
                <span className="px-2 py-1 bg-white rounded-lg text-xs">Nodes attract & repel</span>
                <span className="px-2 py-1 bg-white rounded-lg text-xs">Drag to influence</span>
                <span className="px-2 py-1 bg-white rounded-lg text-xs">Auto-organizes</span>
              </p>
            </div>
          </>
        )}
      </div>

      {futureGraph.nodes.length > 0 && (
        <div className="card bg-gradient-to-br from-white/95 via-orange-50/30 to-yellow-50/30 border-2 border-orange-300/50 shadow-2xl overflow-hidden">
          {layout === 'simple' ? (
            <>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold gradient-text">{t('graph.futureGraph')}</h3>
                    <p className="text-xs text-gray-600">Your career evolution with growth opportunities</p>
                  </div>
                </div>
                <button onClick={handleGenerateRoadmap} className="btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <Sparkles className="w-5 h-5" />
                  <span className="hidden md:inline">Generate Roadmap</span>
                  <span className="md:hidden">Roadmap</span>
                </button>
              </div>
              <GraphVisualization nodes={futureGraph.nodes} links={futureGraph.links} seed={layoutSeed} showLabels={showLabels} highContrast={highContrast} />
              <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">✨</span>
                  <p className="text-sm font-bold text-gray-800">Your Future Career Vision</p>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Orange nodes (🚀) represent recommended skills to master for advancing your career. 
                  These are carefully selected based on your target role and current skill set.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold gradient-text">{t('graph.futureGraph')}</h3>
                    <p className="text-xs text-gray-600">Dynamic visualization of your growth path</p>
                  </div>
                </div>
                <button onClick={handleGenerateRoadmap} className="btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <Sparkles className="w-5 h-5" />
                  <span className="hidden md:inline">Generate Roadmap</span>
                  <span className="md:hidden">Roadmap</span>
                </button>
              </div>
              <ForceGraph nodes={futureGraph.nodes} links={futureGraph.links} seed={layoutSeed} showLabels={showLabels} highContrast={highContrast} />
              <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🎯</span>
                  <p className="text-sm font-bold text-gray-800">Interactive Future Planning</p>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Watch your career path evolve in real-time! Orange nodes represent skills to acquire. 
                  The physics simulation shows natural connections between your current and future expertise.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {futureGraph.nodes.length > 0 && (
        <div className="card bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-xl">🎯</span>
            </div>
            <div>
              <h3 className="text-xl font-bold gradient-text">Recommended Quests</h3>
              <p className="text-xs text-gray-600">Actionable steps to master your future skills</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {futureGraph.nodes.filter((n) => n.type === 'future-skill').map((n, idx) => (
              <div key={n.id} className="bg-white/80 rounded-xl border-2 border-purple-200/50 p-4 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                      {n.label}
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">New</span>
                    </p>
                    <p className="text-xs text-gray-500">Master this skill to advance your career</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {(() => {
                    const s = n.label.toLowerCase();
                    const tasks = s.includes('seo') ? [
                        { text: 'Perform an SEO audit on a small site', xp: 25 },
                        { text: 'Create a keyword list and content plan', xp: 20 },
                        { text: 'Set up Google Analytics and monitor KPIs', xp: 30 }
                      ]
                      : s.includes('figma') ? [
                        { text: 'Redesign a landing page wireframe in Figma', xp: 30 },
                        { text: 'Create a component library', xp: 35 },
                        { text: 'Run a quick usability test with 3 users', xp: 25 }
                      ]
                      : s.includes('python') ? [
                        { text: 'Complete a Pandas tutorial and summarize learnings', xp: 20 },
                        { text: 'Build a simple ETL script', xp: 35 },
                        { text: 'Query a dataset with SQL and visualize results', xp: 30 }
                      ]
                      : s.includes('docker') ? [
                        { text: 'Containerize a small app', xp: 30 },
                        { text: 'Write a Docker Compose file', xp: 25 },
                        { text: 'Push image to Docker Hub', xp: 20 }
                      ]
                      : [
                        { text: 'Read a concise overview of the topic', xp: 15 },
                        { text: 'Build a mini project using the skill', xp: 40 },
                        { text: 'Create flashcards and review for 3 days', xp: 15 }
                      ];
                    return tasks.map((task, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 p-2 bg-purple-50/50 rounded-lg hover:bg-purple-100/50 transition-colors">
                        <span className="text-green-600 font-bold flex-shrink-0 mt-0.5">✓</span>
                        <span className="flex-1">{task.text}</span>
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">+{task.xp} XP</span>
                      </li>
                    ));
                  })()}
                </ul>
                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Total XP</span>
                  <span className="text-sm font-bold text-purple-600">
                    {(() => {
                      const s = n.label.toLowerCase();
                      return s.includes('seo') ? 75 : s.includes('figma') ? 90 : s.includes('python') ? 85 : s.includes('docker') ? 75 : 70;
                    })()} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(suggestions.skills.length > 0 || suggestions.projects.length > 0) && (
        <div className="card">
          <h3 className="text-xl font-semibold mb-2">{t('graph.nextBest')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-600 mb-1">{t('graph.skills')}</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.skills.map((s) => (
                  <span key={s} className="px-2 py-1 rounded-lg bg-purple-100 text-purple-700 text-xs">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-600 mb-1">{t('graph.projects')}</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.projects.map((p) => (
                  <span key={p} className="px-2 py-1 rounded-lg bg-green-100 text-green-700 text-xs">{p}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-600 mb-1">{t('graph.jobs')}</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.roles.map((r) => (
                  <span key={r} className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs">{r}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {leetcodeStats && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">LeetCode</h3>
          <div className="flex flex-wrap gap-4 text-sm text-gray-700">
            <span>Total: <b>{leetcodeStats.totalSolved}</b></span>
            <span>Easy: <b className="text-green-600">{leetcodeStats.easySolved}</b></span>
            <span>Medium: <b className="text-yellow-600">{leetcodeStats.mediumSolved}</b></span>
            <span>Hard: <b className="text-red-600">{leetcodeStats.hardSolved}</b></span>
            {typeof leetcodeStats.ranking !== 'undefined' && <span>Rank: <b>#{leetcodeStats.ranking}</b></span>}
          </div>
          {leetcode && (
            <a className="text-blue-600 underline text-sm mt-2 inline-block" href={`https://leetcode.com/${encodeURIComponent(leetcode)}/`} target="_blank" rel="noreferrer">View Profile</a>
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraph;
