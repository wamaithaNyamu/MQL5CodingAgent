"use client";
import { v4 as uuidv4 } from 'uuid'; // for temporary message ID
import { useParams } from 'next/navigation';

import { useMemo, useCallback } from "react";
import { useState, useRef, useEffect } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message, useChatStore } from '@/stores/chatStore';
// import { useConversationChannel } from "@/hooks/useConversationChannel"
import { useSocketMessages } from "@/hooks/useSocketMessages";
import DocumentDownloader from "@/components/documentDownloader"

// import hooks
import {
    useGetMessagesForConversation,
    useSendMessage,
    useSendWorkflowConfirmation,
    useStartConversation
} from "@/hooks/use-conversations";

import ConfirmInline from "../InlineComponents/confirmInline";
import { renderMessageContent, extractRenderableContent } from "../messageBox"; // Assuming this is the correct path to your message rendering function
// --- Import the new component ---
import ChatInputArea from "../ChatInputArea";
import { PaymentComponent } from '../InlineComponents/paystack'
import type { PaystackReference } from '../InlineComponents/paystack'
import { toast } from 'sonner';

// --------------------------------



interface ChatSession {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: Date;
    createdAt: Date;

    category?: "analysis" | "strategy" | "market" | "portfolio";
    favorite?: boolean;
}


export default function AIChatComponent() {

    const [input, setInput] = useState("");
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [showChatInput, setShowChatInput] = useState(true);

    const [isTyping, setIsTyping] = useState(false);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);


    // const router = useRouter(); // 👈 Initialize useRouter
    const params = useParams(); // 👈 Initialize useParams
    // 👈 Get the `convoId` from the URL parameters
    const routeConvoId = params.convoId as string | undefined;
    const activeSession = routeConvoId || null;
    const { botNamesBySession } = useChatStore();
    const currentSessionBotName = activeSession ? botNamesBySession[activeSession] : undefined;

    // ✅ Pull addMessage from Zustand ONCE at the top level
    const addMessage = useChatStore((s) => s.addMessage); // Use this single reference

    // ✅ useChatStore is called at the top level
    const messagesBySession = useChatStore(state => state.messagesBySession);

    // ✅ memoize only the derived data
    const messages = useMemo(() => {
        return messagesBySession[activeSession ?? ""] || [];
    }, [messagesBySession, activeSession]);


    useGetMessagesForConversation(activeSession ?? "");

    // ✅ Memoize the onNewMessage callback
    const handleSocketNewMessage = useCallback((message: Message) => {
        console.log("🔥 Socket callback triggered. Received message:", message); // <-- CRITICAL LOG
        if (message.role === 'assistant') { // Explicitly check role here
            console.log("🔥 Socket: It's an ASSISTANT message, adding to Zustand.");
            if (activeSession) {
                addMessage(activeSession, message);
                setIsTyping(false);
                // it implies a chart/result is ready, so set chatEnded to true
                if (message.signedUrl) {
                    console.log("⭐ Socket: Assistant message has signedUrl, setting chatEnded(true)");
                    setShowChatInput(false); // Often, if a chart is shown, input is not hidden
                }

            }
        } else {
            console.warn("⚠️ Socket: Received NON-ASSISTANT message via socket, SKIPPING ADD TO ZUSTAND:", message); // <-- CRITICAL LOG
        }
    }, [activeSession, addMessage, setIsTyping]);

    useSocketMessages(activeSession, handleSocketNewMessage);
    const sendMessageMutation = useSendMessage(activeSession ?? "");
    const { startConversation } = useStartConversation();

    const handleSendMessage = async () => {
        if (input.trim() === "" && attachments.length === 0) return;

        const tempId = uuidv4();
        const message: Message = {
            id: tempId,
            content: input,
            role: "user",
            timestamp: new Date().toISOString(),
            next: "",
            args: {},
            tool: "",
        };

        setInput("");
        setIsTyping(true);

        // 🟢 NEW CONVERSATION
        if (!activeSession) {
            setIsTyping(true);

            const res = await startConversation({ initialPrompt: input });
            const workflowId = res?.data?.workflowId;

            if (!workflowId) {
                console.error("No workflowId received.");
                setIsTyping(false);
                return;
            }

            // ✅ Store to Zustand for new session
            addMessage(workflowId, message); // <-- Use the consistent 'addMessage' here
            const newSession: ChatSession = {
                id: workflowId,
                title: input,
                lastMessage: input,
                timestamp: new Date(),
                createdAt: new Date(),
            };
            setChatSessions([newSession, ...chatSessions]);
            setIsTyping(false);
            return;
        }

        // 🟡 EXISTING CONVERSATION
        addMessage(activeSession, message); // <-- Use the consistent 'addMessage' here

        // Cleanup
        attachments.forEach((_, i) => URL.revokeObjectURL(previewUrls[i]));
        setAttachments([]);
        setPreviewUrls([]);

        // 🔁 Send to Temporal
        await sendMessageMutation.mutateAsync({
            prompt: input,
        });

    };

    // this will be used to scroll to the bottom of the chat
    const messagesEndRef = useRef<HTMLDivElement>(null);

  // AIChatComponent.tsx
  useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }

    
        // Determine if the chat input should be hidden
        // The input should only be hidden if the conversation is "concluded,"
        // which is indicated by a signed URL for a final document.
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
        const hasSignedUrl = lastMessage?.signedUrl;
        
        if (hasSignedUrl) {
            setShowChatInput(false);
        } else {
            // Keep the input visible if the chart is shown or the conversation is ongoing
            setShowChatInput(true);
        }

    }, [messages, activeSession]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files);
            const newAttachments = [...attachments, ...selectedFiles].slice(0, 3); // Limit to 3 attachments

            setAttachments(newAttachments);

            // Generate preview URLs for the images
            const newPreviewUrls = newAttachments.map(file => URL.createObjectURL(file));

            // Clean up previous preview URLs to avoid memory leaks
            previewUrls.forEach(url => URL.revokeObjectURL(url));

            setPreviewUrls(newPreviewUrls);
        }
    };

    const removeAttachment = (index: number) => {
        URL.revokeObjectURL(previewUrls[index]);

        setAttachments(current => current.filter((_, i) => i !== index));
        setPreviewUrls(current => current.filter((_, i) => i !== index));
    };

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    // Add these functions
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFiles = Array.from(e.dataTransfer.files).filter(file =>
                file.type.startsWith('image/')
            );

            const newAttachments = [...attachments, ...droppedFiles].slice(0, 3);
            setAttachments(newAttachments);

            const newPreviewUrls = newAttachments.map(file => URL.createObjectURL(file));
            previewUrls.forEach(url => URL.revokeObjectURL(url));
            setPreviewUrls(newPreviewUrls);
        }
    };

    // handle confirmation
    // handle confirmation
    const { sendConfirmation, isLoading, isError, error } = useSendWorkflowConfirmation(activeSession ?? '');

    // ✅ Stabilize handleConfirm with useCallback
    const handleConfirm = ((messageID: string) => {
        console.log("handleConfirm triggered for messageID:", messageID);
        sendConfirmation({ confirmation: true, messageID: messageID });
        setShowChatInput(true); // Your UI logic

    })
    // ✅ Stabilize handleRejection with useCallback
    const handleRejection = ((messageID: string) => {
        console.log("handleRejection triggered for messageID:", messageID);
        sendConfirmation({ confirmation: false, messageID: messageID });
        setShowChatInput(true); // Your UI logic

        // Optional: Log error if the mutation is in an error state
        if (isError && error) {
            console.error("Mutation error detected after rejection:", error);
        }
    })

    const handlePaymentSuccess = (reference: PaystackReference) => {
        console.log("Payment was a success! Reference:", reference);
        // You can send this reference to your backend for verification
        console.log(`The reference number is ${JSON.stringify(reference)}`)
        toast.success("We have a payment success!")
        setShowChatInput(true)

        sendConfirmation({ confirmation: true, messageID: activeSession ?? "" });
    };

    const handlePaymentClose = () => {
        console.log("Payment closed without completing.");
        toast.error("Something went wrong with the payment. Please try again")
        setShowChatInput(true)


    };


    return (

        <div className="flex h-[calc(100vh-4rem)] overflow-hidden pt-6">

            {/* Wrapper to center chat content */}
            <div className="flex flex-1 h-full overflow-hidden transition-all duration-300 ease-in-out">
                {/* Sidebar will go before this block in parent layout */}

                {/* Main chat content area */}
                <div className="flex-1 flex justify-center px-6 sm:px-8">
                    <div className="w-full max-w-3xl flex flex-col h-full">
                        {/* Main chat area */}
                        <div className="flex-1 flex flex-col h-full  transition-all duration-300 ease-in-out">
                            {/* Chat messages area */}
                            <div className="flex-1  overflow-y-auto scrollbar-none">
                                {messages.length > 0 && (
                                    <div className="space-y-2">
                                        {messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                                                    }`}
                                            >

                                                <div
                                                    className={`max-w-[100%] p-4 rounded-2xl ${message.role === "user"
                                                        ? "text-[#1A5D1A]  opacity-90 bg-green-100 "
                                                        : "text-card-foreground backdrop-blur-sm"
                                                        }`}
                                                >
                                                    <div>{renderMessageContent(
                                                        extractRenderableContent(message.content ?? message.response ?? "")

                                                    )}</div>
                                                    {message.signedUrl && (
                                                        <DocumentDownloader documentName={`${currentSessionBotName}.mq5`} />
                                                    )}
                                                    {message.next === "confirm" && message.tool === "CreateInvoice"
                                                        && message.args?.userName !== null && message.args?.userName !== "null" // ✅ Added check for "null" string
                                                        && message.args?.userEmail !== null && message.args?.userEmail !== "null" // ✅ Added check for "null" string
                                                        && message.args?.productName !== null && message.args?.productName !== "null" // ✅ Added check for "null" string
                                                        && (
                                                            <PaymentComponent
                                                                userName={message.args.userName}
                                                                productName={message.args.productName}
                                                                productDescription={message.args.productDescription}
                                                                amount={parseInt(message.args.amount)}
                                                                paystackEmail={message.args.userEmail}
                                                                onPaymentSuccess={handlePaymentSuccess}
                                                                onPaymentClose={handlePaymentClose}
                                                                messageId={message.id}
                                                                paymentStatus={!!message.paymentstatus}
                                                            // onContinueConversationClick={handleContinueConversationPayments(message.id)}
                                                            />
                                                        )}
                                                    {/* if the confirmation tool needs to be shwn */}
                                                    {message.next === "confirm" && message.tool !== "CreateInvoice" && (<>
                                                        {/* {message.next === "confirm" && (<> */}
                                                        <ConfirmInline
                                                            sessionId={activeSession ?? ""}
                                                            data={
                                                                message.args !== undefined || message.tool !== undefined
                                                                    ? { args: message.args, tool: message.tool }
                                                                    : null
                                                            }
                                                            confirming={isLoading}
                                                            confirmed={!!message.confirmed}
                                                            rejected={!!message.rejected}
                                                            onConfirm={() => {
                                                                handleConfirm(message.id)
                                                                // Implement your confirmation logic here
                                                                console.log("User confirmed the inline tool execution");
                                                            }}
                                                            onReject={() => {
                                                                handleRejection(message.id)
                                                                console.log("User rejected the inline tool execution");
                                                            }}
                                                        />
                                                    </>
                                                    )}

                                                    {/* Attachments for AI responses */}
                                                    {/* {message.attachments && message.attachments.length > 0 && (
                                                <>

                                                    <div className="mt-3">
                                                        <ConfirmInline {...sampleConfirmInlineProps} />
                                                    </div>

                                                </>
                                            )} */}


                                                    <div
                                                        className={`text-xs mt-1 ${message.role === "user"
                                                            ? "text-slate-400"
                                                            : "text-muted-foreground"
                                                            }`}
                                                    >


                                                        {/* {new Date(message?.timestamp).toLocaleDateString(undefined, {
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })} */}

                                                    </div>
                                                </div>
                                                {/* {message.role === "user" && (
                                                        <Avatar className="ml-2 h-8 w-8 mt-1">
                                                            <AvatarImage src="/1.png" />
                                                            <AvatarFallback className="bg-accent/80 text-accent-foreground">
                                                                You
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    )} */}
                                            </div>
                                        ))}
                                        {isTyping && (
                                            <div className="flex justify-start">
                                                <Avatar className="mr-2 h-8 w-8 mt-1">
                                                    <AvatarImage src="/1.png" />
                                                    <AvatarFallback className="bg-gradient-to-br from-[#147303]/30 to-[#147303]/10 text-[#147303]">
                                                        PIP
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="bg-card/80 p-4 rounded-2xl rounded-tl-none shadow-sm border border-border/40 backdrop-blur-sm">
                                                    <div className="flex space-x-2">
                                                        <div className="h-2 w-2 rounded-full bg-[#147303]/60 animate-pulse"></div>
                                                        <div className="h-2 w-2 rounded-full bg-[#147303]/60 animate-pulse delay-75"></div>
                                                        <div className="h-2 w-2 rounded-full bg-[#147303]/60 animate-pulse delay-150"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}


                                        {/* this div is being targeted as the bottom scroll */}
                                        <div ref={messagesEndRef} />

                                    </div>
                                )}
                            </div>
                            {/* --- Chat Input Area Component --- */}
                            {showChatInput && (
                                <ChatInputArea
                                    input={input}
                                    setInput={setInput}
                                    attachments={attachments}
                                    previewUrls={previewUrls}
                                    handleSendMessage={handleSendMessage}
                                    handleFileChange={handleFileChange}
                                    removeAttachment={removeAttachment}
                                    handleAttachClick={handleAttachClick} // Pass the wrapper function
                                    isDragging={isDragging}
                                    handleDragOver={handleDragOver}
                                    handleDragLeave={handleDragLeave}
                                    handleDrop={handleDrop}
                                    sendButtonDisabled={isTyping || (input.trim() === "" && attachments.length === 0)}
                                />
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}