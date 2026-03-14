import { type Conversation } from "@grammyjs/conversations";
import { InlineKeyboard } from "grammy";
import {
  BUTTON_TEXTS,
  SUPPORT_ADMIN_HEADER,
  SUPPORT_CANCELLED_TEXT,
  SUPPORT_PROMPT_TEXT,
  SUPPORT_SEND_ERROR_TEXT,
  SUPPORT_SENT_TEXT
} from "../constants/texts";
import { resolveAdminChat, saveForwardedMessage } from "../store";
import { type MemeContext } from "../types";

const SUPPORT_CANCEL_DATA = "support_cancel";
export const BACK_TO_MAIN_DATA = "back_to_main";

function backToMainKeyboard(): InlineKeyboard {
  return new InlineKeyboard().text("🏠 Вернуться в меню", BACK_TO_MAIN_DATA);
}

// Диалог поддержки: собирает сообщение, шлёт админам, сохраняет маппинг для ответа.
export async function supportConversation(
  conversation: Conversation<MemeContext, MemeContext>,
  ctx: MemeContext
): Promise<void> {
  const cancelKeyboard = new InlineKeyboard().text(BUTTON_TEXTS.cancel, SUPPORT_CANCEL_DATA);

  await ctx.reply(SUPPORT_PROMPT_TEXT, { reply_markup: cancelKeyboard });

  while (true) {
    const incoming = await conversation.wait();

    if (incoming.callbackQuery?.data === SUPPORT_CANCEL_DATA) {
      await incoming.answerCallbackQuery();
      await incoming.editMessageText(SUPPORT_CANCELLED_TEXT);
      await incoming.reply("👇 Жми, чтобы вернуться:", { reply_markup: backToMainKeyboard() });
      return;
    }

    if (incoming.message?.text) {
      const adminChatIdRaw = process.env.ADMIN_CHAT_ID;
      if (!adminChatIdRaw) {
        await incoming.reply(SUPPORT_SEND_ERROR_TEXT);
        return;
      }

      const { chatId, topicId } = resolveAdminChat(adminChatIdRaw);
      const userName = incoming.from?.first_name ?? "Аноним";
      const userId = incoming.from?.id ?? 0;
      const userChatId = incoming.chat?.id;
      const messageText = incoming.message.text;

      const adminText = `${SUPPORT_ADMIN_HEADER(userName, userId)}\n${messageText}`;

      try {
        const sent = await incoming.api.sendMessage(chatId, adminText, {
          ...(topicId !== undefined ? { message_thread_id: topicId } : {})
        });

        if (userChatId) {
          await conversation.external(() => {
            saveForwardedMessage(sent.message_id, userChatId);
          });
        }
      } catch (error) {
        console.error("Ошибка отправки в админ-чат:", error);
        await incoming.reply(SUPPORT_SEND_ERROR_TEXT);
        await incoming.reply("👇 Жми, чтобы вернуться:", { reply_markup: backToMainKeyboard() });
        return;
      }

      await incoming.reply(SUPPORT_SENT_TEXT);
      await incoming.reply("👇 Жми, чтобы вернуться:", { reply_markup: backToMainKeyboard() });
      return;
    }
  }
}
