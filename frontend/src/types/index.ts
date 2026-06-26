/* ── TypeScript Types ── */

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'operator';
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface DashboardStats {
  active_switches: number;
  active_hosts: number;
  active_flows: number;
  current_throughput: number;
  avg_latency: number;
  packet_loss: number;
  cpu_usage: number;
  memory_usage: number;
  congestion_risk: number;
  unacknowledged_alerts: number;
  prediction_accuracy: number;
}

export interface TrafficData {
  timestamp: string;
  throughput: number;
  latency: number;
  jitter: number;
  packet_loss: number;
  flow_count: number;
  link_utilization: number;
  cpu_usage: number;
  memory_usage: number;
  packet_count: number;
  byte_count: number;
}

export interface TopologyNode {
  id: string;
  type: string;
  label: string;
  status: string;
  metrics?: Record<string, unknown>;
  position?: { x: number; y: number };
}

export interface TopologyEdge {
  id: string;
  source: string;
  target: string;
  animated: boolean;
  utilization: number;
  bandwidth: number;
  label?: string;
}

export interface TopologyData {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  metadata: Record<string, number>;
}

export interface PredictionResult {
  id: string;
  timestamp: string;
  model_name: string;
  horizon: string;
  predicted_throughput: number | null;
  predicted_latency: number | null;
  predicted_utilization: number | null;
  confidence: number;
  is_congestion_predicted: boolean;
  action_taken: string | null;
}

export interface MLModel {
  id: string;
  name: string;
  algorithm: string;
  version: string;
  accuracy: number | null;
  rmse: number | null;
  mae: number | null;
  training_time: number | null;
  prediction_time: number | null;
  is_active: boolean;
  metrics: Record<string, number>;
  feature_importance: Record<string, number>;
  hyperparameters: Record<string, unknown>;
  trained_at: string | null;
}

export interface Alert {
  id: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
  alert_type: string;
  source: string | null;
  message: string;
  details: string | null;
  recommended_action: string | null;
  acknowledged: boolean;
  resolved: boolean;
}

export interface WSMessage {
  type: string;
  data: Record<string, unknown>;
}
