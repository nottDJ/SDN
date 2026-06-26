'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ReactFlow, MiniMap, Controls, Background, BackgroundVariant, useNodesState, useEdgesState, MarkerType, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import api from '@/lib/api';
import { getStatusColor } from '@/lib/utils';
import { Network, Monitor, Cpu, Server } from 'lucide-react';

const nodeColors: Record<string, string> = {
  controller: '#8b5cf6',
  switch: '#3b82f6',
  host: '#06b6d4',
};

const statusToEdgeColor = (utilization: number) => {
  if (utilization > 0.8) return '#f43f5e';
  if (utilization > 0.5) return '#f59e0b';
  return '#10b981';
};

export default function TopologyPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const fetchTopology = useCallback(async () => {
    try {
      const { data } = await api.get('/topology');
      const positionMap: Record<string, { x: number; y: number }> = {};
      let controllerCount = 0, switchCount = 0, hostCount = 0;

      // Auto-layout: controllers top, switches middle, hosts bottom
      data.nodes.forEach((n: { id: string; type: string }) => {
        if (n.type === 'controller') {
          positionMap[n.id] = { x: 400, y: 50 + controllerCount * 150 };
          controllerCount++;
        } else if (n.type === 'switch') {
          positionMap[n.id] = { x: 150 + switchCount * 200, y: 250 };
          switchCount++;
        } else {
          positionMap[n.id] = { x: 100 + hostCount * 150, y: 450 };
          hostCount++;
        }
      });

      const flowNodes: Node[] = data.nodes.map((n: { id: string; type: string; label: string; status: string; metrics?: Record<string, unknown> }) => ({
        id: n.id,
        position: positionMap[n.id] || { x: Math.random() * 600, y: Math.random() * 400 },
        data: { label: n.label, status: n.status, nodeType: n.type, metrics: n.metrics },
        type: 'default',
        style: {
          background: `${nodeColors[n.type] || '#64748b'}15`,
          border: `2px solid ${nodeColors[n.type] || '#64748b'}`,
          borderRadius: '12px',
          padding: '12px 16px',
          color: '#f8fafc',
          fontSize: '12px',
          fontWeight: 600,
          boxShadow: `0 0 15px ${nodeColors[n.type] || '#64748b'}30`,
          minWidth: '120px',
          textAlign: 'center' as const,
        },
      }));

      const flowEdges: Edge[] = data.edges.map((e: { id: string; source: string; target: string; animated: boolean; utilization: number; label?: string }) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: e.animated,
        style: { stroke: statusToEdgeColor(e.utilization), strokeWidth: 2 },
        label: e.label,
        labelStyle: { fill: '#94a3b8', fontSize: 10 },
        markerEnd: { type: MarkerType.ArrowClosed, color: statusToEdgeColor(e.utilization) },
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch {
      // Generate demo topology
      setNodes([
        { id: 'c1', position: { x: 400, y: 50 }, data: { label: '🧠 SDN Controller' }, style: { background: '#8b5cf615', border: '2px solid #8b5cf6', borderRadius: '12px', padding: '12px 16px', color: '#f8fafc', fontSize: '12px', fontWeight: 600, boxShadow: '0 0 15px #8b5cf630' } },
        { id: 's1', position: { x: 150, y: 250 }, data: { label: '🔀 Switch 1' }, style: { background: '#3b82f615', border: '2px solid #3b82f6', borderRadius: '12px', padding: '12px 16px', color: '#f8fafc', fontSize: '12px', fontWeight: 600, boxShadow: '0 0 15px #3b82f630' } },
        { id: 's2', position: { x: 400, y: 250 }, data: { label: '🔀 Switch 2' }, style: { background: '#3b82f615', border: '2px solid #3b82f6', borderRadius: '12px', padding: '12px 16px', color: '#f8fafc', fontSize: '12px', fontWeight: 600, boxShadow: '0 0 15px #3b82f630' } },
        { id: 's3', position: { x: 650, y: 250 }, data: { label: '🔀 Switch 3' }, style: { background: '#3b82f615', border: '2px solid #3b82f6', borderRadius: '12px', padding: '12px 16px', color: '#f8fafc', fontSize: '12px', fontWeight: 600, boxShadow: '0 0 15px #3b82f630' } },
        { id: 'h1', position: { x: 50, y: 450 }, data: { label: '💻 Host 1' }, style: { background: '#06b6d415', border: '2px solid #06b6d4', borderRadius: '12px', padding: '12px 16px', color: '#f8fafc', fontSize: '12px', fontWeight: 600 } },
        { id: 'h2', position: { x: 250, y: 450 }, data: { label: '💻 Host 2' }, style: { background: '#06b6d415', border: '2px solid #06b6d4', borderRadius: '12px', padding: '12px 16px', color: '#f8fafc', fontSize: '12px', fontWeight: 600 } },
        { id: 'h3', position: { x: 500, y: 450 }, data: { label: '💻 Host 3' }, style: { background: '#06b6d415', border: '2px solid #06b6d4', borderRadius: '12px', padding: '12px 16px', color: '#f8fafc', fontSize: '12px', fontWeight: 600 } },
        { id: 'h4', position: { x: 700, y: 450 }, data: { label: '💻 Host 4' }, style: { background: '#06b6d415', border: '2px solid #06b6d4', borderRadius: '12px', padding: '12px 16px', color: '#f8fafc', fontSize: '12px', fontWeight: 600 } },
      ]);
      setEdges([
        { id: 'c1-s1', source: 'c1', target: 's1', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
        { id: 'c1-s2', source: 'c1', target: 's2', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
        { id: 'c1-s3', source: 'c1', target: 's3', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
        { id: 's1-s2', source: 's1', target: 's2', animated: true, style: { stroke: '#10b981', strokeWidth: 2 }, label: '1000Mbps', labelStyle: { fill: '#94a3b8', fontSize: 10 } },
        { id: 's2-s3', source: 's2', target: 's3', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, label: '1000Mbps', labelStyle: { fill: '#94a3b8', fontSize: 10 } },
        { id: 's1-h1', source: 's1', target: 'h1', style: { stroke: '#06b6d4', strokeWidth: 1.5 } },
        { id: 's1-h2', source: 's1', target: 'h2', style: { stroke: '#06b6d4', strokeWidth: 1.5 } },
        { id: 's2-h3', source: 's2', target: 'h3', style: { stroke: '#06b6d4', strokeWidth: 1.5 } },
        { id: 's3-h4', source: 's3', target: 'h4', style: { stroke: '#06b6d4', strokeWidth: 1.5 } },
      ]);
    }
  }, [setNodes, setEdges]);

  useEffect(() => { fetchTopology(); }, [fetchTopology]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Network Topology</h1>
          <p className="text-slate-400 text-sm mt-1">Interactive SDN network visualization</p>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Normal</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500" /> Medium Load</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500" /> Congested</span>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ height: '70vh' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={(_, node) => setSelectedNode(node)}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls />
          <MiniMap nodeStrokeColor="#64748b" nodeColor="#1e293b" maskColor="rgba(10,10,26,0.8)" />
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(148,163,184,0.08)" />
        </ReactFlow>
      </motion.div>
    </div>
  );
}
