"use client";
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from "react";
import {
    Trash2,
    Heart as HeartIcon,
    PenBox as PenBoxIcon,
    MoreVertical, // Changed from MoreHorizontal to MoreVertical, as used in Button
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    useSidebar,
} from "@/components/ui/sidebar";

import { useChatStore } from '@/stores/chatStore';
import { useGetAllConversations, useDeleteConversation } from "@/hooks/use-conversations";

interface ChatSession {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: Date;
    createdAt: Date;
    category?: "analysis" | "strategy" | "market" | "portfolio";
    favorite?: boolean;
}

function ChatSidebarContent() {
    const router = useRouter();
    const params = useParams();
    const routeConvoId = params.convoId as string | undefined;
    const activeSession = routeConvoId || null;

    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

    const { open, isMobile, setOpenMobile } = useSidebar();
    const setShowChartComponent = useChatStore((s) => s.setShowChartComponent);

    const toggleFavorite = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setChatSessions(
            chatSessions.map((session) =>
                session.id === id
                    ? { ...session, favorite: !session.favorite }
                    : session
            )
        );
    };

    const handleChatSelect = (id: string, title: string) => {
        setShowChartComponent(false)

        router.push(`/conversations/${id}`);
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    const createNewChat = () => {
        useChatStore.getState().clearMessages();
        setShowChartComponent(false)

        // Correctly redirect to /conversations/new if that's your new chat page
        router.push("/conversations");
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSessionToDelete(id);
        setShowChartComponent(false)

    };

    const deleteConversationMutation = useDeleteConversation();

    const confirmDelete = () => {
        if (sessionToDelete) {
            deleteConversationMutation.mutate(sessionToDelete, {
                onSuccess: () => {
                    setChatSessions(chatSessions.filter((session) => session.id !== sessionToDelete));
                    if (activeSession === sessionToDelete) {
                        router.push("/conversations"); // Redirect to base /conversations after deleting active chat
                        useChatStore.getState().clearMessages();
                    }
                    setSessionToDelete(null);
                },
                onError: (error) => {
                    console.error("Failed to delete conversation:", error);
                    setSessionToDelete(null);
                }
            });
        }
    };

    const { data: conversations } = useGetAllConversations();

    useEffect(() => {
        if (conversations) {
            setChatSessions(conversations);
            // This logic ensures a default chat is loaded when navigating to the base /conversations route
            // without a specific ID. You had this commented out, but it's useful for UX.
            // If you want /conversations to be a completely blank page, keep it commented.
            // if (!routeConvoId && conversations.length > 0) {
            //     router.replace(`/conversations/${conversations[0].id}`);
            // }
        }
    }, [conversations, routeConvoId, router]);

    return (
        <>
            <div className="p-4">
                <SidebarMenu className="space-y-0.2">
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="New Strategy Chat"
                            onClick={createNewChat}
                            className="w-full"
                            variant="default"
                            size="lg"
                            data-active={false}
                            data-state="inactive"
                            data-open={open}
                        >
                            <PenBoxIcon className="size-4" />
                            {open && (
                                <span className="font-medium">
                                    New Strategy Chat
                                </span>
                            )}
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </div>

            {open && (
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-accent/50 scrollbar-track-transparent">
                    {chatSessions.map((session) => (
                        <div
                            key={session.id}
                            onClick={() => handleChatSelect(session.id, session.title)}
                            // Removed 'group' from here as the button is not group-hover dependent anymore
                            className={`p-1.5 cursor-pointer flex items-center justify-between gap-2 rounded-lg m-1.5 transition-all duration-200 ${activeSession === session.id
                                    ? "bg-[#147303]/10 border-l-2 border-[#147303] shadow-sm"
                                    : "hover:bg-accent/10 border-l-2 border-transparent"
                                }`}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="text-sm text-muted-foreground truncate">
                                    {session.title}
                                </div>
                            </div>

                            {/* Menu Trigger: Show only on active session */}
                            <div className="relative">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            // Apply opacity-100 only if it's the active session
                                            // Otherwise, it will be opacity-0 and will not show on hover
                                            className={`h-6 w-6 rounded-full transition-opacity flex-shrink-0 ${session.id === activeSession
                                                    ? "opacity-100" // Visible for active session
                                                    : "opacity-0"   // Hidden for non-active sessions
                                                }`}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MoreVertical size={13} className="text-muted-foreground" />
                                            <span className="sr-only">More options</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40 text-sm z-50">
                                        <DropdownMenuItem onClick={(e) => toggleFavorite(session.id, e)}>
                                            <HeartIcon
                                                size={14}
                                                className="mr-2"
                                                fill={session.favorite ? "#1A5D1A" : "none"}
                                                stroke={session.favorite ? "none" : "currentColor"}
                                            />
                                            {session.favorite ? "Unfavorite" : "Favorite"}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={(e) => handleDeleteClick(session.id, e)}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <Trash2 size={14} className="mr-2" />
                                            Delete Chat
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={!!sessionToDelete} onOpenChange={(open) => !open && setSessionToDelete(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center">Delete Chat Session</DialogTitle>
                        <DialogDescription className="text-center">
                            Are you sure you want to delete this chat session? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center py-3">
                        <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                            <Trash2 className="h-5 w-5 text-destructive" />
                        </div>
                    </div>
                    <DialogFooter className="flex flex-row justify-between gap-2 sm:justify-between">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setSessionToDelete(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1 bg-destructive/90 hover:bg-destructive"
                            onClick={confirmDelete}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default ChatSidebarContent;