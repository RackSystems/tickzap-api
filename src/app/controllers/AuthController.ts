import { Request, Response } from 'express'
import AuthService from '../services/AuthService';

export default {
  async authenticate(req: Request, res: Response): Promise <any> {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email e senha são obrigatórios'
      })
    }

    try {
      const userId = await AuthService.authenticate(email, password)

      if(userId === null) {
        return res.status(401).json({
          message: 'Falha ao autenticar: email ou senha inválidos'
        })
      }

      res.cookie('userId', userId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600 * 1000 * 1000, // Expiração do cookie: 1 dia
      });

      res.status(200).json({ message: 'Login bem-sucedido' })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao autenticar usuário',
        errors: error
      })
    }
  },

  async deauthenticate(req: Request, res: Response): Promise<void> {
    res.clearCookie('userId');
    res.json({message: 'Logout bem-sucedido'});
  },

  async me(req: Request, res: Response): Promise<any> {
    const response = await AuthService.me(req.cookies.userId);

    res.json({
      message: 'Usuário autenticado',
      body: response
    });
  }
}
