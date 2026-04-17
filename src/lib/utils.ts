export const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));

export const formatPct = (value: number) => `${Math.round(value)}%`;

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);

export const addMinutes = (value: string | Date, minutes: number) => {
  const date = typeof value === "string" ? new Date(value) : new Date(value);
  return new Date(date.getTime() + minutes * 60 * 1000);
};

export const toIso = (value: Date) => value.toISOString();

export const randomId = (prefix: string) =>
  globalThis.crypto?.randomUUID?.() ?? `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
