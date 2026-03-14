import { type ConversationFlavor } from "@grammyjs/conversations";
import { type MenuFlavor } from "@grammyjs/menu";
import { type Context, type SessionFlavor } from "grammy";

export interface SessionData {
  supportDraft: string | null;
}

type BaseContext = Context & SessionFlavor<SessionData> & MenuFlavor;

export type MemeContext = ConversationFlavor<BaseContext>;
