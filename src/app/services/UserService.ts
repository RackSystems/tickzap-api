import UserRepository from '../repositories/UserRepository'
import { User } from '../interfaces/UserInterface'
import bcrypt from 'bcrypt'
import { UserStatus } from "../enums/UserStatusEnum";
import { isValidUserStatus } from "../../helpers/UserHelper"

export default {
  //TODO criar um helper para nao trazer o password nas responses

  async create(data: User) {
    if (!data.password) {
      throw new Error('Senha é obrigatória');
    }

    data.password = await bcrypt.hash(data.password, 12);
    return await UserRepository.create(data);
  },

  async delete(id: string) {
    //TODO - apagar apenas usuarios inativos
    return await UserRepository.delete(id);
  },

  async getAll(queryParams: any) {
    return UserRepository.findAll(queryParams);
  },

  async getById(id: string) {
    return await UserRepository.getById(id);
  },

  async update(id: string, data: Partial<Omit<User, 'password'>>) {
    return await UserRepository.update(id, data);
  },

  async changeStatus(id: string, status: string) {
    let user = await UserRepository.getById(id);
    if (!user) {
      return;
    }
    user.status = isValidUserStatus(status) ? status : UserStatus.OFFLINE;
    let { password: _, ...safeUser } = user;
    return this.update(id, safeUser);
  },

  async enableOrDisable(id: string) {
    let user = await UserRepository.getById(id);
    if (!user) {
      return;
    }
    user.isActive = !user.isActive;
    user.status = user.isActive ? user.status : UserStatus.OFFLINE;
    let { password: _, ...safeUser } = user;
    return this.update(id, safeUser);
  },
}
