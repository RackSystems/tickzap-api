import { Channel } from '@prisma/client';
import ChannelRepository from '../repositories/ChannelRepository';
import Instance from '../integrations/evolution/Instance';

export default {
  async create(data: Omit<Channel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Channel> {

    const payload = {
      'instanceName': data.name,
      'integration': 'WHATSAPP-BAILEYS'
    }

    const evolutionResponse = await Instance.create(payload)

    if (!evolutionResponse || !evolutionResponse.instance.status || !evolutionResponse.hash) {
      throw new Error('Failed to create channel in Evolution');
    }

    console.log(evolutionResponse)

    return await ChannelRepository.create({
      ...data,
      status: evolutionResponse.instance.status,
      identifier: evolutionResponse.hash
    });
  },

  async delete(id: string): Promise<Channel> {
    return await ChannelRepository.delete(id);
  },

  async getAll(queryParams: any): Promise <Channel[]> {
    return ChannelRepository.findAll(queryParams);
  },

  async getById(id: string): Promise<Channel> {
    return await ChannelRepository.getById(id);
  },

  async update(id: string, data: Partial<Channel>): Promise<Channel> {
    return await ChannelRepository.update(id, data);
  },

  async connect(instanceId: string): Promise<any> {
    const channel = await ChannelRepository.getById(instanceId);

    if (!channel) {
      throw new Error('Channel not found');
    }

    const evolutionResponse = await Instance.connect(channel.name);

    if (!evolutionResponse) {
      throw new Error('Failed to retrieve QR code from Evolution');
    }

    return evolutionResponse;
  },

  async getStatus(instanceId: string): Promise<any> {
    const channel = await ChannelRepository.getById(instanceId);

    if (!channel) {
      throw new Error('Channel not found');
    }

    const evolutionResponse = await Instance.getStatus(channel.name);

    if (!evolutionResponse) {
      throw new Error('Failed to retrieve Status from Evolution');
    }

    return evolutionResponse;
  }
}
