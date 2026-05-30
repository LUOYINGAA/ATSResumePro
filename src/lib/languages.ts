export const languages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
];

export type Language = (typeof languages)[number]["code"];
