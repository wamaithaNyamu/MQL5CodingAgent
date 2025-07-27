import type { Request, Response } from "express";
import { errorResponse, successResponse } from "../../utils/utils.response";
import { sendPromptToLLM } from "../../../temporal/clientServices/sendPrompt.client";
import { confirmToolRunSignal } from "../../../temporal/clientServices/confirmToolUse.client";
//CRUD imports
import {createMessage,getMessageByID,getAllMessagesByConversationById,updateMessageByID} from "../service/message.service"
import { createPayment } from "../service/payment.service";
// Temporal related
export const signalPromptToLLMController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { workflowId } = req.params;
        const { prompt } = req.body;

        console.log(`The new prompt is ${prompt} and has a workflowid of ${workflowId}`)
        if (!prompt) {
            res.status(400).json(errorResponse("Prompt is required"));
        }

        // Here you would typically send the prompt to the LLM
        await sendPromptToLLM(workflowId, prompt);
        // For now, we just simulate a response
        const response = `Response to prompt: ${prompt}`;

        res.status(200).json(successResponse({ response }));

        return
    } catch (err) {
        res.status(500).json(errorResponse("Failed to confirm too run"));
    }
}

 export const signalConfirmToolRunController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { workflowId } = req.params;
        const { confirmation,messageID } = req.body;


        console.log(`The new confirmation is ${confirmation} and has a workflowid of ${workflowId} and the message is ${messageID}`)
        if (!workflowId) {
            res.status(400).json(errorResponse("Workflow ID is required"));
        }

        // Here you would typically send the prompt to the LLM
        await confirmToolRunSignal(workflowId, confirmation);
        // update message
       const updatedMessage =  await updateMessageByID(messageID, {
              confirmed:confirmation,
              rejected:!confirmation
          });

          console.log(`The updated message on confirm is ${updatedMessage}`)

        res.status(200).json(successResponse({ updatedMessage,confirmation }));

        return
    } catch (err) {
            console.error(`The eerror sending signal confrimation is ${err}`)

        res.status(500).json(errorResponse("Failed to send prompt to LLM"));
    }


 }

// CRUD Related
export const getMessagesByConversationController = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Fetching messages for conversation");
    // Extract conversationId from request parameters
    console.log(req.params);
    const { conversationId } = req.params;
    const data = await getAllMessagesByConversationById(conversationId);
    res.status(200).json(successResponse(data));
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json(errorResponse("Failed to fetch messages"));
  }
};

export const createMessageController = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await createMessage(req.body);
    res.status(200).json(successResponse(data));
  } catch (err) {
    res.status(400).json(errorResponse(`Failed to create message: ${err instanceof Error ? err.message : String(err)}`));

  }
};

export const getMessageByIDController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await getMessageByID(id);
    res.status(204).end();
  } catch (err) {
    res.status(400).json(errorResponse(`Failed to delete message: ${err instanceof Error ? err.message : String(err)}`));

  }
};

export const confirmMessagePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { payment_failed,payment_status,paystack_reference} = req.body

   const data =  await updateMessageByID(id, {
      paymentfailed:payment_failed,
      paymentstatus:payment_status
    });

    console.log(`The payment referece is ${JSON.stringify(paystack_reference)}`)

    await createPayment({
      conversationId:data.conversationId,
      messageId:id,
      ...paystack_reference
    })
  

    res.status(200).json(successResponse(data));
  } catch (err) {
    res.status(400).json(errorResponse(`Failed to delete message: ${err instanceof Error ? err.message : String(err)}`));

  }
};