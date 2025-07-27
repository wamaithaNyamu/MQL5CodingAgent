import express from 'express';
import {
    signalPromptToLLMController,
    getMessagesByConversationController,
    createMessageController,
    getMessageByIDController,
    signalConfirmToolRunController,
    confirmMessagePayment
} from '../controllers/controller.messages'
const router = express.Router();

// temporal conversation related
router.post('/signal/send-prompt/:workflowId', signalPromptToLLMController);
router.post('/signal/confirm/:workflowId', signalConfirmToolRunController);

// CRUD operations for conversations
router.get('/conversation/:conversationId', getMessagesByConversationController);
router.get('/:id', getMessageByIDController);
router.post('/payment/:id', confirmMessagePayment);

router.post('/', createMessageController);

export default router;