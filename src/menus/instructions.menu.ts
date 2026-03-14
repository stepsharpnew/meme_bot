import { Menu } from "@grammyjs/menu";
import { BUTTON_TEXTS, INSTRUCTIONS_MENU_TEXT, MAIN_MENU_TEXT, PLATFORM_TEXTS } from "../constants/texts";
import { PLATFORM_DOWNLOAD_LINKS } from "../constants/links";
import { type MemeContext } from "../types";

export const INSTRUCTIONS_MENU_ID = "instructions-menu";
const ANDROID_MENU_ID = "android-menu";
const IOS_MENU_ID = "ios-menu";
const WINDOWS_MENU_ID = "windows-menu";
const MACOS_MENU_ID = "macos-menu";
const LINUX_MENU_ID = "linux-menu";

function createPlatformMenu(id: string, downloadUrl: string): Menu<MemeContext> {
  return new Menu<MemeContext>(id)
    .url("📥 Скачать приложуху", downloadUrl)
    .row()
    .text(BUTTON_TEXTS.backToPlatforms, async (ctx) => {
      await ctx.editMessageText(INSTRUCTIONS_MENU_TEXT);
      ctx.menu.back();
    })
    .text(BUTTON_TEXTS.home, async (ctx) => {
      await ctx.editMessageText(MAIN_MENU_TEXT);
      ctx.menu.nav("main-menu");
    });
}

const androidMenu = createPlatformMenu(ANDROID_MENU_ID, PLATFORM_DOWNLOAD_LINKS.android);
const iosMenu = createPlatformMenu(IOS_MENU_ID, PLATFORM_DOWNLOAD_LINKS.ios);
const windowsMenu = createPlatformMenu(WINDOWS_MENU_ID, PLATFORM_DOWNLOAD_LINKS.windows);
const macosMenu = createPlatformMenu(MACOS_MENU_ID, PLATFORM_DOWNLOAD_LINKS.macos);
const linuxMenu = createPlatformMenu(LINUX_MENU_ID, PLATFORM_DOWNLOAD_LINKS.linux);

// Меню выбора платформы. Подменю платформ регистрируются здесь, чтобы back() возвращал сюда.
export const instructionsMenu = new Menu<MemeContext>(INSTRUCTIONS_MENU_ID)
  .text(BUTTON_TEXTS.android, async (ctx) => {
    await ctx.editMessageText(PLATFORM_TEXTS.android);
    ctx.menu.nav(ANDROID_MENU_ID);
  })
  .text(BUTTON_TEXTS.ios, async (ctx) => {
    await ctx.editMessageText(PLATFORM_TEXTS.ios);
    ctx.menu.nav(IOS_MENU_ID);
  })
  .row()
  .text(BUTTON_TEXTS.windows, async (ctx) => {
    await ctx.editMessageText(PLATFORM_TEXTS.windows);
    ctx.menu.nav(WINDOWS_MENU_ID);
  })
  .text(BUTTON_TEXTS.macos, async (ctx) => {
    await ctx.editMessageText(PLATFORM_TEXTS.macos);
    ctx.menu.nav(MACOS_MENU_ID);
  })
  .row()
  .text(BUTTON_TEXTS.linux, async (ctx) => {
    await ctx.editMessageText(PLATFORM_TEXTS.linux);
    ctx.menu.nav(LINUX_MENU_ID);
  })
  .row()
  .text(BUTTON_TEXTS.backToMain, async (ctx) => {
    await ctx.editMessageText(MAIN_MENU_TEXT);
    ctx.menu.back();
  });

instructionsMenu.register(androidMenu);
instructionsMenu.register(iosMenu);
instructionsMenu.register(windowsMenu);
instructionsMenu.register(macosMenu);
instructionsMenu.register(linuxMenu);
