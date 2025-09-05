import { body, param } from 'express-validator';
import UserRepository from '../repositories/UserRepository';

export const validateUserStore = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('email').notEmpty().isEmail().withMessage('E-mail inválido'),
  body('email').custom(async (value) => {
    const user = await UserRepository.findByEmail(value);
    if (user) {
      throw new Error('Esse email já está em uso');
    }
  }),
  body('password').notEmpty().isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
];

export const validateUserUpdate = [
  body('name').optional().notEmpty().withMessage('Nome não pode ser vazio'),
  body('email').optional().isEmail().withMessage('E-mail inválido'),
  body('email').custom(async (value) => {
    const user = await UserRepository.findByEmail(value);
    if (user) {
      throw new Error('Esse email já está em uso');
    }
  }),
  body('password').optional().isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
];

//TODO - body('status').isIn(['OFFLINE', 'ONLINE', 'IDLE', 'BUSY', 'AWAY']).withMessage("Status inválido"),
export const validateUserStatus = [
  body('status').optional().notEmpty().withMessage('Status não pode ser vazio'),
  body('status').isString().withMessage("Status deve ser uma string"),
  body('status').customSanitizer((value: string) => value.toLowerCase()),
];

export const validateIdParam = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('ID é obrigatório e deve ser uma string válida')
];
