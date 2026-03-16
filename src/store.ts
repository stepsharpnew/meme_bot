// Маппинг: chat_id:message_id в админ-чате → chat_id юзера (Livegram-стиль)
const forwardedMessages = new Map<string, number>();

function makeForwardKey(adminChatId: string, adminMsgId: number): string {
  return `${adminChatId}:${adminMsgId}`;
}

export function saveForwardedMessage(
  adminChatId: string,
  adminMsgId: number,
  userChatId: number
): void {
  forwardedMessages.set(makeForwardKey(adminChatId, adminMsgId), userChatId);
}

export function getUserChatId(
  adminChatId: string,
  adminMsgId: number
): number | undefined {
  return forwardedMessages.get(makeForwardKey(adminChatId, adminMsgId));
}

// Активные диалоги: userChatId → админ-чат, в который пересылать ответы юзера.
const activeDialogs = new Map<number, AdminChat>();

export function setActiveDialog(userChatId: number, adminChat: AdminChat): void {
  activeDialogs.set(userChatId, adminChat);
}

export function getActiveDialog(userChatId: number): AdminChat | undefined {
  return activeDialogs.get(userChatId);
}

export function clearActiveDialog(userChatId: number): void {
  activeDialogs.delete(userChatId);
}

export interface AdminChat {
  chatId: string;
  topicId?: number;
}

// Парсинг ADMIN_CHAT_ID — поддерживает ссылки t.me/c/ID/TOPIC и числовые ID.
// topicId=1 не используется: в Telegram это первое сообщение группы, а не форум-тред.
export function resolveAdminChat(rawValue: string): AdminChat {
  const trimmed = rawValue.trim();

  const fromLink = trimmed.match(/^https?:\/\/t\.me\/c\/(\d+)(?:\/(\d+))?$/i);
  if (fromLink) {
    const chatId = `-100${fromLink[1]}`;
    const parsedTopic = fromLink[2] ? parseInt(fromLink[2], 10) : undefined;
    const topicId = parsedTopic !== undefined && parsedTopic > 1 ? parsedTopic : undefined;
    return { chatId, topicId };
  }

  if (/^\d+$/.test(trimmed)) {
    return { chatId: `-100${trimmed}` };
  }

  return { chatId: trimmed };
}
