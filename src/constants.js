export const ACT_PRINCIPLES = [
  { label: "Waarde", desc: "voelt als openheid en richting", color: "#C47A5A" },
  { label: "Vermijding", desc: "voelt als druk en verplichting", color: "#8A7A6A" },
];

export const CHECKIN_STORAGE_KEY = "evaluu-checkins";
export const DB_TOKEN_KEY = "evaluu-db-token";
export const DOMAINS_STORAGE_KEY = "evaluu-domains";

// Old keys for migration from ACT Waarden
export const OLD_CHECKIN_STORAGE_KEY = "act-waarden-checkins";
export const OLD_DB_TOKEN_KEY = "act-waarden-db-token";
export const OLD_DOMAINS_STORAGE_KEY = "act-waarden-domains";

export const CSV_COLUMNS = ["type","token","id","activity","feeling","direction","selectedValues","selectedDrivers","date","time","exportStatus","importStatus","value"];

export const CHART_COLORS = [
  "#C47A5A", "#5A7A8A", "#6A5A8A", "#5A8A6A", "#8A7A5A", "#8A5A6A",
  "#4A8A8A", "#8A6A4A", "#6A8A5A", "#7A5A7A", "#5A6A8A", "#8A8A5A",
];

export const DOMAIN_PALETTE = [
  { color: "#C47A5A", bgLight: "#FDF6F0" },
  { color: "#5A7A8A", bgLight: "#F0F5F7" },
  { color: "#6A5A8A", bgLight: "#F5F0FA" },
  { color: "#5A8A6A", bgLight: "#F0F7F2" },
  { color: "#8A7A5A", bgLight: "#F7F5F0" },
  { color: "#8A5A6A", bgLight: "#F7F0F3" },
  { color: "#4A8A8A", bgLight: "#F0F7F7" },
  { color: "#8A6A4A", bgLight: "#F7F3F0" },
  { color: "#5A6A8A", bgLight: "#F0F2F7" },
];

export const ICON_OPTIONS = ["\u266A","\u25C7","\u2B21","\u25CB","\u25FB","\u25C8","\u2605","\u2666","\u25B2","\u25CF","\u25A0","\u2663","\u2726","\u2B22","\u25C6"];

export const MAX_DOMAINS = 9;
