import type { Request, Response } from "express";
import { errorResponse, successResponse } from "../../utils/utils.response";
import { setConversationEnded } from '../../../temporal/signals/conversation.signals';
import { getWorkFlowClient } from '../../../temporal/clientServices/client';

export const triggerWorflow = async (req: Request, res: Response): Promise<void> => {
    try {

        console.log("Request body:", req.body);
        const { workflowId } = req.body;
        if (!workflowId) {
            res.status(400).json({ error: 'Missing workflowId' });
            return;
        }
        // Get the workflow client
        const workflowClient = await getWorkFlowClient();
        const handle = workflowClient.workflow.getHandle(workflowId);
        if (!handle) {
            res.status(404).json({ error: 'Workflow not found' });
            return;
        }

        await handle.signal(setConversationEnded);
        res.status(200).json(
            successResponse({
                message: 'Conversation end signal sent successfully.'

            }));
    } catch (err) {
        console.error(err);
        res.status(500).json(errorResponse("Failed to trigger workflow"));
    }
}