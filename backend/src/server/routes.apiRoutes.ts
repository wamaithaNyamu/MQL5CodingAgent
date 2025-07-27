// import all routes here
import { Router } from 'express';
import workflowRoutes from './AIAgent/routes/routes.workflows';
import conversationRoutes from './AIAgent/routes/routes.conversations'
import messageRoutes from './AIAgent/routes/routes.messages';
import uploadsRoutes from './AIAgent/routes/routes.uploads';

const router = Router();


// =============AI AGENTS ROUTES==============
// CRUD conversation routes
router.use('/conversation', conversationRoutes);
// temporal workflow routes
router.use('/conversation-workflow', workflowRoutes);
// CRUD messages routes
router.use('/message', messageRoutes);
// CRUD uploads routes
router.use('/uploads', uploadsRoutes);

export default router;