export const normalizeCroatianWord = (value) =>
  String(value ?? "")
    .toLocaleUpperCase("hr")
    .normalize("NFC")
    .replace(/[^A-ZČĆĐŠŽ]/g, "");

export const getLocalCalendarDayNumber = (date = new Date()) =>
  Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);

export const getLocalDateKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
