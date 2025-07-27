import { runStartConversationWorkFlow } from "../../../temporal/clientServices/startConversation.client";
import type { Request, Response } from "express";
import { errorResponse, successResponse } from "../../utils/utils.response";

export const triggerWorflow = async (req: Request, res: Response): Promise<void> => {
    try {

        console.log("Request body:", req.body);
        // run the workflow
        const workflowInfo = await runStartConversationWorkFlow(req.body);

        res.status(200).json(
            successResponse({
                message: "Workflow triggered successfully",
                data: workflowInfo
            }));
    } catch (err) {
        console.error(err);
        res.status(500).json(errorResponse("Failed to trigger workflow"));
    }
}

