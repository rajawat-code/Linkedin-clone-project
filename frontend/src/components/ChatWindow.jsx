import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Send, Loader2 } from 'lucide-react';
import io from 'socket.io-client';

export default function ChatWindow({ conversationId, recipient, onMessageReceived }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  const { register, handleSubmit, reset } = useForm();
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch Message Thread
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/messages/conversation/${conversationId}`);
      setMessages(res.data.data || res.data || []);
      // Mark as seen
      await API.put(`/messages/seen/${conversationId}`);
    } catch (err) {
      console.error('Error loading chat thread', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket.io integration
  useEffect(() => {
    if (!conversationId) return;

    const getSocketURL = () => {
      const envSocket = import.meta.env.VITE_SOCKET_URL;
      if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        if (envSocket && (envSocket.includes('localhost') || envSocket.includes('127.0.0.1'))) {
          return envSocket;
        }
        return 'http://localhost:5000';
      }
      return envSocket || 'https://linkedin-clone-project-4f7z.onrender.com';
    };

    // Establish connection
    socketRef.current = io(getSocketURL(), {
      withCredentials: true
    });

    // Register user in socket
    if (user) {
      socketRef.current.emit('setup', user);
    }

    // Join the conversation room
    socketRef.current.emit('join_chat', conversationId);

    // Setup multiple listener events to be safe
    const handleNewMessage = (data) => {
      // Backend wraps message inside 'message' key, fallback to direct object
      const newMsg = data.message || data;
      const msgConvId = newMsg.conversationId || newMsg.conversation;
      if (msgConvId === conversationId) {
        setMessages(prev => [...prev, newMsg]);
        if (onMessageReceived) onMessageReceived();
      }
    };

    socketRef.current.on('message', handleNewMessage);
    socketRef.current.on('newMessage', handleNewMessage);
    socketRef.current.on('receiveMessage', handleNewMessage);
    socketRef.current.on('message_received', handleNewMessage);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [conversationId, user]);

  const handleSendMessage = async (data) => {
    if (!data.messageText.trim()) return;
    setSending(true);
    try {
      const recipientId = recipient._id || recipient.id;
      const res = await API.post('/messages/send', {
        recipientId,
        messageText: data.messageText
      });

      const payload = res.data.data || res.data;
      const sentMessage = payload.message || payload;
      setMessages(prev => [...prev, sentMessage]);
      reset();
      
      // Emit socket message for immediate real-time update
      if (socketRef.current) {
        socketRef.current.emit('sendMessage', sentMessage);
      }
      
      if (onMessageReceived) onMessageReceived();
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-150 flex items-center gap-3">
        {recipient.profilePhoto ? (
          <img src={recipient.profilePhoto} alt={recipient.name} className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <div className="h-9 w-9 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
            {recipient.name?.charAt(0) || 'U'}
          </div>
        )}
        <div>
          <h4 className="font-bold text-sm text-gray-900 leading-tight">{recipient.name}</h4>
          <p className="text-[11px] text-gray-500 line-clamp-1">{recipient.headline || 'LinkedIn Member'}</p>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50/50">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-linkedin-blue" /></div>
        ) : (
          messages.map((msg, index) => {
            const sender = msg.sender || {};
            const senderId = sender._id || sender.id || msg.senderId;
            const currentUserId = user?._id || user?.id;
            const isMe = senderId === currentUserId;

            return (
              <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-lg p-3 text-sm shadow-sm ${isMe ? 'bg-linkedin-blue text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'}`}>
                  {!isMe && (
                    <span className="font-bold text-[10px] text-linkedin-blue block mb-1">
                      {recipient.name}
                    </span>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.messageText}</p>
                  <span className={`text-[9px] block text-right mt-1.5 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input controls */}
      <form onSubmit={handleSubmit(handleSendMessage)} className="p-3 border-t border-gray-150 flex items-center gap-2 bg-white">
        <input
          type="text"
          placeholder="Write a message..."
          {...register('messageText', { required: true })}
          className="flex-grow bg-gray-100 hover:bg-gray-200 focus:bg-white border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-linkedin-blue"
        />
        <button
          type="submit"
          disabled={sending}
          className="bg-linkedin-blue hover:bg-linkedin-blue-hover text-white p-2.5 rounded-full transition disabled:opacity-50"
        >
          {sending ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
