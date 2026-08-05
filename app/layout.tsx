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
import DashboardLiveHeader from "./components/DashboardLiveHeader";
import DashboardCalendar from "./components/DashboardCalendar";
import DashboardMission from "./components/DashboardMission";
import DashboardRouteDesign from "./components/DashboardRouteDesign";
import DashboardFirstPageDesign from "./components/DashboardFirstPageDesign";
import DashboardNavigationFix from "./components/DashboardNavigationFix";
import StudentAssignmentEnhancer from "./components/StudentAssignmentEnhancer";
import TutorSpreadReview from "./components/TutorSpreadReview";
import AdminCalendarLinkEnhancer from "./components/AdminCalendarLinkEnhancer";
import AdminSpreadLinkEnhancer from "./components/AdminSpreadLinkEnhancer";
import AdminSpreadTextEditor from "./components/AdminSpreadTextEditor";
import LoginRedirect from "./components/LoginRedirect";
import RoleAccessControl from "./components/RoleAccessControl";

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
        <RoleAccessControl />
        <CustomCheckboxFields />
        <PlannerAttachmentEnhancer />
        <SeniorSpreadCountEnhancer />
        <SeniorFinalSpreadEnhancer />
        <PlannerSaveStatus />
        <PlannerDesktopEnhancer />
        <DashboardProgressEnhancer />
        <DashboardLiveHeader />
        <DashboardCalendar />
        <DashboardMission />
        <DashboardRouteDesign />
        <DashboardFirstPageDesign />
        <DashboardNavigationFix />
        <StudentAssignmentEnhancer />
        <TutorSpreadReview />
        <AdminCalendarLinkEnhancer />
        <AdminSpreadLinkEnhancer />
        <AdminSpreadTextEditor />
        {children}
      </body>
    </html>
  );
}
