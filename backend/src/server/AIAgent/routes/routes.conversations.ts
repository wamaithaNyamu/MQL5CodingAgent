import express from 'express';
import { 
    queryConversationIdController,
    getAllConversationsController,
    getConversationByIdController,
    updateConversationController,
    createConversationController,
    deleteConversationController 
} from '../controllers/conversation.controller';

const router =  express.Router();

// temporal conversation related
router.get('/query/:workflowId', queryConversationIdController);

// CRUD operations for conversations
router.get('/', getAllConversationsController);
router.get('/:id', getConversationByIdController);
router.post('/', createConversationController);
router.put('/', updateConversationController);  
router.delete('/:id',deleteConversationController)

export default router;