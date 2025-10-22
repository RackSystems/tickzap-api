import client from "./Client";

export interface useAgentPayload {
  message: string;
  session_id: string;
  user_id: string;
}

export default {
  /**
   * Chama o agente diretamente (rota /use)
   * @param id
   * @param payload
   */
  async useAgent(id: string, payload: useAgentPayload) {
    const { data } = await client.post(`/agents/${id}/use`, payload);
    return data;
  },
};
