import {Contact, Prisma} from '@prisma/client';
import prisma from '../../config/database';

type ContactQuery = {
  name?: string;
  phone?: string;
  email?: string;
  status?: string;
  page?: string;
  pageSize?: string;
};

export default {
  async store(data: Prisma.ContactUncheckedCreateInput): Promise<Contact> {
    data.status = true;

    return prisma.contact.create({data})
  },

  async destroy(id: string): Promise<Contact> {
    return prisma.contact.delete({
      where: {id}
    })
  },

  async index(query: ContactQuery): Promise<Contact[]> {
    const where: Prisma.ContactWhereInput = {};

    if (query.name) {
      where.name = {contains: query.name, mode: 'insensitive'};
    }
    if (query.phone) {
      where.phone = {contains: query.phone, mode: 'insensitive'};
    }
    if (query.email) {
      where.email = {contains: query.email, mode: 'insensitive'};
    }
    if (query.status !== undefined) {
      where.status = query.status === 'true';
    }

    return prisma.contact.findMany({where});
  },

  async show(filter: Prisma.ContactWhereUniqueInput): Promise<Contact | null> {
    return prisma.contact.findUnique({
      where: filter,
    });
  },

  async update(id: string, data: Contact): Promise<Contact> {
    return prisma.contact.update({
      where: {id},
      data
    })
  },
}
