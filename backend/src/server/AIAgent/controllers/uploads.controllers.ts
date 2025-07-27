import type { Request, Response } from "express";
import { errorResponse, successResponse } from "../../utils/utils.response";
import {getSignedUrl} from "../service/uploads.service";

export const getSignedURLController = async (req: Request, res: Response): Promise<void> => {
    try {
        const botName = req.body.botName
        console.log(`The bot name is ${botName}`)

        const data = await getSignedUrl(botName);
        console.log(`The data is ${data}`)
        res.status(200).json(successResponse({
            signedUrl:data
        }));
    } catch (err) {
        res.status(400).json(errorResponse(`Failed to get signed url: ${err instanceof Error ? err.message : String(err)}`));
    }
};
