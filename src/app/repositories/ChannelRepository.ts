import prisma from '../../config/database';
import { Channel } from '@prisma/client';

export default {
  async findAll(queryParams: {
    type?: string;
    status?: string;
    isAuthenticated?: string;
    page?: string;
    pageSize?: string;
  }): Promise <Channel[]> {
    const where: any = {};

    if (queryParams.type) {
      where.name = { contains: queryParams.type, mode: 'insensitive' };
    }

    if (queryParams.status) {
      where.email = { contains: queryParams.status, mode: 'insensitive' };
    }

    if (queryParams.isAuthenticated) {
      where.status = queryParams.isAuthenticated;
    }

    const page = queryParams.page ? parseInt(queryParams.page) : 1;
    const pageSize = queryParams.pageSize ? parseInt(queryParams.pageSize) : 10;

    return prisma.channel.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  },

  async create(data: { status: any; identifier: any }): Promise<Channel> {
    return prisma.channel.create({ data })
  },

  async update(id: string, data: Partial<Channel>): Promise<Channel> {
    return prisma.channel.update({
      where: {id},
      data
    })
  },

  async delete(id: string): Promise<Channel> {
    return prisma.channel.delete({
      where: { id }
    })
  },

  async getById(id: string): Promise<Channel | null> {
    return prisma.channel.findUnique({
      where: { id }
    })
  },
};
