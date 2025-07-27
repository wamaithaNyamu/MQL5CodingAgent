import type { Request, Response } from "express";
import { errorResponse, successResponse } from "../../utils/utils.response";
import { queryConversationId } from "../../../temporal/clientServices/queryConversation.client";

//CRUD imports
import { getAllConversations, getConversationById, createConversation, updateConversation, deleteConversation } from "../service/conversation.service";


// Temporal related
export const queryConversationIdController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { workflowId } = req.params;
        const id = await queryConversationId(workflowId);

        res.status(200).json(successResponse({ conversationId: id }));
    } catch (err) {
        res.status(500).json(errorResponse("Failed to query conversationId"));
    }
};


//CRUD related
export const getAllConversationsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await getAllConversations();
        res.status(200).json(successResponse(data));
    } catch (err) {
        console.error(`Error fetching conversations, ${err}`)
        res.status(500).json(errorResponse("Failed to fetch conversations"));
    }
};

export const getConversationByIdController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const data = await getConversationById(id);
        res.status(200).json(successResponse(data));
    } catch (err) {
        res.status(500).json(errorResponse("Failed to fetch conversation"));
    }
};

export const createConversationController = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await createConversation(req.body);
        res.status(201).json(successResponse(data));
    } catch (err) {
        res.status(400).json(errorResponse(`Failed to create conversation: ${err instanceof Error ? err.message : String(err)}`));
    }
};

export const updateConversationController = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await updateConversation(req.body);
        res.status(200).json(successResponse(data));
    } catch (err) {
        res.status(400).json(errorResponse(`Failed to update conversation: ${err instanceof Error ? err.message : String(err)}`));
    }
};

export const deleteConversationController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deleted = await deleteConversation(id);
        if(deleted){
         res.status(200).json(successResponse("Conversation deleted successfully!"));

        }else{
             res.status(500).json(errorResponse("Failed to delete conversation"));
        }
    } catch (err) {
        res.status(500).json(errorResponse("Failed to delete conversation"));
    }
};