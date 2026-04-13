"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User, ArrowLeft, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Navbar } from "@/components/layout/Navbar";
import { getSocket } from "@/lib/socket";
import { useSession } from "@/lib/sessionContext";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const { user, token, loading: sessionLoading } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = getSocket();
  const router = useRouter();

  useEffect(() => {
    if (!sessionLoading) {
        if (!user) {
            router.push("/login");
            return;
        }
        if (user.role === 'admin') {
            router.push("/admin/chat");
            return;
        }
        startChat();
    }
  }, [sessionLoading, user]);

  useEffect(() => {
    if (conversation) {
      socket.emit("join_conversation", conversation.id);
      
      socket.on("receive_message", (msg) => {
        if (msg.conversationId === conversation.id) {
          setMessages((prev) => [...prev, msg]);
          socket.emit("mark_as_read", { conversationId: conversation.id, userId: user?.id });
        }
      });

      return () => {
        socket.off("receive_message");
      };
    }
  }, [conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startChat = async () => {
    setLoading(true);
    try {
      const convRes = await fetch("https://transly-wr1m.onrender.com/chat/conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({}),
      });
      const convData = await convRes.json();
      if (convData.success && convData.conversation) {
        setConversation(convData.conversation);
        fetchMessages(convData.conversation.id);
      }
    } catch (err) {
      console.error("Failed to start chat:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`https://transly-wr1m.onrender.com/chat/${convId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include"
      });
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

  if (sessionLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-orange-600 mb-4" />
        <p className="text-slate-500 font-medium">Loading your conversation...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <Navbar />
      
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full border-x border-slate-100 overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="md:hidden">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900">Transly Support</h1>
              <p className="text-xs text-green-500 flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                Online
              </p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-orange-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-orange-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">How can we help?</h2>
              <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2">Our support team is typically online and ready to assist with your delivery requests.</p>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl text-sm shadow-sm ${
                msg.senderId === user?.id
                  ? 'bg-orange-600 text-white rounded-tr-none shadow-orange-100'
                  : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
              }`}>
                {msg.text}
                <div className={`text-[10px] mt-1 opacity-70 ${msg.senderId === user?.id ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2 max-w-3xl mx-auto">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Tell us what's on your mind..."
              className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-orange-600"
            />
            <Button onClick={handleSend} className="h-12 w-12 rounded-xl bg-orange-600 hover:bg-orange-700 flex-shrink-0 p-0">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
