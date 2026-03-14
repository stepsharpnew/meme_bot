import { Menu } from "@grammyjs/menu";
import { BUTTON_TEXTS, HELP_TEXT, INSTRUCTIONS_MENU_TEXT, MAIN_MENU_TEXT, VIP_TEXT } from "../constants/texts";
import { INSTRUCTIONS_MENU_ID, instructionsMenu } from "./instructions.menu";
import { VIP_MENU_ID, vipMenu } from "./vip.menu";
import { type MemeContext } from "../types";

export const MAIN_MENU_ID = "main-menu";
const HELP_MENU_ID = "help-menu";

const helpMenu = new Menu<MemeContext>(HELP_MENU_ID).text(BUTTON_TEXTS.homeFromHelp, async (ctx) => {
  await ctx.editMessageText(MAIN_MENU_TEXT);
  ctx.menu.back();
});

// Главное меню бота с переходами по разделам.
export const mainMenu = new Menu<MemeContext>(MAIN_MENU_ID)
  .text(BUTTON_TEXTS.instructions, async (ctx) => {
    await ctx.editMessageText(INSTRUCTIONS_MENU_TEXT);
    ctx.menu.nav(INSTRUCTIONS_MENU_ID);
  })
  .text(BUTTON_TEXTS.support, async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.conversation.enter("supportConversation");
  })
  .row()
  .text(BUTTON_TEXTS.vip, async (ctx) => {
    const priceRub = process.env.PRICE_RUB ?? "???";
    await ctx.editMessageText(VIP_TEXT(priceRub));
    ctx.menu.nav(VIP_MENU_ID);
  })
  .text(BUTTON_TEXTS.help, async (ctx) => {
    await ctx.editMessageText(HELP_TEXT);
    ctx.menu.nav(HELP_MENU_ID);
  });

// Регистрируем подменю первого уровня. Платформы уже зарегистрированы внутри instructionsMenu.
mainMenu.register(instructionsMenu);
mainMenu.register(vipMenu);
mainMenu.register(helpMenu);
