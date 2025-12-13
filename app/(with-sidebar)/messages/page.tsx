"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Message } from "@/lib/message-types";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesPage() {
    const t = useTranslations("Sidebar");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await fetch("/api/messages");
                
                if (!response.ok) {
                    throw new Error("Failed to fetch messages");
                }
                
                const data = await response.json();
                setMessages(data.messages || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, []);

    return (
        <div className="flex flex-col w-full h-full gap-4 p-8">
            <span className="text-4xl font-semibold">{t("messages")}</span>
            
            {loading && (
                <div className="flex flex-col gap-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            )}
            
            {error && (
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Error</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                </Card>
            )}
            
            {!loading && !error && messages.length === 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>No messages</CardTitle>
                        <CardDescription>You don&apos;t have any messages yet.</CardDescription>
                    </CardHeader>
                </Card>
            )}
            
            {!loading && !error && messages.length > 0 && (
                <div className="flex flex-col gap-3">
                    {messages.map((message) => (
                        <Card 
                            key={message.id}
                            className={message.isUnread ? "border-primary" : ""}
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">
                                            {message.isUnread && (
                                                <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2" />
                                            )}
                                            {message.subject}
                                        </CardTitle>
                                        <CardDescription className="mt-2">
                                            From: {message.sender}
                                        </CardDescription>
                                    </div>
                                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                                        {message.sentAt}
                                    </span>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
