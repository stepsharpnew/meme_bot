// Маппинг: message_id в админ-чате → chat_id юзера (Livegram-стиль)
const forwardedMessages = new Map<number, number>();

export function saveForwardedMessage(adminMsgId: number, userChatId: number): void {
  forwardedMessages.set(adminMsgId, userChatId);
}

export function getUserChatId(adminMsgId: number): number | undefined {
  return forwardedMessages.get(adminMsgId);
}

export interface AdminChat {
  chatId: string;
  topicId?: number;
}

// Парсинг ADMIN_CHAT_ID — поддерживает ссылки t.me/c/ID/TOPIC и числовые ID
export function resolveAdminChat(rawValue: string): AdminChat {
  const trimmed = rawValue.trim();

  const fromLink = trimmed.match(/^https?:\/\/t\.me\/c\/(\d+)(?:\/(\d+))?$/i);
  if (fromLink) {
    const chatId = `-100${fromLink[1]}`;
    const topicId = fromLink[2] ? parseInt(fromLink[2], 10) : undefined;
    return { chatId, topicId };
  }

  if (/^\d+$/.test(trimmed)) {
    return { chatId: `-100${trimmed}` };
  }

  return { chatId: trimmed };
}
