import {Channel, Prisma} from '@prisma/client';
import Instance from '../integrations/evolution/Instance';
import prisma from '../../config/database';

type IndexQueryParams = {
  type?: string;
  status?: string;
  isAuthenticated?: string;
  page?: string;
  pageSize?: string;
}

export default {
  async store(data: Channel): Promise<Channel> {
    const payload = {
      'instanceName': data.name,
      'integration': 'WHATSAPP-BAILEYS'
    }

    const evolutionResponse: any = await Instance.create(payload)

    if (!evolutionResponse || !evolutionResponse.instance.status || !evolutionResponse.hash) {
      throw new Error('Failed to create channel in Evolution');
    }

    const channelData = {
      ...data,
      status: evolutionResponse.instance.status,
      identifier: evolutionResponse.hash
    }

    return prisma.channel.create({data: channelData});
  },

  async destroy(id: string): Promise<Channel> {
    return prisma.channel.delete({
      where: {id}
    });
  },

  async index(queryParams: IndexQueryParams): Promise<Channel[]> {
    const where: Prisma.ChannelWhereInput = {};

    if (queryParams.type) {
      where.name = {contains: queryParams.type, mode: 'insensitive'};
    }

    if (queryParams.status) {
      where.status = {contains: queryParams.status, mode: 'insensitive'};
    }

    return prisma.channel.findMany({
      where
    });
  },

  async show(filter: Prisma.ChannelWhereUniqueInput): Promise<Channel | null> {
    return prisma.channel.findUnique({
      where: filter
    });
  },

  async update(id: string, data: Partial<Channel>): Promise<Channel> {
    return prisma.channel.update({
      where: {id},
      data
    });
  },

  async connect(instanceId: string): Promise<any> {
    const channel = await this.show({id: instanceId});

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
    const channel = await this.show({id: instanceId});

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
