import {Router} from 'express'
import UserController from '../app/controllers/UserController'
import AuthController from '../app/controllers/AuthController'
import {authMiddleware} from '../app/middlewares/authMiddleware';
import ChannelController from '../app/controllers/ChannelController';
import ContactController from '../app/controllers/ContactController';
import WebhookController from '../app/controllers/WebhookController';
import {handleValidation} from '../app/middlewares/handleValidationMiddleware';
import {
  validateUserStore,
  validateUserUpdate,
  validateIdParam,
  validateUserStatus,
} from '../app/validators/UserValidator';
import {validateContactStore, validateContactUpdate, validateIdParam} from '../app/validators/ContactValidator';

const router = Router()

// Auth
router.post('/login', AuthController.authenticate)
router.post('/logout', authMiddleware, AuthController.deauthenticate)
router.get('/me', authMiddleware, AuthController.me)

// rotas de usuários
router.get('/users', authMiddleware, UserController.index)
router.get('/users/:id', authMiddleware, validateIdParam, handleValidation, UserController.show)
router.post('/users', validateUserStore, handleValidation, UserController.store)
router.put('/users/:id', authMiddleware, validateIdParam, validateUserUpdate, handleValidation, UserController.update)
router.delete('/users/:id', authMiddleware, validateIdParam, handleValidation, UserController.destroy)
router.patch('/users/:id/activate', authMiddleware, validateIdParam, handleValidation, UserController.enableOrDisable)
router.patch('/users/:id/status', authMiddleware, validateIdParam, validateUserStatus, handleValidation, UserController.changeStatus)

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

//Todo mensagens

router.post('/webhook/evolution', WebhookController.evolutionHandle);

export default router
