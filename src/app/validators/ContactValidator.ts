import {body} from 'express-validator';
import ContactService from "../services/ContactService";

export const validateContactStore = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('email').optional().isEmail().withMessage('E-mail inválido'),
  body('phone').notEmpty().isString().withMessage('Telefone inválido'),
  body('phone').custom(async (value: string) => {
    const contact = await ContactService.show({phone: value});

    if (contact) {
      throw new Error('Esse telefone já está em uso');
    }
  }),
];

export const validateContactUpdate = [
  body('name').optional().notEmpty().withMessage('Nome não pode ser vazio'),
  body('email').optional().isEmail().withMessage('E-mail inválido'),
  body('phone').optional().isString().withMessage('Telefone inválido'),
  body('phone').custom(async (value: string) => {
    const contact = await ContactService.show({phone: value});

    if (contact) {
      throw new Error('Esse telefone já está em uso');
    }
  }),
];
