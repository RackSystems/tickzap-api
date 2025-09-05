import client from './Client';

export default {
  async create(payload: object) {
    const { data } = await client.post('/instance/create', payload)
    return data
  },

  async connect(name: string) {
    const { data } = await client.get(`/instance/connect/${name}`)
    return data
  },

  async getStatus(instanceId: string) {
    const { data } = await client.get(`/instance/connectionState/${instanceId}`)
    return data
  },

  async destroy(instanceId: string) {
    const { data } = await client.delete(`/instance/delete/${instanceId}`)
    return data
  },

  async logout(instanceId: string) {
    const { data } = await client.delete(`/instance/logout/${instanceId}`)
    return data
  },

  async setWebhook(instanceId: string, payload: object) {
    const { data } = await client.post(`/webhook/set/${instanceId}`, payload)
    return data
  }
}
