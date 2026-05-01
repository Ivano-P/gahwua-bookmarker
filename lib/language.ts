/**
 * Language utilities — single source of truth for language display.
 * Ordered: EN → FR → JA/KO/ZH (raws) → common scanlation langs → OTHER.
 */

export const LANGUAGE_OPTIONS = [
  { value: "EN", label: "🇬🇧 EN", flag: "🇬🇧", fullName: "English" },
  { value: "FR", label: "🇫🇷 FR", flag: "🇫🇷", fullName: "French" },
  { value: "JA", label: "🇯🇵 JA", flag: "🇯🇵", fullName: "Japanese" },
  { value: "KO", label: "🇰🇷 KO", flag: "🇰🇷", fullName: "Korean" },
  { value: "ZH", label: "🇨🇳 ZH", flag: "🇨🇳", fullName: "Chinese" },
  { value: "ES", label: "🇪🇸 ES", flag: "🇪🇸", fullName: "Spanish" },
  { value: "PT", label: "🇵🇹 PT", flag: "🇵🇹", fullName: "Portuguese" },
  { value: "DE", label: "🇩🇪 DE", flag: "🇩🇪", fullName: "German" },
  { value: "IT", label: "🇮🇹 IT", flag: "🇮🇹", fullName: "Italian" },
  { value: "TH", label: "🇹🇭 TH", flag: "🇹🇭", fullName: "Thai" },
  { value: "VI", label: "🇻🇳 VI", flag: "🇻🇳", fullName: "Vietnamese" },
  { value: "TR", label: "🇹🇷 TR", flag: "🇹🇷", fullName: "Turkish" },
  { value: "ID", label: "🇮🇩 ID", flag: "🇮🇩", fullName: "Indonesian" },
  { value: "AR", label: "🇸🇦 AR", flag: "🇸🇦", fullName: "Arabic" },
  { value: "RU", label: "🇷🇺 RU", flag: "🇷🇺", fullName: "Russian" },
  { value: "PL", label: "🇵🇱 PL", flag: "🇵🇱", fullName: "Polish" },
  { value: "OTHER", label: "🌐 Other", flag: "🌐", fullName: "Other" },
] as const;

/** Map from code → option for quick lookups */
const LANGUAGE_MAP = new Map<string, (typeof LANGUAGE_OPTIONS)[number]>(
  LANGUAGE_OPTIONS.map((opt) => [opt.value, opt])
);

/** Get the compact label (e.g. "🇬🇧 EN") */
export function getLanguageLabel(code: string): string {
  return LANGUAGE_MAP.get(code)?.label ?? `🌐 ${code}`;
}

/** Get just the flag emoji */
export function getLanguageFlag(code: string): string {
  return LANGUAGE_MAP.get(code)?.flag ?? "🌐";
}

/** Get the full language name (e.g. "English") for tooltips */
export function getLanguageFullName(code: string): string {
  return LANGUAGE_MAP.get(code)?.fullName ?? code;
}
