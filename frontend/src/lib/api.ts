import type { ControlRoomData, AgentResponse, ClarificationResponse } from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export async function fetchControlRoomData(): Promise<ControlRoomData> {
  const res = await fetch(`${API_BASE_URL}/control-room`);
  if (!res.ok) {
    throw new Error(`Failed to fetch control room data: HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchPipelineData(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/pipeline`);
  if (!res.ok) {
    throw new Error(`Failed to fetch pipeline data: HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchOperationsData(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/operations`);
  if (!res.ok) {
    throw new Error(`Failed to fetch operations data: HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchReconciliationData(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/reconciliation`);
  if (!res.ok) {
    throw new Error(`Failed to fetch reconciliation data: HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchDataHealth(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/data-health`);
  if (!res.ok) {
    throw new Error(`Failed to fetch data health: HTTP ${res.status}`);
  }
  return res.json();
}

export async function queryAgent(query: string): Promise<AgentResponse | ClarificationResponse> {
  const res = await fetch(`${API_BASE_URL}/agent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    throw new Error(`Agent query failed: HTTP ${res.status}`);
  }
  return res.json();
}

export async function generateLeadershipBrief(reportType: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/reports/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report_type: reportType }),
  });
  if (!res.ok) {
    throw new Error(`Report generation failed: HTTP ${res.status}`);
  }
  return res.json();
}

export async function runScenarioSimulation(
  scenarioType: string,
  deltaValue: number
): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/scenario-simulator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario_type: scenarioType, delta_value: deltaValue }),
  });
  if (!res.ok) {
    throw new Error(`Scenario simulation failed: HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchMapData(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/map-data`);
  if (!res.ok) {
    throw new Error(`Failed to fetch map data: HTTP ${res.status}`);
  }
  return res.json();
}

