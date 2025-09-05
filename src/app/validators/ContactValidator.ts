import { body, param } from 'express-validator';
import ContactRepository from '../repositories/ContactRepository'

export const validateContactStore = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('email').optional().isEmail().withMessage('E-mail inválido'),
  body('phone').notEmpty().isString().withMessage('Telefone inválido'),
  body('phone').custom(async (value) => {
    const contact = await ContactRepository.findByPhone(value);
    if (contact) {
      throw new Error('Esse telefone já está em uso');
    }
  }),
];

export const validateContactUpdate = [
  body('name').optional().notEmpty().withMessage('Nome não pode ser vazio'),
  body('email').optional().isEmail().withMessage('E-mail inválido'),
  body('phone').optional().isString().withMessage('Telefone inválido'),
  body('phone').custom(async (value) => {
    const contact = await ContactRepository.findByPhone(value);
    if (contact) {
      throw new Error('Esse telefone já está em uso');
    }
  }),
];

export const validateIdParam = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('ID é obrigatório e deve ser uma string válida')
];
