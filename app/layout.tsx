import type { Metadata } from "next";
import "./globals.css";
import "./logo-fix.css";
import SeniorStorageNamespace from "./components/SeniorStorageNamespace";
import CustomCheckboxFields from "./components/CustomCheckboxFields";
import PlannerAttachmentEnhancer from "./components/PlannerAttachmentEnhancer";
import SeniorFinalSpreadEnhancer from "./components/SeniorFinalSpreadEnhancer";
import SeniorSpreadCountEnhancer from "./components/SeniorSpreadCountEnhancer";
import PlannerSaveStatus from "./components/PlannerSaveStatus";
import PlannerDesktopEnhancer from "./components/PlannerDesktopEnhancer";
import DashboardProgressEnhancer from "./components/DashboardProgressEnhancer";
import LoginRedirect from "./components/LoginRedirect";

export const metadata: Metadata = {
  title: "Живая планёрка МАРС",
  description: "Цифровая планёрка ученика МАРС"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <SeniorStorageNamespace />
        <LoginRedirect />
        <CustomCheckboxFields />
        <PlannerAttachmentEnhancer />
        <SeniorSpreadCountEnhancer />
        <SeniorFinalSpreadEnhancer />
        <PlannerSaveStatus />
        <PlannerDesktopEnhancer />
        <DashboardProgressEnhancer />
        {children}
      </body>
    </html>
  );
}
