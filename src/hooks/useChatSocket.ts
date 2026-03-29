import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Message, TypingEvent, ReadEvent, Conversation } from '../types/chat.types';

const CHAT_WS_URL = import.meta.env.VITE_CHAT_WS_URL || 'http://localhost:3013';

/**
 * Custom hook for Socket.IO chat connection.
 * Handles connect/disconnect lifecycle, event subscriptions, and reconnection.
 */
export function useChatSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Event handler refs so we don't re-register on every render
  const onNewMessageRef = useRef<((msg: Message) => void) | null>(null);
  const onTypingRef = useRef<((data: TypingEvent) => void) | null>(null);
  const onStopTypingRef = useRef<((data: TypingEvent) => void) | null>(null);
  const onReadRef = useRef<((data: ReadEvent) => void) | null>(null);
  const onNewConversationRef = useRef<((conv: Conversation) => void) | null>(null);
  const onConversationUpdatedRef = useRef<((conv: Conversation) => void) | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(`${CHAT_WS_URL}/chat`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('new_message', (msg: Message) => onNewMessageRef.current?.(msg));
    socket.on('user_typing', (data: TypingEvent) => onTypingRef.current?.(data));
    socket.on('user_stop_typing', (data: TypingEvent) => onStopTypingRef.current?.(data));
    socket.on('messages_read', (data: ReadEvent) => onReadRef.current?.(data));
    socket.on('new_conversation', (conv: Conversation) => onNewConversationRef.current?.(conv));
    socket.on('conversation_updated', (conv: Conversation) => onConversationUpdatedRef.current?.(conv));

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('join_conversation', { conversationId });
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('leave_conversation', { conversationId });
  }, []);

  const sendMessage = useCallback((conversationId: string, content: string, replyToId?: string) => {
    socketRef.current?.emit('send_message', { conversationId, content, replyToId });
  }, []);

  const startTyping = useCallback((conversationId: string) => {
    socketRef.current?.emit('typing_start', { conversationId });
  }, []);

  const stopTyping = useCallback((conversationId: string) => {
    socketRef.current?.emit('typing_stop', { conversationId });
  }, []);

  const markRead = useCallback((conversationId: string, messageId: string) => {
    socketRef.current?.emit('mark_read', { conversationId, messageId });
  }, []);

  return {
    isConnected,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    markRead,
    // Register handlers
    onNewMessage: (fn: (msg: Message) => void) => { onNewMessageRef.current = fn; },
    onTyping: (fn: (data: TypingEvent) => void) => { onTypingRef.current = fn; },
    onStopTyping: (fn: (data: TypingEvent) => void) => { onStopTypingRef.current = fn; },
    onRead: (fn: (data: ReadEvent) => void) => { onReadRef.current = fn; },
    onNewConversation: (fn: (conv: Conversation) => void) => { onNewConversationRef.current = fn; },
    onConversationUpdated: (fn: (conv: Conversation) => void) => { onConversationUpdatedRef.current = fn; },
  };
}
