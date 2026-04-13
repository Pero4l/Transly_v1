"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Send, User as UserIcon, Search, Check, MessageCircle } from "lucide-react";
import { getSocket } from "@/lib/socket";
import { useSession } from "@/lib/sessionContext";

export default function AdminChatPage() {
  const { user, token, loading: sessionLoading } = useSession();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = getSocket();

  useEffect(() => {
    if (!sessionLoading && token) {
        fetchConversations();
    }
  }, [sessionLoading, token]);

  useEffect(() => {
    if (selectedConv) {
      socket.emit("join_conversation", selectedConv.id);
      fetchMessages(selectedConv.id);
      
      // Mark as read on selection
      if (user) {
        socket.emit("mark_as_read", { conversationId: selectedConv.id, userId: user.id });
      }
      setConversations(prev => prev.map(c => 
        c.id === selectedConv.id ? { ...c, unreadCount: 0 } : c
      ));

      socket.on("receive_message", (msg) => {
        if (msg.conversationId === selectedConv.id) {
          setMessages((prev) => [...prev, msg]);
          // Mark as read since we are looking at it
          if (user) {
            socket.emit("mark_as_read", { conversationId: selectedConv.id, userId: user.id });
          }
        }
        
        // Update last message and unread count if not selected
        setConversations(prev => prev.map(c => 
          c.id === msg.conversationId ? { 
            ...c, 
            lastMessage: msg.text,
            unreadCount: (selectedConv?.id === msg.conversationId || msg.senderId === user?.id) ? 0 : (c.unreadCount || 0) + 1
          } : c
        ));
      });

      socket.on("new_message_notification", (data) => {
          if (selectedConv?.id !== data.conversationId) {
             setConversations(prev => prev.map(c => 
                c.id === data.conversationId ? { ...c, unreadCount: (c.unreadCount || 0) + 1, lastMessage: data.text } : c
             ));
          }
      });

      return () => {
        socket.off("receive_message");
        socket.off("new_message_notification");
      };
    }
  }, [selectedConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    if (!token) return;
    try {
      const res = await fetch("https://transly-wr1m.onrender.com/chat/conversations", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`https://transly-wr1m.onrender.com/chat/${convId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
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
    if (!input.trim() || !selectedConv || !user) return;

    const msgData = {
      conversationId: selectedConv.id,
      senderId: user.id,
      text: input,
    };

    socket.emit("send_message", msgData);
    setInput("");
  };

  const getOtherUser = (conv: any) => {
    return conv.user1Id === user?.id ? conv.user2 : conv.user1;
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500">
      {/* Sidebar List */}
      <Card className="w-80 flex flex-col border-0 shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-slate-50/50 py-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input className="pl-9 h-9 text-sm" placeholder="Search chats..." />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          {loading ? (
            <div className="p-10 text-center text-slate-500 text-sm">Loading chats...</div>
          ) : conversations.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-sm">No conversations found.</div>
          ) : (
            conversations.map((conv) => {
              const other = getOtherUser(conv);
              return (
                <div 
                  key={conv.id} 
                  onClick={() => setSelectedConv(conv)}
                  className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors relative group ${selectedConv?.id === conv.id ? 'bg-orange-50/50 border-l-4 border-l-orange-600' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-slate-800 text-sm">{getOtherUser(conv)?.name || 'Unknown User'}</span>
                    <span className="text-[10px] text-slate-400 capitalize">{getOtherUser(conv)?.role}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500 line-clamp-1 flex-1">{conv.lastMessage || 'No messages yet'}</p>
                    {conv.unreadCount > 0 && (
                      <span className="ml-2 bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col border-0 shadow-sm overflow-hidden bg-white">
        {selectedConv ? (
          <>
            <CardHeader className="border-b py-3 px-6 bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-md font-bold text-slate-900">{getOtherUser(selectedConv)?.name}</CardTitle>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                    <span className="text-xs text-slate-500 font-medium tracking-tight">Active chatting</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.senderId === user?.id ? 'justify-end pt-5' : 'justify-start pt-5'}`}>
                  <div className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${
                    msg.senderId === user?.id 
                      ? 'bg-orange-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                  }`}>
                    {msg.text}
                    <div className={`text-[9px] mt-1 flex items-center justify-end gap-1 ${msg.senderId === user?.id ? 'text-orange-200' : 'text-slate-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {msg.senderId === user?.id && <Check className="h-2.5 w-2.5" />}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </CardContent>
            <CardFooter className="p-4 border-t border-slate-100">
              <div className="flex w-full gap-3">
                <Input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Respond to client..."
                  className="rounded-xl border-slate-200 focus-visible:ring-orange-600 h-11"
                />
                <Button onClick={handleSend} size="icon" className="rounded-xl bg-orange-600 hover:bg-orange-700 h-11 w-11 flex-shrink-0 shadow-lg shadow-orange-100">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-slate-50/30">
             <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-lg shadow-slate-200/50 mb-6">
               <MessageCircle className="h-10 w-10 text-slate-300" />
             </div>
             <h3 className="text-lg font-bold text-slate-900 mb-2">Select a chat to start responding</h3>
             <p className="text-sm text-slate-500 max-w-xs">Communicate with customers and drivers in real-time to provide support.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
