import bcrypt from 'bcrypt';
import userService from "./UserService";

export default {
  authenticate: async function (email: string, password: string): Promise<null | string> {
    const user = await userService.show({email});
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user.id;
  },

  async me(userId: string): Promise<Object> {
    const user = await userService.show({id: userId});

    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      status: user.status,
      isActive: user.isActive
    }
  }
}
