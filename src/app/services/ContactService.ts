import ContactRepository from '../repositories/ContactRepository'
import { Contact } from '../interfaces/ContactInterface'

export default {
  async create(data: Contact) {
    if (!data.name) {
      throw new Error('Nome é obrigatório!');
    }
    if (!data.phone) {
      throw new Error('Telefone é obrigatório!');
    }
    data.status = true;

    return await ContactRepository.create(data);
  },

  async delete(id: string) {
    return await ContactRepository.delete(id);
  },

  async getAll(queryParams: any) {
    return ContactRepository.findAll(queryParams);
  },

  async getById(id: string) {
    return await ContactRepository.getById(id);
  },

  async update(id: string, data: Contact) {
    return await ContactRepository.update(id, data);
  },

}
