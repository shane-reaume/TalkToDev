import { Router } from 'express';
import { ChatController } from '../controllers/chat';

const router = Router();
const chatController = ChatController.getInstance();

router.get('/models', (req, res) => chatController.getAvailableModels(req, res));
router.post('/message', (req, res) => chatController.sendMessage(req, res));
router.post('/config', (req, res) => chatController.updateConfig(req, res));

export const chatRouter = router; 