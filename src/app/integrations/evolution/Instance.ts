import client from "./Client";

export default {
  async create(payload: object) {
    const { data } = await client.post("/instance/create", payload);
    return data;
  },

  async connect(name: string) {
    const { data } = await client.get(`/instance/connect/${name}`);
    return data;
  },

  async getStatus(instanceId: string) {
    const { data } = await client.get(`/instance/connectionState/${instanceId}`);
    return data;
  },

  async destroy(instanceName: string) {
    const { data } = await client.delete(`/instance/delete/${instanceName}`);
    return data;
  },

  async logout(instanceName: string) {
    const { data } = await client.delete(`/instance/logout/${instanceName}`);
    return data;
  },

  async setWebhook(instanceName: string, payload: object) {
    const { data } = await client.post(`/webhook/set/${instanceName}`, payload);
    return data;
  },
};
