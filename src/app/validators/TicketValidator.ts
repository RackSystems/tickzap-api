import { body, param } from 'express-validator';
import { TicketStatus } from '@prisma/client';

export const validateTicketStore = [
  body('contactId').notEmpty().withMessage('ID do contato é obrigatório'),
  body('channelId').notEmpty().withMessage('ID do canal é obrigatório'),
  body('status').optional().isIn(Object.values(TicketStatus)).withMessage('Status inválido'),
];

export const validateTicketUpdate = [
  body('contactId').optional().notEmpty().withMessage('ID do contato não pode ser vazio'),
  body('channelId').optional().notEmpty().withMessage('ID do canal não pode ser vazio'),
  body('status').optional().isIn(Object.values(TicketStatus)).withMessage('Status inválido'),
  body('UserId').optional(),
];

export const validateIdParam = [
  param('id').notEmpty().withMessage('ID é obrigatório'),
];