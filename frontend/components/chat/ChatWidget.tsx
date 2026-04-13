"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { getSocket } from "@/lib/socket";
import { useSession } from "@/lib/sessionContext";
import { apiFetch } from "@/lib/api";

export function ChatWidget() {
  const { user, token } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = getSocket();

  useEffect(() => {
    if (user && isOpen) {
      startChat(user);
      setUnreadCount(0);
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (user) {
      socket.emit("join_personal_room", user.id);

      socket.on("new_message_notification", (data) => {
        if (!isOpen) {
          setUnreadCount(prev => prev + 1);
        }
      });

      return () => {
        socket.off("new_message_notification");
      };
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (conversation) {
      socket.emit("join_conversation", conversation.id);

      if (isOpen && user) {
        socket.emit("mark_as_read", { conversationId: conversation.id, userId: user.id });
      }

      socket.on("receive_message", (msg) => {
        if (msg.conversationId === conversation.id) {
          setMessages((prev) => [...prev, msg]);
          if (isOpen && user) {
            socket.emit("mark_as_read", { conversationId: conversation.id, userId: user.id });
          }
        }
      });

      return () => {
        socket.off("receive_message");
      };
    }
  }, [conversation, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startChat = async (currentUser: any) => {
    try {
      // Start or get conversation - backend will find an admin if we don't provide user2Id
      const convRes = await apiFetch("/chat/conversation", {
        method: "POST",
        body: JSON.stringify({}),
      }, token);
      const convData = await convRes.json();
      if (convData.success && convData.conversation) {
        setConversation(convData.conversation);
        fetchMessages(convData.conversation.id, token);
      } else {
        console.error("Failed to start conversation:", convData.error);
      }
    } catch (err) {
      console.error("Failed to start chat:", err);
    }
  };

  const fetchMessages = async (convId: string, token: string | null) => {
    try {
      const res = await apiFetch(`/chat/${convId}/messages`, {}, token);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = () => {
    if (!input.trim() || !conversation || !user) return;

    const msgData = {
      conversationId: conversation.id,
      senderId: user.id,
      text: input,
    };

    socket.emit("send_message", msgData);
    setInput("");
  };

  if (!user || user.role === 'admin') return null;

  return (
    <div className="fixed bottom-6 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 md:h-14 md:w-14 rounded-full shadow-2xl bg-orange-600 hover:bg-orange-700 p-0 flex items-center justify-center animate-bounce-subtle relative pointer-events-auto"
        >
          <MessageCircle className="h-6 w-6 md:h-7 md:w-7 text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      ) : (
        <Card className="w-[calc(100vw-2rem)] sm:w-96 border-0 shadow-2xl rounded-2xl overflow-hidden glass flex flex-col h-[500px] max-h-[80vh] pointer-events-auto translate-y-[-1rem] md:translate-y-0 shadow-orange-900/20">
          <CardHeader className="bg-orange-600 text-white py-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
              Transly Support
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-orange-700 h-8 w-8">
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.length === 0 && (
              <div className="text-center py-10">
                <div className="bg-orange-100 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="h-6 w-6 text-orange-600" />
                </div>
                <p className="text-sm text-slate-500">Welcome! How can we help you today?</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.senderId === user.id ? 'justify-end pt-5' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.senderId === user.id
                    ? 'bg-orange-600 text-white rounded-tr-none shadow-orange-100 shadow-lg'
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100 shadow-sm'
                  }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>
          <CardFooter className="p-3 border-t bg-white">
            <div className="flex w-full gap-2 mt-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="rounded-full bg-slate-100 border-none focus-visible:ring-orange-600"
              />
              <Button onClick={handleSend} size="icon" className="rounded-full bg-orange-600 hover:bg-orange-700 flex-shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
