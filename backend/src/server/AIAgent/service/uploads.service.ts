// get signed url
import {generateV4ReadSignedUrl} from '../../utils/utils.uploadToGCS';


export const getSignedUrl = async (botName:string) => {
    try {
        const signedUrl = await generateV4ReadSignedUrl(botName);
        return signedUrl;
    } catch (error) {
        console.error('Error generating signed URL:', error);
        throw new Error('Failed to generate signed URL');
    }
};