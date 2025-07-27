import express from 'express';
import { triggerWorflow as startConversationWorkflow } from '../controllers/startConversationWorkflow.controller';
import { triggerWorflow as endConversationWorkflow } from '../controllers/endConversationWorkflow.controller';
import { queryConversationIdController  } from '../controllers/conversation.controller';

const router =  express.Router();

router.post('/workflow/start-conversation', startConversationWorkflow);
router.post('/signal/end-conversation', endConversationWorkflow);

// temporal conversation related
router.get('/query/:workflowId', queryConversationIdController);

export default router;