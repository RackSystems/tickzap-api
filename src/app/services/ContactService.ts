import {Contact, Prisma} from '@prisma/client';
import prisma from '../../config/database';

export default {
  async store(data: Contact) {
    data.status = true;

    return prisma.contact.create({data})
  },

  async destroy(id: string) {
    return prisma.contact.delete({
      where: {id}
    })
  },

  async index(queryParams: {
    name?: string;
    phone?: string;
    email?: string;
    status?: string;
    page?: string;
    pageSize?: string;
  }) {
    const where: any = {};

    if (queryParams.name) {
      where.name = {contains: queryParams.name, mode: 'insensitive'};
    }
    if (queryParams.phone) {
      where.phone = {contains: queryParams.phone, mode: 'insensitive'};
    }
    if (queryParams.email) {
      where.email = {contains: queryParams.email, mode: 'insensitive'};
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

  async show(filter: Prisma.ContactWhereUniqueInput): Promise<Contact | null> {
    return prisma.contact.findUnique({
      where: filter,
    });
  },

  async update(id: string, data: Contact) {
    return prisma.contact.update({
      where: {id},
      data
    })
  },
}
