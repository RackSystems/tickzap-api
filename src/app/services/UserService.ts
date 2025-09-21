import {Prisma, User} from '@prisma/client';
import prisma from '../../config/database';
import bcrypt from 'bcrypt';
import {UserStatus} from "../enums/UserStatusEnum";
import {isValidUserStatus} from "../../helpers/UserHelper";

type UserQuery = {
  name?: string;
  email?: string;
  status?: string;
  isActive?: string;
  page?: string;
  pageSize?: string;
};

export default {
  async index(queryParams: UserQuery): Promise<User[]> {
    const where: Prisma.UserWhereInput = {};

    if (queryParams.name) {
      where.name = {contains: queryParams.name, mode: 'insensitive'};
    }
    if (queryParams.email) {
      where.email = {contains: queryParams.email, mode: 'insensitive'};
    }
    if (queryParams.status) {
      where.status = queryParams.status;
    }
    if (queryParams.isActive !== undefined) {
      where.isActive = queryParams.isActive === 'true';
    }

    const page = queryParams.page ? parseInt(queryParams.page) : 1;
    const pageSize = queryParams.pageSize ? parseInt(queryParams.pageSize) : 10;

    const users = await prisma.user.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return users;
  },

  async show(filter: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return prisma.user.findUnique({
      where: filter,
    });
  },

  async store(data: Prisma.UserCreateInput): Promise<User> {
    data.password = await bcrypt.hash(data.password, 12);
    return prisma.user.create({data});
  },

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: {id},
      data,
    });
  },

  async destroy(id: string): Promise<User> {
    //TODO - apagar apenas usuarios inativos
    return prisma.user.delete({
      where: {id},
    });
  },

  async changeStatus(id: string, status: string): Promise<User | null> {
    const user = await prisma.user.findUnique({where: {id}});
    if (!user) {
      return null;
    }

    const newStatus = isValidUserStatus(status) ? status : UserStatus.OFFLINE;

    return prisma.user.update({
      where: {id},
      data: {status: newStatus},
    });
  },

  async enableOrDisable(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({where: {id}});
    if (!user) {
      return null;
    }

    const newIsActive = !user.isActive;
    const newStatus = newIsActive ? user.status : UserStatus.OFFLINE;

    return prisma.user.update({
      where: {id},
      data: {
        isActive: newIsActive,
        status: newStatus
      },
    });
  },
};
