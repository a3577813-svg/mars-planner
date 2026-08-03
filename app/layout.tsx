import type { Metadata } from "next";
import "./globals.css";
import "./logo-fix.css";
import CustomCheckboxFields from "./components/CustomCheckboxFields";

export const metadata: Metadata = {
  title: "Живая планёрка МАРС",
  description: "Цифровая планёрка ученика МАРС"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <CustomCheckboxFields />
        {children}
      </body>
    </html>
  );
}