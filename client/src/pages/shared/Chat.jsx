import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, MessageSquare, User, Check, CheckCheck, Circle } from 'lucide-react';
import toast from 'react-hot-toast';
import chatService from '../../services/chatService';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Avatar from '../../components/common/Avatar';
import { Loader } from '../../components/common/Loader';
import Button from '../../components/common/Button';

export const Chat = () => {
  const { user } = useAuth();
  const { socket, isUserOnline } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userDirectory, setUserDirectory] = useState([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch Conversations on mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoadingConversations(true);
        const res = await chatService.getConversations();
        setConversations(res.data.conversations || []);
        if (res.data.conversations && res.data.conversations.length > 0) {
          setActiveConversation(res.data.conversations[0]);
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
  }, []);

  // 2. Load messages when activeConversation changes
  useEffect(() => {
    if (!activeConversation) return;

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const res = await chatService.getMessages(activeConversation._id);
        setMessages(res.data.messages || []);
        scrollToBottom();

        // Join socket room
        if (socket) {
          socket.emit('conversation:join', activeConversation._id);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();

    return () => {
      if (socket && activeConversation) {
        socket.emit('conversation:leave', activeConversation._id);
      }
    };
  }, [activeConversation?._id, socket]);

  // 3. Socket listeners for incoming messages and typing status
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (message) => {
      if (message.conversation === activeConversation?._id) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }

      // Update conversation lastMessage
      setConversations((prev) =>
        prev.map((c) =>
          c._id === message.conversation
            ? { ...c, lastMessage: message, updatedAt: new Date().toISOString() }
            : c
        )
      );
    };

    const handleTypingStatus = ({ isTyping: status, userName }) => {
      setIsTyping(status);
      setTypingUser(userName || 'Participant');
    };

    socket.on('message:received', handleMessageReceived);
    socket.on('typing:status', handleTypingStatus);

    return () => {
      socket.off('message:received', handleMessageReceived);
      socket.off('typing:status', handleTypingStatus);
    };
  }, [socket, activeConversation?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle typing event emission
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    if (socket && activeConversation) {
      socket.emit('typing:start', {
        conversationId: activeConversation._id,
        userName: user?.name,
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing:stop', {
          conversationId: activeConversation._id,
        });
      }, 2000);
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversation) return;

    const content = messageInput.trim();
    setMessageInput('');

    try {
      const res = await chatService.sendMessage(activeConversation._id, content);
      const newMsg = res.data.message;

      setMessages((prev) => [...prev, newMsg]);

      // Emit over socket
      const otherParticipant = activeConversation.participants?.find(
        (p) => p._id !== user._id && p._id !== user.id
      );

      if (socket) {
        socket.emit('message:send', {
          conversationId: activeConversation._id,
          message: newMsg,
          recipientId: otherParticipant?._id,
        });
        socket.emit('typing:stop', { conversationId: activeConversation._id });
      }

      // Update conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c._id === activeConversation._id
            ? { ...c, lastMessage: newMsg, updatedAt: new Date().toISOString() }
            : c
        )
      );

      scrollToBottom();
    } catch (err) {
      toast.error('Failed to send message.');
    }
  };

  // Start new conversation helper
  const handleStartNewChat = async (targetUser) => {
    try {
      const res = await chatService.getOrCreateConversation(targetUser._id);
      const conv = res.data.conversation;

      if (!conversations.some((c) => c._id === conv._id)) {
        setConversations([conv, ...conversations]);
      }
      setActiveConversation(conv);
      setShowNewChatModal(false);
    } catch (err) {
      toast.error('Failed to start chat.');
    }
  };

  const getOtherParticipant = (conv) => {
    return conv.participants?.find((p) => p._id !== user?._id && p._id !== user?.id) || {};
  };

  const filteredConversations = conversations.filter((c) => {
    const other = getOtherParticipant(c);
    return other.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle overflow-hidden h-[calc(100vh-140px)] flex flex-col md:flex-row">
      {/* 1. LEFT SIDEBAR: CONVERSATIONS LIST */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col justify-between bg-slate-50/50">
        <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900">Messages</h2>
            <button
              onClick={async () => {
                setShowNewChatModal(true);
                const res = await userService.getTeachersList();
                setUserDirectory(res.data.teachers || []);
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              + New Chat
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
          {loadingConversations ? (
            <Loader size="sm" text="Loading chats..." />
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const other = getOtherParticipant(conv);
              const isSelected = activeConversation?._id === conv._id;
              const isOnline = isUserOnline(other._id);

              return (
                <button
                  key={conv._id}
                  onClick={() => setActiveConversation(conv)}
                  className={`w-full p-3 rounded-2xl flex items-start space-x-3 transition-colors text-left ${
                    isSelected ? 'bg-blue-50/80 shadow-sm' : 'hover:bg-slate-100/60'
                  }`}
                >
                  <Avatar
                    src={other.profileImage}
                    name={other.name}
                    size="md"
                    status={isOnline ? 'online' : null}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {other.name || 'User'}
                      </h4>
                      {conv.lastMessage?.createdAt && (
                        <span className="text-[10px] text-slate-400">
                          {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {conv.lastMessage?.content || 'No messages yet.'}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-10 text-center text-xs text-slate-400">
              No conversations found.
            </div>
          )}
        </div>
      </div>

      {/* 2. RIGHT PANEL: CHAT WINDOW */}
      <div className="flex-1 flex flex-col justify-between bg-white">
        {activeConversation ? (
          <>
            {/* Header */}
            {(() => {
              const other = getOtherParticipant(activeConversation);
              const isOnline = isUserOnline(other._id);

              return (
                <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between bg-white z-10">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      src={other.profileImage}
                      name={other.name}
                      size="sm"
                      status={isOnline ? 'online' : null}
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{other.name}</h3>
                      <p className="text-[11px] text-slate-400 flex items-center space-x-1">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        />
                        <span>{isOnline ? 'Online now' : 'Offline'}</span>
                        <span className="capitalize">• {other.role}</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/40">
              {loadingMessages ? (
                <Loader text="Loading message history..." />
              ) : messages.length > 0 ? (
                messages.map((msg) => {
                  const isMe =
                    (msg.sender?._id || msg.sender) === (user?._id || user?.id);

                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex items-end space-x-2 max-w-[75%]">
                        {!isMe && (
                          <Avatar
                            src={msg.sender?.profileImage}
                            name={msg.sender?.name}
                            size="xs"
                          />
                        )}

                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                            isMe
                              ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-subtle'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p
                            className={`text-[9px] mt-1 text-right font-medium ${
                              isMe ? 'text-blue-200' : 'text-slate-400'
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-20 text-center text-xs text-slate-400">
                  Say hello! Start the conversation.
                </div>
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="text-xs text-slate-400 italic flex items-center space-x-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>{typingUser} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Type your message here..."
                  value={messageInput}
                  onChange={handleInputChange}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
                <Button type="submit" size="md" className="rounded-2xl px-5">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-700">No Conversation Selected</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Select an existing chat or click "+ New Chat" to connect with course teachers.
            </p>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Start a Conversation</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {userDirectory.map((u) => (
                <div
                  key={u._id}
                  onClick={() => handleStartNewChat(u)}
                  className="p-3 flex items-center justify-between hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar src={u.profileImage} name={u.name} size="sm" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{u.name}</h4>
                      <p className="text-[10px] text-slate-400">{u.email}</p>
                    </div>
                  </div>
                  <span className="text-xs text-blue-600 font-bold">Chat</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
