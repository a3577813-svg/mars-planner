"use client";

import Link from "next/link";
import type {ReactNode} from "react";

export type CabinetNavItem = {
  href: string;
  label: string;
  icon?: string;
};

type CabinetShellProps = {
  roleLabel: string;
  title: string;
  nav: CabinetNavItem[];
  activeHref?: string;
  children: ReactNode;
  action?: ReactNode;
};

export default function CabinetShell({
  roleLabel,
  title,
  nav,
  activeHref,
  children,
  action,
}: CabinetShellProps) {
  return (
    <main className="cabinetShell">
      <aside className="cabinetSidebar">
        <Link href="/" className="cabinetLogo">
          <img src="/mars-logo.svg" alt="МАРС" />
          <span>ЖИВАЯ<br />ПЛАНЁРКА</span>
        </Link>

        <div className="cabinetRole">{roleLabel}</div>

        <nav className="cabinetNav" aria-label="Навигация кабинета">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={item.href === activeHref ? "active" : ""}
            >
              <span className="cabinetNavIcon">{item.icon || "•"}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="cabinetSidebarBottom">
          <Link href="/" className="cabinetBack">← Выйти</Link>
        </div>
      </aside>

      <section className="cabinetMain">
        <header className="cabinetTopbar">
          <div>
            <div className="cabinetKicker">МАРС · {roleLabel}</div>
            <h1>{title}</h1>
          </div>
          {action && <div className="cabinetTopbarAction">{action}</div>}
        </header>
        <div className="cabinetContent">{children}</div>
      </section>

      <style jsx global>{`
        *{box-sizing:border-box}
        body{margin:0;font-family:Inter,Arial,sans-serif;background:#f6f3f8;color:#30263a}
        .cabinetShell{min-height:100vh;display:grid;grid-template-columns:238px minmax(0,1fr);background:#f6f3f8}
        .cabinetSidebar{position:sticky;top:0;height:100vh;display:flex;flex-direction:column;padding:26px 16px 18px;background:#2f1558;color:#fff}
        .cabinetLogo{display:flex;align-items:center;gap:12px;padding:0 10px;color:#fff;text-decoration:none}
        .cabinetLogo img{width:68px;height:auto;filter:brightness(0) invert(1)}
        .cabinetLogo span{font-size:10px;line-height:1.25;font-weight:900;letter-spacing:.12em}
        .cabinetRole{margin:28px 10px 10px;color:#cdbbe4;font-size:10px;font-weight:900;letter-spacing:.13em;text-transform:uppercase}
        .cabinetNav{display:grid;gap:4px}
        .cabinetNav a{display:flex;align-items:center;gap:11px;padding:11px 12px;border-radius:12px;color:#e9def3;text-decoration:none;font-size:13px;font-weight:750;transition:.16s ease}
        .cabinetNav a:hover{background:#ffffff12;color:#fff}
        .cabinetNav a.active{background:#fff;color:#43206f;box-shadow:0 8px 22px #16062b33}
        .cabinetNavIcon{width:22px;text-align:center;font-size:15px}
        .cabinetSidebarBottom{margin-top:auto;padding:12px 10px 0;border-top:1px solid #ffffff18}
        .cabinetBack{color:#cdbbe4;text-decoration:none;font-size:12px;font-weight:750}
        .cabinetMain{min-width:0}
        .cabinetTopbar{min-height:88px;padding:20px 34px;display:flex;align-items:center;justify-content:space-between;gap:20px;background:#fff;border-bottom:1px solid #e8e1ed}
        .cabinetKicker{margin-bottom:5px;color:#806b92;font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
        .cabinetTopbar h1{margin:0;color:#32154f;font-size:25px;line-height:1.1;letter-spacing:-.025em}
        .cabinetTopbarAction{display:flex;align-items:center;gap:8px}
        .cabinetContent{max-width:1380px;margin:0 auto;padding:30px 34px 60px}
        .cabinetGrid{display:grid;gap:18px}
        .cabinetGrid.cols2{grid-template-columns:repeat(2,minmax(0,1fr))}
        .cabinetGrid.cols3{grid-template-columns:repeat(3,minmax(0,1fr))}
        .cabinetCard{background:#fff;border:1px solid #e8e1ed;border-radius:18px;box-shadow:0 8px 30px #3420440a}
        .cabinetCard.pad{padding:22px}
        .cabinetEyebrow{margin:0 0 7px;color:#806b92;font-size:10px;font-weight:900;letter-spacing:.13em;text-transform:uppercase}
        .cabinetCard h2,.cabinetCard h3{margin:0;color:#3c1c59;letter-spacing:-.02em}
        .cabinetCard p{color:#74697c;line-height:1.5}
        .cabinetPrimary{display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:11px;padding:10px 14px;background:#5c2a9f;color:#fff;text-decoration:none;font:800 13px Inter,Arial,sans-serif;cursor:pointer}
        .cabinetSecondary{display:inline-flex;align-items:center;justify-content:center;border:1px solid #dfd5e7;border-radius:11px;padding:10px 14px;background:#fff;color:#563080;text-decoration:none;font:800 13px Inter,Arial,sans-serif;cursor:pointer}
        @media(max-width:900px){.cabinetShell{grid-template-columns:1fr}.cabinetSidebar{position:relative;height:auto;padding:14px 16px;display:block}.cabinetLogo{display:inline-flex}.cabinetRole{display:none}.cabinetNav{display:flex;overflow:auto;margin-top:14px}.cabinetNav a{white-space:nowrap}.cabinetSidebarBottom{display:none}.cabinetTopbar{padding:18px 22px}.cabinetContent{padding:22px}.cabinetGrid.cols2,.cabinetGrid.cols3{grid-template-columns:1fr}}
        @media(max-width:560px){.cabinetLogo img{width:58px}.cabinetTopbar{min-height:74px;padding:15px 16px}.cabinetTopbar h1{font-size:21px}.cabinetContent{padding:16px}.cabinetTopbarAction{display:none}}
      `}</style>
    </main>
  );
}
