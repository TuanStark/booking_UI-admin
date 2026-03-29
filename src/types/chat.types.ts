// ─── Chat TypeScript Interfaces ───────────────────────────

export type ConversationType = 'SUPPORT';
export type ConversationStatus = 'ACTIVE' | 'ARCHIVED' | 'CLOSED';
export type ParticipantRole = 'USER' | 'ADMIN';
export type MessageType = 'TEXT' | 'SYSTEM';

export interface Conversation {
  id: string;
  type: ConversationType;
  status: ConversationStatus;
  title: string | null;
  userId: string;
  contextType: string | null;
  contextId: string | null;
  lastMessageId: string | null;
  lastMessageAt: string | null;
  lastMessageText: string | null;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipant[];
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  role: ParticipantRole;
  unreadCount: number;
  isMuted: boolean;
  lastReadMessageId: string | null;
  joinedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: ParticipantRole;
  type: MessageType;
  content: string;
  replyToId: string | null;
  isDeleted: boolean;
  isEdited: boolean;
  editedAt: string | null;
  createdAt: string;
  // Enriched by frontend
  senderName?: string;
  senderAvatar?: string;
}

export interface ChatPaginationResult<T> {
  data: T[];
  pagination: {
    hasMore: boolean;
    nextCursor: string | null;
    limit: number;
  };
}

export interface ConversationListResult {
  data: Conversation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ChatStats {
  active: number;
  closed: number;
  archived: number;
  total: number;
}

// ─── WebSocket Events ─────────────────────────────────────

export interface TypingEvent {
  conversationId: string;
  userId: string;
  role?: string;
}

export interface ReadEvent {
  conversationId: string;
  userId: string;
  messageId: string;
}
