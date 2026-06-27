import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Loader2, MessageSquare } from 'lucide-react';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import { useAuth } from '../context/AuthContext';

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchConversations = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await API.get('/messages/conversations');
      const convList = res.data.data || res.data || [];
      setConversations(convList);
      
      // Keep active conversation reference updated in case of new messages
      if (activeConversation) {
        const currentId = activeConversation._id || activeConversation.id;
        const updated = convList.find(c => c._id === currentId || c.id === currentId);
        if (updated) {
          setActiveConversation(updated);
        }
      }
    } catch (err) {
      toast.error('Failed to load conversations');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
  };

  const handleMessageUpdate = () => {
    // Refresh conversation previews silently to update latest message and badges
    fetchConversations(true);
  };

  // Extract recipient details for active conversation
  const getRecipientUser = () => {
    if (!activeConversation) return null;
    const participants = activeConversation.participants || [];
    return participants.find(p => (p._id || p.id) !== (user?._id || user?.id)) || {};
  };

  const activeConvId = activeConversation?._id || activeConversation?.id;
  const recipient = getRecipientUser();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-140px)] min-h-[500px]">
      
      {/* LHS: Conversation List */}
      <div className="md:col-span-1 h-full">
        {loading && conversations.length === 0 ? (
          <div className="flex justify-center items-center h-full bg-white border border-gray-200 rounded-lg">
            <Loader2 className="animate-spin h-8 w-8 text-linkedin-blue" />
          </div>
        ) : (
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConvId}
            onSelectConversation={handleSelectConversation}
          />
        )}
      </div>

      {/* RHS: Active Chat Window */}
      <div className="md:col-span-2 h-full">
        {activeConversation && recipient ? (
          <ChatWindow
            conversationId={activeConvId}
            recipient={recipient}
            onMessageReceived={handleMessageUpdate}
          />
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg h-full flex flex-col justify-center items-center text-center p-6 text-gray-500 shadow-sm">
            <MessageSquare className="h-16 w-16 text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-700">Your conversations</h3>
            <p className="text-sm mt-1 max-w-xs">Select a conversation from the list to start messaging in real-time.</p>
          </div>
        )}
      </div>

    </div>
  );
}
