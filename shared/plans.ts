export interface Plan {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  maxDevices: number;
  icon: string;
}

export const PLANS: Plan[] = [
  {
    id: "personal",
    name: "Персональная",
    subtitle: "Для одного пользователя",
    price: 129,
    maxDevices: 1,
    icon: "👤",
  },
  {
    id: "duo",
    name: "Дуо",
    subtitle: "До 2 пользователей",
    price: 199,
    maxDevices: 2,
    icon: "👥",
  },
  {
    id: "family",
    name: "Семейная",
    subtitle: "До 6 пользователей",
    price: 299,
    maxDevices: 6,
    icon: "👑",
  },
];

export interface Duration {
  months: number;
  label: string;
  discount: number;
}

export const DURATIONS: Duration[] = [
  { months: 1, label: "1 месяц", discount: 0 },
  { months: 3, label: "3 месяца", discount: 0.1 },
  { months: 6, label: "6 месяцев", discount: 0.2 },
  { months: 12, label: "12 месяцев", discount: 0.35 },
];

export function calculateTotal(pricePerMonth: number, months: number): number {
  const dur = DURATIONS.find((d) => d.months === months);
  const discount = dur?.discount ?? 0;
  return Math.round(pricePerMonth * months * (1 - discount));
}

export function monthsLabel(n: number): string {
  if (n === 1) return "1 месяц";
  if (n >= 2 && n <= 4) return `${n} месяца`;
  return `${n} месяцев`;
}

/** Payload that Mini App sends to the bot via sendData(). */
export interface WebAppPurchasePayload {
  type: "purchase";
  plan: string;
  planName: string;
  months: number;
  total: number;
}

export interface WebAppSupportPayload {
  type: "support";
  message: string;
}

export type WebAppPayload = WebAppPurchasePayload | WebAppSupportPayload;
