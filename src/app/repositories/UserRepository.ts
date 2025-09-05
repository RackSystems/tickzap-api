import prisma from '../../config/database';
import { User } from '@prisma/client';

export default {
  async findAll(queryParams: {
    name?: string;
    email?: string;
    status?: string;
    isActive?: string;
    page?: string;
    pageSize?: string;
  }) {
    const where: any = {};

    if (queryParams.name) {
      where.name = { contains: queryParams.name, mode: 'insensitive' };
    }
    if (queryParams.email) {
      where.email = { contains: queryParams.email, mode: 'insensitive' };
    }
    if (queryParams.status) {
      where.status = queryParams.status;
    }
    if (queryParams.isActive) {
      where.isActive = queryParams.isActive === 'true';
    }

    const page = queryParams.page ? parseInt(queryParams.page) : 1;
    const pageSize = queryParams.pageSize ? parseInt(queryParams.pageSize) : 10;

    return prisma.user.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  },

  async create(data: User) {
    return prisma.user.create({ data })
  },

  async update(id: string, data: Partial<Omit<User, 'password'>>) {
    return prisma.user.update({
      where: {id},
      data
    })
  },

  async delete(id: string) {
    return prisma.user.delete({
      where: {id}
    })
  },

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email }
    });
  },
    
  async getById(id: string) {
    return prisma.user.findUnique({
      where: {id}
    })
  }
};
