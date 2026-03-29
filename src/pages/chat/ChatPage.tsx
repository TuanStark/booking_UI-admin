import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatSocket } from '../../hooks/useChatSocket';
import * as chatApi from '../../services/chatService';
import type { Conversation, Message, ConversationStatus } from '../../types/chat.types';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  MessageCircle,
  Send,
  Search,
  CheckCheck,
  Archive,
  ChevronLeft,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// Admin Chat Page — 2-panel layout
// Left: Conversation list with filters
// Right: Chat window with messages
// ═══════════════════════════════════════════════════════════

const ChatPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ─── State ──────────────────────────────────────────────
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | ''>('');
  const [searchText, setSearchText] = useState('');
  const [_loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Socket ─────────────────────────────────────────────
  const socket = useChatSocket();

  // Register socket event handlers
  useEffect(() => {
    socket.onNewMessage((msg) => {
      setMessages((prev) => [...prev, msg]);
      // Update conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === msg.conversationId
            ? { ...c, lastMessageText: msg.content, lastMessageAt: msg.createdAt }
            : c,
        ),
      );
      scrollToBottom();
    });

    socket.onTyping((data) => {
      if (data.role !== 'admin') {
        setTypingUsers((prev) => ({ ...prev, [data.conversationId]: data.userId }));
      }
    });

    socket.onStopTyping((data) => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[data.conversationId];
        return next;
      });
    });

    socket.onNewConversation((conv) => {
      setConversations((prev) => [conv, ...prev]);
    });
  }, [socket]);

  // ─── Load conversations ─────────────────────────────────
  useEffect(() => {
    loadConversations();
  }, [statusFilter, searchText]);

  const loadConversations = async () => {
    try {
      const result = await chatApi.getConversations({
        status: statusFilter || undefined,
        search: searchText || undefined,
        limit: 50,
      });
      setConversations(result.data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  // ─── Select conversation ────────────────────────────────
  useEffect(() => {
    if (conversationId) {
      selectConversation(conversationId);
    }
  }, [conversationId]);

  const selectConversation = async (id: string) => {
    // Leave previous conversation room
    if (selectedConv) socket.leaveConversation(selectedConv.id);

    setLoading(true);
    try {
      const conv = await chatApi.getConversation(id);
      setSelectedConv(conv);

      // Join socket room
      socket.joinConversation(id);

      // Load messages
      const result = await chatApi.getMessages(id);
      setMessages(result.data.reverse()); // API returns newest first, we want oldest first
      setHasMore(result.pagination.hasMore);
      setNextCursor(result.pagination.nextCursor);

      // Mark as read
      if (result.data.length > 0) {
        const lastMsg = result.data[0]; // newest
        socket.markRead(id, lastMsg.id);
      }

      scrollToBottom();
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
    setLoading(false);
  };

  // ─── Load more messages (scroll up) ─────────────────────
  const loadMoreMessages = async () => {
    if (!selectedConv || !hasMore || !nextCursor) return;
    try {
      const result = await chatApi.getMessages(selectedConv.id, nextCursor);
      setMessages((prev) => [...result.data.reverse(), ...prev]);
      setHasMore(result.pagination.hasMore);
      setNextCursor(result.pagination.nextCursor);
    } catch (err) {
      console.error('Failed to load more messages:', err);
    }
  };

  // ─── Send message ───────────────────────────────────────
  const handleSend = useCallback(() => {
    if (!inputText.trim() || !selectedConv) return;
    socket.sendMessage(selectedConv.id, inputText.trim());
    setInputText('');
    socket.stopTyping(selectedConv.id);
  }, [inputText, selectedConv, socket]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ─── Typing indicator ──────────────────────────────────
  const handleInputChange = (value: string) => {
    setInputText(value);
    if (!selectedConv) return;

    socket.startTyping(selectedConv.id);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.stopTyping(selectedConv.id);
    }, 2000);
  };

  // ─── Close conversation ─────────────────────────────────
  const handleCloseConversation = async () => {
    if (!selectedConv) return;
    try {
      await chatApi.updateConversationStatus(selectedConv.id, 'CLOSED');
      setSelectedConv({ ...selectedConv, status: 'CLOSED' });
      loadConversations();
    } catch (err) {
      console.error('Failed to close conversation:', err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Hôm nay';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Hôm qua';
    return d.toLocaleDateString('vi-VN');
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="flex h-[calc(100vh-6rem)] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900">
      {/* ─── Left Panel: Conversation List ──────────────── */}
      <div className={cn(
        "w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col",
        selectedConv && "hidden md:flex"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            Tin nhắn
          </h2>

          {/* Search */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Filter tabs */}
          <div className="mt-3 flex gap-1">
            {([['', 'Tất cả'], ['ACTIVE', 'Đang mở'], ['CLOSED', 'Đã đóng']] as const).map(
              ([value, label]) => (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value as any)}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                    statusFilter === value
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800',
                  )}
                >
                  {label}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">
              Chưa có cuộc hội thoại nào
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = selectedConv?.id === conv.id;
              const adminParticipant = conv.participants?.find((p) => p.role === 'ADMIN' && p.userId === (user as any)?.id);
              const unread = adminParticipant?.unreadCount || 0;

              return (
                <button
                  key={conv.id}
                  onClick={() => navigate(`/chat/${conv.id}`)}
                  className={cn(
                    'w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                    isSelected && 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-l-blue-600',
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium truncate', unread > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300')}>
                        {conv.title || `User ${conv.userId.slice(0, 8)}...`}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {conv.lastMessageText || 'Chưa có tin nhắn'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end ml-2 flex-shrink-0">
                      <span className="text-[10px] text-gray-400">
                        {conv.lastMessageAt ? formatTime(conv.lastMessageAt) : ''}
                      </span>
                      {unread > 0 && (
                        <span className="mt-1 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 text-[10px] font-bold text-white bg-blue-600 rounded-full">
                          {unread}
                        </span>
                      )}
                      {conv.status === 'CLOSED' && (
                        <span className="mt-1 text-[10px] text-gray-400">Đã đóng</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ─── Right Panel: Chat Window ──────────────────── */}
      <div className="flex-1 flex flex-col">
        {!selectedConv ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageCircle className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">Chọn một cuộc hội thoại</p>
            <p className="text-sm mt-1">để bắt đầu trả lời</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setSelectedConv(null); navigate('/chat'); }}
                  className="md:hidden p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedConv.title || `User ${selectedConv.userId.slice(0, 8)}...`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedConv.contextType && `${selectedConv.contextType}: ${selectedConv.contextId?.slice(0, 8)}...`}
                    {!selectedConv.contextType && `ID: ${selectedConv.userId.slice(0, 12)}...`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  selectedConv.status === 'ACTIVE' && 'bg-green-100 text-green-700',
                  selectedConv.status === 'CLOSED' && 'bg-gray-100 text-gray-500',
                  selectedConv.status === 'ARCHIVED' && 'bg-yellow-100 text-yellow-700',
                )}>
                  {selectedConv.status === 'ACTIVE' ? 'Đang mở' : selectedConv.status === 'CLOSED' ? 'Đã đóng' : 'Lưu trữ'}
                </span>
                {selectedConv.status === 'ACTIVE' && (
                  <Button variant="ghost" size="sm" onClick={handleCloseConversation} title="Đóng hội thoại">
                    <Archive className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-950"
            >
              {hasMore && (
                <button
                  onClick={loadMoreMessages}
                  className="w-full text-center text-xs text-blue-600 hover:underline py-2"
                >
                  Tải thêm tin nhắn cũ hơn
                </button>
              )}

              {messages.map((msg, idx) => {
                const isAdmin = msg.senderRole === 'ADMIN';
                const showDate =
                  idx === 0 ||
                  new Date(msg.createdAt).toDateString() !== new Date(messages[idx - 1].createdAt).toDateString();

                return (
                  <React.Fragment key={msg.id}>
                    {showDate && (
                      <div className="text-center">
                        <span className="text-[10px] bg-gray-200 dark:bg-gray-800 text-gray-500 px-3 py-0.5 rounded-full">
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                    )}

                    {msg.type === 'SYSTEM' ? (
                      <div className="text-center text-xs text-gray-400 italic">
                        {msg.content}
                      </div>
                    ) : (
                      <div className={cn('flex', isAdmin ? 'justify-end' : 'justify-start')}>
                        <div
                          className={cn(
                            'max-w-[70%] px-3.5 py-2 rounded-2xl text-sm break-words',
                            isAdmin
                              ? 'bg-blue-600 text-white rounded-br-sm'
                              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm shadow-sm border border-gray-100 dark:border-gray-700',
                          )}
                        >
                          {!isAdmin && (
                            <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mb-0.5">
                              Khách hàng
                            </p>
                          )}
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <div className={cn('flex items-center gap-1 mt-1', isAdmin ? 'justify-end' : 'justify-start')}>
                            <span className={cn('text-[10px]', isAdmin ? 'text-blue-200' : 'text-gray-400')}>
                              {formatTime(msg.createdAt)}
                            </span>
                            {msg.isEdited && (
                              <span className={cn('text-[10px]', isAdmin ? 'text-blue-200' : 'text-gray-400')}>
                                (đã sửa)
                              </span>
                            )}
                            {isAdmin && <CheckCheck className="h-3 w-3 text-blue-200" />}
                          </div>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Typing indicator */}
              {typingUsers[selectedConv.id] && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-1">
                      <div className="flex gap-0.5">
                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-[10px] text-gray-400 ml-1">đang nhập...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            {selectedConv.status === 'ACTIVE' ? (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <div className="flex items-end gap-2">
                  <textarea
                    value={inputText}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tin nhắn trả lời..."
                    rows={1}
                    className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32"
                    style={{ minHeight: '42px' }}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    size="icon"
                    className="h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-center text-sm text-gray-400">
                Cuộc hội thoại đã đóng
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
