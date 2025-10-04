import {Router} from 'express'
import UserController from '../app/controllers/UserController'
import AuthController from '../app/controllers/AuthController'
import {authMiddleware} from '../app/middlewares/authMiddleware';
import ChannelController from '../app/controllers/ChannelController';
import ContactController from '../app/controllers/ContactController';
import TicketController from '../app/controllers/TicketController';
import WebhookController from '../app/controllers/WebhookController';
import MessageController from "../app/controllers/MessageController";
import StorageController from "../app/controllers/StorageController";
import {handleValidation} from '../app/middlewares/handleValidationMiddleware';
import {
  validateUserStore,
  validateUserUpdate,
  validateUserStatus,
} from '../app/validators/UserValidator';
import {validateContactStore, validateContactUpdate} from '../app/validators/ContactValidator';
import {validateTicketStore, validateTicketUpdate} from "../app/validators/TicketValidator";

const router = Router()

// Auth
router.post('/login', AuthController.authenticate)
router.post('/logout', authMiddleware, AuthController.deauthenticate)
router.get('/me', authMiddleware, AuthController.me)

// rotas de usuários
router.get('/users', authMiddleware, UserController.index)
router.get('/users/:id', authMiddleware, UserController.show)
router.post('/users', validateUserStore, handleValidation, UserController.store)
router.put('/users/:id', authMiddleware, validateUserUpdate, handleValidation, UserController.update)
router.delete('/users/:id', authMiddleware, UserController.destroy)
router.patch('/users/:id/activate', authMiddleware, UserController.enableOrDisable)
router.patch('/users/:id/status', authMiddleware, validateUserStatus, handleValidation, UserController.changeStatus)

// rotas de canais
router.get('/channels', authMiddleware, ChannelController.index)
router.get('/channels/:id/connect', authMiddleware, ChannelController.connect)
router.get('/channels/:id/status', authMiddleware, ChannelController.getStatus)
router.get('/channels/:id', authMiddleware, ChannelController.show)
router.post('/channels', authMiddleware, ChannelController.store)
router.put('/channels/:id', authMiddleware, ChannelController.update)
router.delete('/channels/:id', authMiddleware, ChannelController.destroy)

// Contacts routes
router.get('/contacts', authMiddleware, ContactController.index)
router.get('/contacts/:id', authMiddleware, ContactController.show)
router.post('/contacts', authMiddleware, validateContactStore, handleValidation, ContactController.store)
router.put('/contacts/:id', authMiddleware, validateContactUpdate, handleValidation, ContactController.update)
router.delete('/contacts/:id', authMiddleware, ContactController.destroy)

// Tickets routes
router.get('/tickets', authMiddleware, TicketController.index)
router.get('/tickets/:id', authMiddleware, handleValidation, TicketController.show)
router.post('/tickets', authMiddleware, validateTicketStore, handleValidation, TicketController.store)
router.put('/tickets/:id', authMiddleware, validateTicketUpdate, handleValidation, TicketController.update)
router.delete('/tickets/:id', authMiddleware, handleValidation, TicketController.destroy)

// Tickets Mensagens
router.get('/tickets/:id/messages', authMiddleware, MessageController.index)
// router.get('/tickets/:id/messages/:messageId', authMiddleware, handleValidation, MessageController.show)
router.post('/tickets/messages', authMiddleware, MessageController.store)
router.post('/tickets/messages/send', authMiddleware, MessageController.sendMessage)

// Storage
router.post('/storage/upload', authMiddleware, StorageController.upload)

// Webhooks
router.post('/webhook/evolution', WebhookController.evolutionHandle);

export default router
