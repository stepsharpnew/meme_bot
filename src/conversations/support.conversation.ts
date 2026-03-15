import { type Conversation } from "@grammyjs/conversations";
import { InlineKeyboard, Keyboard } from "grammy";
import {
  SUPPORT_ADMIN_HEADER,
  SUPPORT_EXIT_BUTTON,
  SUPPORT_EXITED_TEXT,
  SUPPORT_FORWARDED_TEXTS,
  SUPPORT_PROMPT_TEXT,
  SUPPORT_SEND_ERROR_TEXT
} from "../constants/texts";
import { resolveAdminChat, saveForwardedMessage } from "../store";
import { type MemeContext } from "../types";

export const BACK_TO_MAIN_DATA = "back_to_main";

function randomSupportAck(): string {
  const idx = Math.floor(Math.random() * SUPPORT_FORWARDED_TEXTS.length);
  return SUPPORT_FORWARDED_TEXTS[idx];
}

function backToMainKeyboard(): InlineKeyboard {
  return new InlineKeyboard().text("🏠 Вернуться в меню", BACK_TO_MAIN_DATA);
}

// Непрерывный диалог с поддержкой: каждое сообщение летит админам, пока юзер сам не выйдет.
export async function supportConversation(
  conversation: Conversation<MemeContext, MemeContext>,
  ctx: MemeContext
): Promise<void> {
  const exitKeyboard = new Keyboard().text(SUPPORT_EXIT_BUTTON).resized();

  await ctx.reply(SUPPORT_PROMPT_TEXT, { reply_markup: exitKeyboard });

  while (true) {
    const incoming = await conversation.wait();

    if (!incoming.message?.text) {
      continue;
    }

    const text = incoming.message.text;

    // Юзер нажал кнопку выхода или /start — завершаем диалог.
    if (text === SUPPORT_EXIT_BUTTON || text === "/start") {
      await incoming.reply(SUPPORT_EXITED_TEXT, {
        reply_markup: { remove_keyboard: true }
      });
      await incoming.reply("👇 Жми, чтобы вернуться:", {
        reply_markup: backToMainKeyboard()
      });
      return;
    }

    // Пробрасываем сообщение в админ-чат.
    const adminChatIdRaw = process.env.ADMIN_CHAT_ID_SUPPORT;
    if (!adminChatIdRaw) {
      await incoming.reply(SUPPORT_SEND_ERROR_TEXT);
      continue;
    }

    const { chatId, topicId } = resolveAdminChat(adminChatIdRaw);
    const userName = incoming.from?.first_name ?? "Аноним";
    const userTag = incoming.from?.username
      ? `@${incoming.from.username}`
      : "без @ника";
    const userChatId = incoming.chat?.id;

    const adminText = `${SUPPORT_ADMIN_HEADER(userName, userTag)}\n${text}`;

    try {
      const sent = await incoming.api.sendMessage(chatId, adminText, {
        ...(topicId !== undefined ? { message_thread_id: topicId } : {})
      });

      if (userChatId) {
        await conversation.external(() => {
          saveForwardedMessage(chatId, sent.message_id, userChatId);
        });
      }
    } catch (error) {
      console.error("Ошибка отправки в админ-чат:", error);
      await incoming.reply(SUPPORT_SEND_ERROR_TEXT);
      continue;
    }

    await incoming.reply(randomSupportAck());
  }
}
