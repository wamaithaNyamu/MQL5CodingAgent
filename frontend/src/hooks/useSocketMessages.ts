import { useEffect } from 'react';
import {  Message } from '@/stores/chatStore'; // Ensure Message type is imported
import socket from '@/lib/socket';

export function useSocketMessages(sessionId: string | null, onNewMessage: (message: Message) => void) {

    useEffect(() => {
        if (!sessionId) {
            console.log("No sessionId, skipping socket connection.");
            return;
        }

        console.log(`Joining socket conversation for session: ${sessionId}`);
        socket.emit('join-conversation', sessionId);
        console.log(`Socket joined conversation: ${sessionId}`);

        // Listen for new incoming messages from socket
        const handleNewMessage = (message: Message) => {
            console.log(`New message received for session ${sessionId}:`, message);
            // Call the provided callback function
            onNewMessage(message);
        };

        socket.on('new-message', handleNewMessage);

        // Cleanup on unmount or session change
        return () => {
            console.log(`Leaving socket conversation for session: ${sessionId}`);
            socket.off('new-message', handleNewMessage); // Pass the specific handler to off
            // Optionally, you might want to emit a 'leave-conversation' event if your backend supports it
            // socket.emit('leave-conversation', sessionId);
        };
    }, [sessionId, onNewMessage]); // Add onNewMessage to dependency array
}