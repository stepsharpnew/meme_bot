import { Menu } from "@grammyjs/menu";
import { BUTTON_TEXTS, MAIN_MENU_TEXT } from "../constants/texts";
import { type MemeContext } from "../types";

export const VIP_MENU_ID = "vip-menu";

// VIP-экран с кнопкой оплаты и возвратом назад.
export const vipMenu = new Menu<MemeContext>(VIP_MENU_ID)
  .url(BUTTON_TEXTS.buyVip, process.env.PAYMENT_URL ?? "https://example.com")
  .text(BUTTON_TEXTS.back, async (ctx) => {
    await ctx.editMessageText(MAIN_MENU_TEXT);
    ctx.menu.back();
  });
