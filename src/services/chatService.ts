import type {
  Conversation,
  ConversationListResult,
  Message,
  ChatPaginationResult,
  ChatStats,
} from '../types/chat.types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Conversations ────────────────────────────────────────

export async function getConversations(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ConversationListResult> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  return request(`/chat/conversations/admin/all${qs ? `?${qs}` : ''}`);
}

export async function getConversation(id: string): Promise<Conversation> {
  return request(`/chat/conversations/${id}`);
}

export async function updateConversationStatus(id: string, status: string): Promise<Conversation> {
  return request(`/chat/conversations/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function markConversationRead(id: string, messageId: string): Promise<void> {
  await request(`/chat/conversations/${id}/read`, {
    method: 'POST',
    body: JSON.stringify({ messageId }),
  });
}

export async function getChatStats(): Promise<ChatStats> {
  return request('/chat/conversations/admin/stats');
}

// ─── Messages ─────────────────────────────────────────────

export async function getMessages(
  conversationId: string,
  cursor?: string,
  limit = 30,
): Promise<ChatPaginationResult<Message>> {
  const query = new URLSearchParams();
  if (cursor) query.set('cursor', cursor);
  query.set('limit', String(limit));
  return request(`/chat/conversations/${conversationId}/messages?${query.toString()}`);
}

export async function sendMessage(
  conversationId: string,
  content: string,
  replyToId?: string,
): Promise<Message> {
  return request(`/chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content, replyToId }),
  });
}

export async function deleteMessage(messageId: string): Promise<void> {
  await request(`/chat/messages/${messageId}`, { method: 'DELETE' });
}
