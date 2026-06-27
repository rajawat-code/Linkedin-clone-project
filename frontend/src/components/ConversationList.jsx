import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function ConversationList({ conversations, activeConversationId, onSelectConversation }) {
  const { user } = useAuth();

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm h-full flex flex-col">
      <div className="p-4 border-b border-gray-150 font-bold text-gray-900 text-sm">
        Messaging
      </div>
      <div className="flex-grow overflow-y-auto divide-y divide-gray-100">
        {conversations.map((conv) => {
          const convId = conv._id || conv.id;
          // Determine the other participant in the conversation
          const participants = conv.participants || [];
          const otherUser = participants.find(p => (p._id || p.id) !== (user?._id || user?.id)) || {};
          const lastMsg = conv.lastMessage || {};
          const unread = conv.unreadCount || 0;

          return (
            <button
              key={convId}
              onClick={() => onSelectConversation(conv)}
              className={`w-full p-4 flex gap-3 text-left hover:bg-gray-50 transition items-center ${activeConversationId === convId ? 'bg-blue-50/40 border-r-4 border-linkedin-blue' : ''}`}
            >
              {otherUser.profilePhoto ? (
                <img src={otherUser.profilePhoto} alt={otherUser.name} className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {otherUser.name?.charAt(0) || 'U'}
                </div>
              )}

              <div className="min-w-0 flex-grow">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-sm text-gray-900 truncate block">{otherUser.name || 'LinkedIn Member'}</span>
                  {lastMsg.createdAt && (
                    <span className="text-[10px] text-gray-400">
                      {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">{lastMsg.messageText || 'No messages yet'}</p>
              </div>

              {unread > 0 && (
                <span className="bg-red-650 text-white rounded-full text-[10px] w-4.5 h-4.5 flex items-center justify-center font-bold bg-red-600 flex-shrink-0">
                  {unread}
                </span>
              )}
            </button>
          );
        })}
        {conversations.length === 0 && (
          <div className="text-center text-gray-400 py-10 text-xs">No active conversations</div>
        )}
      </div>
    </div>
  );
}
