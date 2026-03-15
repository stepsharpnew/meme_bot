import { Menu } from "@grammyjs/menu";
import {
  BUTTON_TEXTS,
  MAIN_MENU_TEXT,
  VIP_REQUEST_ADMIN_TEXT,
  VIP_REQUEST_FAILED_TEXT,
  VIP_REQUEST_SENT_TEXT,
} from "../constants/texts";
import { resolveAdminChat, saveForwardedMessage } from "../store";
import { type MemeContext } from "../types";

export const VIP_MENU_ID = "vip-menu";

// VIP-экран с кнопкой оплаты и возвратом назад.
export const vipMenu = new Menu<MemeContext>(VIP_MENU_ID)
  .text(BUTTON_TEXTS.buyVip, async (ctx) => {
    const rawBuyChat = process.env.ADMIN_CHAT_ID_BUY;
    if (!rawBuyChat) {
      await ctx.reply(VIP_REQUEST_FAILED_TEXT);
      return;
    }

    const { chatId, topicId } = resolveAdminChat(rawBuyChat);
    const userName = ctx.from?.first_name ?? "Аноним";
    const userTag = ctx.from?.username ? `@${ctx.from.username}` : "без @ника";
    const userChatId = ctx.chat?.id;

    try {
      const sent = await ctx.api.sendMessage(
        chatId,
        VIP_REQUEST_ADMIN_TEXT(userName, userTag),
        {
          ...(topicId !== undefined ? { message_thread_id: topicId } : {}),
        },
      );

      if (userChatId) {
        saveForwardedMessage(chatId, sent.message_id, userChatId);
      }
      await ctx.reply(VIP_REQUEST_SENT_TEXT);
    } catch (error) {
      console.error("Ошибка отправки VIP-заявки:", error);
      await ctx.reply(VIP_REQUEST_FAILED_TEXT);
    }
  })
  .text(BUTTON_TEXTS.back, async (ctx) => {
    await ctx.editMessageText(MAIN_MENU_TEXT);
    ctx.menu.back();
  });
