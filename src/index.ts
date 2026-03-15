import "dotenv/config";
import { conversations, createConversation } from "@grammyjs/conversations";
import { Bot, GrammyError, session } from "grammy";
import { BACK_TO_MAIN_DATA, supportConversation } from "./conversations/support.conversation";
import {
  MAIN_MENU_TEXT,
  SUPPORT_REPLY_FAILED,
  SUPPORT_REPLY_PREFIX
} from "./constants/texts";
import { mainMenu } from "./menus/main.menu";
import { getUserChatId, resolveAdminChat } from "./store";
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

// Команда старта открывает главное меню MemeVpn.
bot.command("start", async (ctx) => {
  await ctx.reply(MAIN_MENU_TEXT, { reply_markup: mainMenu });
});

// Livegram-стиль: ответы из чатов поддержки/VIP возвращаются пользователю.
const supportAdminChatRaw = process.env.ADMIN_CHAT_ID_SUPPORT ?? "";
const vipAdminChatRaw = process.env.ADMIN_CHAT_ID_BUY ?? "";
const adminChats = [supportAdminChatRaw, vipAdminChatRaw]
  .filter((value) => value.length > 0)
  .map((value) => resolveAdminChat(value));

if (adminChats.length > 0) {
  bot.on("message", async (ctx, next) => {
    const currentAdminChat = adminChats.find(
      (adminChat) => ctx.chat.id.toString() === adminChat.chatId,
    );
    if (!currentAdminChat) {
      await next();
      return;
    }

    const repliedTo = ctx.message.reply_to_message;
    if (!repliedTo || !ctx.message.text) {
      await next();
      return;
    }

    const userChatId = getUserChatId(currentAdminChat.chatId, repliedTo.message_id);
    if (!userChatId) {
      await next();
      return;
    }

    try {
      await ctx.api.sendMessage(userChatId, `${SUPPORT_REPLY_PREFIX}${ctx.message.text}`);
    } catch (error) {
      console.error("Ошибка отправки ответа юзеру:", error);
      await ctx.reply(SUPPORT_REPLY_FAILED);
    }
  });
}

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
