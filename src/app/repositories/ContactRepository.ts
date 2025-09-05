import prisma from '../../config/database';
import { Contact } from '@prisma/client';

export default {
  async findAll(queryParams: {
    name?: string;
    phone?: string;
    email?: string;
    status?: string;
    page?: string;
    pageSize?: string;
  }) {
    const where: any = {};

    if (queryParams.name) {
      where.name = { contains: queryParams.name, mode: 'insensitive' };
    }
    if (queryParams.phone) {
      where.phone = { contains: queryParams.phone, mode: 'insensitive' };
    }
    if (queryParams.email) {
      where.email = { contains: queryParams.email, mode: 'insensitive' };
    }
    if (queryParams.status !== undefined) {
      where.status = queryParams.status === 'true';
    }

    const page = queryParams.page ? parseInt(queryParams.page) : 1;
    const pageSize = queryParams.pageSize ? parseInt(queryParams.pageSize) : 10;

    return prisma.contact.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  },

  async create(data: Contact) {
    return prisma.contact.create({ data })
  },

  async update(id: string, data: Partial<Omit<Contact, 'password'>>) {
    return prisma.contact.update({
      where: {id},
      data
    })
  },

  async delete(id: string) {
    return prisma.contact.delete({
      where: {id}
    })
  },

  async findByPhone(phone: string): Promise<Contact | null> {
    return prisma.contact.findUnique({
      where: { phone }
    });
  },

  async getById(id: string) {
    return prisma.contact.findUnique({
      where: {id}
    })
  }
};
