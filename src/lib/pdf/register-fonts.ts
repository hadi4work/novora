import path from "path";
import { Font } from "@react-pdf/renderer";

let registered = false;

export function registerResumePdfFonts() {
  if (registered) return;

  Font.register({
    family: "NotoSansArabic",
    fonts: [
      {
        src: path.join(process.cwd(), "public/fonts/NotoSansArabic-Regular.ttf"),
        fontWeight: "normal",
      },
      {
        src: path.join(process.cwd(), "public/fonts/NotoSansArabic-Bold.ttf"),
        fontWeight: "bold",
      },
    ],
  });

  Font.registerHyphenationCallback((word) => [word]);
  registered = true;
}
