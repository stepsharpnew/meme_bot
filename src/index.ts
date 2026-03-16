import "dotenv/config";
import { conversations, createConversation } from "@grammyjs/conversations";
import { Bot, GrammyError, session } from "grammy";
import { BACK_TO_MAIN_DATA, supportConversation } from "./conversations/support.conversation";
import {
  MAIN_MENU_TEXT,
  SUPPORT_ADMIN_HEADER,
  SUPPORT_REPLY_FAILED,
  SUPPORT_REPLY_PREFIX
} from "./constants/texts";
import { mainMenu } from "./menus/main.menu";
import {
  clearActiveDialog,
  getActiveDialog,
  getUserChatId,
  resolveAdminChat,
  saveForwardedMessage,
  setActiveDialog
} from "./store";
import { type MemeContext, type SessionData } from "./types";

const botToken = process.env.BOT_TOKEN;
if (!botToken) {
  throw new Error("BOT_TOKEN is not set");
}

const bot = new Bot<MemeContext>(botToken);

// Инициализация сессии (in-memory для разработки).
const initialSession = (): SessionData => ({
  supportDraft: null
});

bot.use(session({ initial: initialSession }));

// Подключение conversations для флоу поддержки.
bot.use(conversations());
bot.use(createConversation(supportConversation, "supportConversation"));

// Подключение всех меню бота.
bot.use(mainMenu);

// Callback «Вернуться в меню» — используется из conversation (где mainMenu недоступен как reply_markup).
bot.callbackQuery(BACK_TO_MAIN_DATA, async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(MAIN_MENU_TEXT, { reply_markup: mainMenu });
});

// /start — открывает главное меню и сбрасывает активный диалог.
bot.command("start", async (ctx) => {
  if (ctx.chat) {
    clearActiveDialog(ctx.chat.id);
  }
  await ctx.reply(MAIN_MENU_TEXT, { reply_markup: mainMenu });
});

// --- Админ-чаты ---
const supportAdminChatRaw = process.env.ADMIN_CHAT_ID_SUPPORT ?? "";
const vipAdminChatRaw = process.env.ADMIN_CHAT_ID_BUY ?? "";
const adminChats = [supportAdminChatRaw, vipAdminChatRaw]
  .filter((value) => value.length > 0)
  .map((value) => resolveAdminChat(value));

// Админ → юзер: ответ на пересланное сообщение уходит пользователю.
if (adminChats.length > 0) {
  bot.on("message", async (ctx, next) => {
    const currentAdminChat = adminChats.find(
      (ac) => ctx.chat.id.toString() === ac.chatId,
    );
    if (!currentAdminChat) {
      await next();
      return;
    }

    const repliedTo = ctx.message.reply_to_message;
    if (!repliedTo) {
      await next();
      return;
    }

    const userChatId = getUserChatId(currentAdminChat.chatId, repliedTo.message_id);
    if (!userChatId) {
      await next();
      return;
    }

    // Открываем активный диалог: юзер сможет свободно отвечать обратно.
    setActiveDialog(userChatId, currentAdminChat);

    try {
      if (ctx.message.text) {
        // Текст — без префикса, как обычный чат.
        await ctx.api.sendMessage(userChatId, ctx.message.text);
      } else {
        // Медиа (QR, конфиг, фото) — с пометкой от менеджера.
        await ctx.api.sendMessage(userChatId, SUPPORT_REPLY_PREFIX);
        await ctx.api.copyMessage(userChatId, ctx.chat.id, ctx.message.message_id);
      }
    } catch (error) {
      console.error("Ошибка отправки ответа юзеру:", error);
      await ctx.reply(SUPPORT_REPLY_FAILED);
    }
  });
}

// Юзер → админ: свободный ответ, если есть активный диалог (VIP-оплата и т.д.)
bot.on("message", async (ctx) => {
  const userChatId = ctx.chat.id;
  const dialog = getActiveDialog(userChatId);
  if (!dialog) return;

  const userName = ctx.from?.first_name ?? "Аноним";
  const userTag = ctx.from?.username ? `@${ctx.from.username}` : "без @ника";
  const userId = ctx.from?.id ?? 0;
  const topicOpts = dialog.topicId !== undefined
    ? { message_thread_id: dialog.topicId }
    : {};

  try {
    if (ctx.message.text) {
      const header = SUPPORT_ADMIN_HEADER(userName, userTag, userId);
      const sent = await ctx.api.sendMessage(
        dialog.chatId,
        `${header}\n${ctx.message.text}`,
        topicOpts,
      );
      saveForwardedMessage(dialog.chatId, sent.message_id, userChatId);
    } else {
      // Фото, файл, скрин оплаты и т.д. — шлём заголовок + копию медиа.
      const header = SUPPORT_ADMIN_HEADER(userName, userTag, userId);
      const sent = await ctx.api.sendMessage(dialog.chatId, header, topicOpts);
      saveForwardedMessage(dialog.chatId, sent.message_id, userChatId);

      const copied = await ctx.api.copyMessage(
        dialog.chatId,
        userChatId,
        ctx.message.message_id,
        topicOpts,
      );
      saveForwardedMessage(dialog.chatId, copied.message_id, userChatId);
    }
  } catch (error) {
    console.error("Ошибка пересылки ответа юзера в админ-чат:", error);
  }
});

// Глобальный обработчик ошибок. "message is not modified" — безобидный дабл-клик, игнорируем.
bot.catch((err) => {
  if (
    err.error instanceof GrammyError &&
    err.error.description.includes("message is not modified")
  ) {
    return;
  }
  console.error("Бот словил ошибку:", err.error);
});

// Запуск long polling.
bot.start();
console.log("MemeVpn запущен и готов к мемам 🚀");
