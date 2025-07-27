"use client";
import { useRouter } from 'next/navigation';
import { useMemo, useState, useRef } from "react";
import {
    TrendingUp,
    Presentation,
    MoreHorizontal,
    Star,
    ArrowRightCircle,
    X as CloseIcon, // Used for closing attachment previews
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
    useStartConversation, 
} from "@/hooks/use-conversations";

import ChatInputArea from "./ChatInputArea";


function ConversationsNew({
    showHeader = true,
}) {
    const [input, setInput] = useState("");
    const [attachments, setAttachments] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isTyping, setIsTyping] = useState(false); // This state will eventually be managed by the redirected page

    // Initial suggestions for starting a new strategy chat
    const initialSuggestions = useMemo(() => [
        {
            text: "Explain a simple EMA crossover strategy.",
            icon: <Presentation size={14} />,
        },
        {
            text: "Build a momentum strategy for crypto.",
            icon: <TrendingUp size={14} />,
        },
        {
            text: "Create a risk management plan for my strategy.",
            icon: <MoreHorizontal size={14} />,
        },
        {
            text: "I want to build a swing trading strategy?",
            icon: <ArrowRightCircle size={14} />,
        },
    ], []);

    const router = useRouter();

    // Hook for starting a new conversation. This is the only one needed here.
    const { startConversation } = useStartConversation();


    // Handles sending the *first* message to start a new conversation.
    const handleSendMessage = async () => {
        if (input.trim() === "" && attachments.length === 0) return

        try {
            // Initiate a new conversation
            const res = await startConversation({ initialPrompt:input.trim() });
            const newWorkflowId = res?.data?.workflowId;

            if (!newWorkflowId) {
                console.error("No workflowId received. Failed to start new conversation.");
                return;
            }

            console.log(`Started a new conversation ${newWorkflowId}`)
            // Redirect to the newly created conversation page
            router.push(`/conversations/${newWorkflowId}`);

            // Clean up attachment URLs
            attachments.forEach((_, i) => URL.revokeObjectURL(previewUrls[i]));
            setAttachments([]);
            setPreviewUrls([]);

        } catch (error) {
            console.error("Error starting new conversation:", error);
            // Removed: setIsTyping(false); // No need to set false if never set true
        }
    };

  
    // --- Attachment Handling ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files);
            const newAttachments = [...attachments, ...selectedFiles].slice(0, 3);

            setAttachments(newAttachments);
            const newPreviewUrls = newAttachments.map(file => URL.createObjectURL(file));
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

   

    return (
        // The main container for the chat interface.
        // It's styled to vertically center the "New Chat" content.
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden justify-center items-center">
            <div className="flex flex-1 flex-col h-full w-full max-w-3xl px-6 sm:px-8">
             
                {/* --- Main Content Area: Initial Suggestions --- */}
                {/* This section is visible only when no messages are present (i.e., at the start of a new chat) */}
                <div className="flex-1 flex flex-col items-center justify-center text-center overflow-y-auto scrollbar-none">
                    <div className="p-4 bg-gradient-to-br from-[#147303]/30 to-[#147303]/5 rounded-full flex items-center justify-center mb-2 mt-24 shadow-lg">
                        <img
                            src="/trading-icon.png"
                            alt="Goals Predicted AI"
                            className="w-8 h-8 text-[#147303]"
                            onError={(e) => {
                                // Fallback SVG if image fails to load
                                e.currentTarget.src =
                                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23147303' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2 2v20h20'/%3E%3Cpath d='m5 12.5 5-5 4 4L19 6'/%3E%3C/svg%3E";
                            }}
                        />
                    </div>
                    <h2 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-[#147303] to-[#147303]/70">
                        Let's build your strategy!
                    </h2>
                    <p className="text-muted-foreground max-w-md text-lg mb-8 leading-relaxed">
                        Describe your ideal trading strategy, define its rules, and let's optimize it together.
                        What kind of strategy would you like to build or explore today?
                    </p>
                    <div className="flex flex-col gap-3 w-full max-w-lg">
                        {initialSuggestions.map((suggestion) => (
                            <Button
                                key={suggestion.text}
                                variant="outline"
                                className="text-sm py-6 flex justify-start items-center border border-[#147303]/10 bg-card/50 hover:bg-[#147303]/5 shadow-sm transition-colors duration-200"
                                onClick={() => {
                                    setInput(suggestion.text);
                                    setTimeout(() => handleSendMessage(), 100); // Trigger send after state update
                                }}
                            >
                                <span className="text-[#147303] mr-2 flex-shrink-0">
                                    {suggestion.icon}
                                </span>
                                <span className="text-left flex-grow">{suggestion.text}</span>
                            </Button>
                        ))}
                    </div>
                    <div className="mt-10 flex items-center gap-2 text-muted-foreground">
                        <Star size={14} className="text-[#1A5D1A]" />
                        <span className="text-sm">
                            AI Companion is here to help you build and optimize your trading strategies.
                        </span>
                    </div>
                </div>

                {/* --- Chat Input Area --- */}
                <div className="flex flex-col justify-end p-4 border-t border-border/40">
                    {/* Attachment Previews */}
                    {previewUrls.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {previewUrls.map((url, index) => (
                                <div key={url} className="relative">
                                    <img src={url} alt="Preview" className="w-16 h-16 object-cover rounded-md" />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white hover:bg-red-600"
                                        onClick={() => removeAttachment(index)}
                                    >
                                        <CloseIcon size={12} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Input Field with Drag & Drop */}
                     {/* --- Chat Input Area Component --- */}
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
                {/* ---------------------------------- */}
                </div>
            </div>
        </div>
    );
}

export default ConversationsNew;