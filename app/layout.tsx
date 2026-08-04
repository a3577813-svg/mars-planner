import type { Metadata } from "next";
import "./globals.css";
import "./logo-fix.css";
import CustomCheckboxFields from "./components/CustomCheckboxFields";
import PlannerAttachmentEnhancer from "./components/PlannerAttachmentEnhancer";
import LoginRedirect from "./components/LoginRedirect";

export const metadata: Metadata = {
  title: "Живая планёрка МАРС",
  description: "Цифровая планёрка ученика МАРС"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <LoginRedirect />
        <CustomCheckboxFields />
        <PlannerAttachmentEnhancer />
        {children}
      </body>
    </html>
  );
}