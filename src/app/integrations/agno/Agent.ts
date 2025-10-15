import client from "./Client";

export interface useAgentPayload {
  message: string;
  session_id: string;
}

export default {
  /**
   * Chama o agente diretamente (rota /use)
   * @returns {Promise<object>}
   * @param payload
   */
  async useAgent(payload: useAgentPayload) {
    const { data } = await client.post("/use", payload);
    return data;
  },
};
