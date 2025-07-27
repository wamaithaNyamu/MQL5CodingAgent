// src/components/chat/ChatInputArea.tsx
import React, { useRef } from 'react';
import { Send, Upload, X as CloseIcon, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputAreaProps {
    input: string;
    setInput: (value: string) => void;
    attachments: File[];
    previewUrls: string[];
    handleSendMessage: () => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeAttachment: (index: number) => void;
    handleAttachClick: () => void;
    isDragging: boolean;
    handleDragOver: (e: React.DragEvent) => void;
    handleDragLeave: () => void;
    handleDrop: (e: React.DragEvent) => void;
    sendButtonDisabled: boolean; // Prop to disable send button
}

function ChatInputArea({
    input,
    setInput,
    attachments,
    previewUrls,
    handleSendMessage,
    handleFileChange,
    removeAttachment,
    handleAttachClick,
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    sendButtonDisabled,
}: ChatInputAreaProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Propagate the click to the hidden file input
    const onAttachClick = () => {
        handleAttachClick();
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Clear the input to allow selecting same file again
        }
    };

    return (
        <div className="flex flex-col justify-end pt-4 border-t border-border/40">
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
            <div
                className={`flex items-end space-x-2 border rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-primary/50 transition-all duration-200 ${isDragging ? "border-primary ring-2 ring-primary/50" : "border-input"}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <Button
                    variant="ghost"
                    size="icon"
                    className="self-center p-2 text-muted-foreground"
                    onClick={onAttachClick} // Use the wrapper function here
                    type="button"
                >
                    <Upload size={20} />
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        multiple
                        accept="image/*"
                    />
                    <span className="sr-only">Attach files</span>
                </Button>

                <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                    placeholder="Start a new strategy conversation..."
                    rows={4}
                    className="flex-1 resize-none border-none shadow-none focus-visible:ring-0 text-base py-3"
                />

                <Button
                    size="icon"
                    className="self-center m-2 p-2 rounded-full h-9 w-9"
                    onClick={handleSendMessage}
                    disabled={sendButtonDisabled}
                    type="submit"
                >
                    <Send size={20} />
                    <span className="sr-only">Send message</span>
                </Button>
            </div>
               <div className="mt-2 flex justify-center items-center gap-0.5 text-muted-foreground">
                        {/* <Star size={14} className="text-[#1A5D1A]" /> */}
                        <span className="text-sm">
                            AI Companion can make mistakes. Please verify the responses.
                        </span>
                    </div>
        </div>
        
    );
}

export default ChatInputArea;