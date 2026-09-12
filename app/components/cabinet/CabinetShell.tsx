"use client";

import Link from "next/link";
import type {ReactNode} from "react";

export type CabinetNavItem={href:string;label:string;icon?:string;badge?:string};
type Props={roleLabel:string;title:string;nav:CabinetNavItem[];activeHref?:string;children:ReactNode;action?:ReactNode;studentName?:string;gradeLabel?:string};

export default function CabinetShell({nav,activeHref,children,studentName="Аня Иванова",gradeLabel="8–11 класс"}:Props){
 const firstName=studentName.split(" ")[0];
 return <main className="cabinetShell">
  <aside className="cabinetSidebar">
   <Link href="/" className="cabinetBrand">
    <img src="/mars-logo.svg" alt="МАРС"/>
    <div><b>МАРС</b><span>ПРОЕКТИРУЕМ<br/>БУДУЩЕЕ</span></div>
   </Link>
   <nav className="cabinetNav">{nav.map(item=><Link key={item.href} href={item.href} className={item.href===activeHref?"active":""}><span className="cabinetNavIcon">{item.icon||"•"}</span><span>{item.label}</span>{item.badge&&<b className="cabinetBadge">{item.badge}</b>}</Link>)}</nav>
   <div className="cabinetDivider"/>
   <nav className="cabinetNav cabinetSecondary"><a href="#profile"><span className="cabinetNavIcon">♙</span><span>Профиль</span></a><a href="#settings"><span className="cabinetNavIcon">⚙</span><span>Настройки</span></a></nav>
   <div className="cabinetMotivation">БОЛЬШИЕ<br/>ЦЕЛИ<br/>НАЧИНАЮТСЯ<br/>С ПЛАНА <span>↗</span></div>
   <div className="cabinetMarsArt"><div className="marsOrb"/><div className="marsHorizon"/><small>МАРС<br/>— ЭТО ЛЮДИ ♡</small></div>
  </aside>
  <section className="cabinetMain">
   <header className="cabinetTopbar">
    <div className="cabinetGreeting"><strong>Привет, {firstName}! <span>👋</span></strong><small>Хороший день, чтобы сделать ещё один шаг к своим целям.</small></div>
    <div className="cabinetUser"><span className="cabinetSearch">⌕</span><button className="cabinetGrade">♧&nbsp; {gradeLabel}</button><span className="cabinetAvatar">{firstName.slice(0,1)}</span><b>{studentName}</b><span className="cabinetChevron">⌄</span></div>
   </header>
   <div className="cabinetContent">{children}</div>
  </section>
  <style jsx global>{`
   *{box-sizing:border-box}html,body{margin:0;padding:0}body{font-family:Inter,Arial,sans-serif;background:#f7f8ff;color:#1f275d}
   .cabinetShell{min-height:100vh;display:grid;grid-template-columns:210px minmax(0,1fr);background:#f7f8ff}
   .cabinetSidebar{position:sticky;top:0;height:100vh;overflow:hidden;display:flex;flex-direction:column;padding:18px 15px 0;background:linear-gradient(180deg,#292652 0%,#24214e 70%,#1d1d48 100%);color:#fff}
   .cabinetBrand{height:116px;padding:2px 8px 0;display:flex;align-items:flex-start;gap:7px;color:#fff;text-decoration:none}.cabinetBrand img{width:50px;height:48px;object-fit:contain;object-position:center top;filter:none}.cabinetBrand div{display:grid;gap:1px;padding-top:2px}.cabinetBrand b{font:800 27px/1 Inter,Arial,sans-serif;letter-spacing:.02em;color:#fff}.cabinetBrand span{font:500 10px/1.45 Inter,Arial,sans-serif;letter-spacing:.13em;color:#e8e5f6}
   .cabinetNav{display:grid;gap:7px;margin-top:16px}.cabinetNav a{position:relative;display:flex;align-items:center;gap:12px;min-height:43px;padding:10px 12px;border-radius:11px;color:#f3f1fb;text-decoration:none;font-size:13px;font-weight:800}.cabinetNav a:hover{background:#ffffff12}.cabinetNav a.active{background:#7048ce;color:#fff;box-shadow:0 8px 22px #0e0a2b45}.cabinetNavIcon{width:20px;text-align:center;font-size:19px;line-height:1;color:#fff}.cabinetBadge{margin-left:auto;min-width:20px;height:20px;padding:0 6px;display:grid;place-items:center;border-radius:99px;background:#ff6739;color:#fff;font-size:10px}.cabinetDivider{height:1px;background:#ffffff35;margin:24px 10px 6px}.cabinetSecondary{margin-top:0}.cabinetMotivation{margin-top:auto;padding:0 12px 8px;color:#f0edf9;font-family:Georgia,serif;font-size:15px;line-height:1.25;font-style:italic;letter-spacing:.03em}.cabinetMotivation span{float:right;font-size:24px}.cabinetMarsArt{height:165px;margin:0 -15px;position:relative;overflow:hidden;background:linear-gradient(180deg,#26234e 0%,#202047 100%)}.marsOrb{position:absolute;width:180px;height:105px;left:15px;bottom:-48px;border-radius:50%;background:radial-gradient(circle at 35% 22%,#f3a06f 0 10%,#d56d55 24%,#8d4861 57%,#3e315f 83%);box-shadow:0 -10px 45px #d8785360}.marsHorizon{position:absolute;left:0;right:0;bottom:0;height:70px;background:linear-gradient(165deg,transparent 0 34%,#141632 35% 100%);opacity:.9}.cabinetMarsArt small{position:absolute;left:17px;bottom:10px;color:#fff;font:italic 12px/1.25 Georgia,serif;z-index:2}
   .cabinetMain{min-width:0}.cabinetTopbar{min-height:86px;display:flex!important;align-items:center;justify-content:space-between;gap:20px;padding:18px 34px;background:#fff;border-bottom:1px solid #ecebf4}.cabinetGreeting{display:grid;gap:4px}.cabinetGreeting strong{font-size:27px;line-height:1;color:#17205f;letter-spacing:-.04em}.cabinetGreeting strong span{font-size:22px}.cabinetGreeting small{font-size:12px;color:#646b8e}.cabinetUser{display:flex;align-items:center;gap:11px;color:#20275f;font-size:12px;white-space:nowrap}.cabinetSearch{font-size:27px;line-height:1;margin-right:3px}.cabinetGrade{border:0;border-radius:22px;padding:10px 15px;background:#eeeaff;color:#30226c;font:800 12px Inter,Arial,sans-serif}.cabinetAvatar{width:43px;height:43px;border-radius:50%;display:grid;place-items:center;background:#7048c8;color:#fff;font-size:17px;font-weight:900}.cabinetUser b{font-size:12px}.cabinetChevron{font-size:18px}.cabinetContent{width:min(1280px,100%);margin:0 auto;padding:28px 30px 54px}.cabinetGrid{display:grid;gap:14px}.cabinetCard{background:#fff;border:1px solid #e7e6f0;border-radius:18px;box-shadow:0 7px 28px #25245b0b}.cabinetCard.pad{padding:18px}.cabinetPrimary{display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:11px;padding:12px 18px;background:#ff6739;color:#fff;text-decoration:none;font:800 13px Inter,Arial,sans-serif;cursor:pointer}.cabinetSecondary{display:inline-flex;align-items:center;justify-content:center;border:1px solid #dedbea;border-radius:11px;padding:9px 13px;background:#fff;color:#56348f;font:800 12px Inter,Arial,sans-serif;cursor:pointer}
   .sectionHead{display:flex;justify-content:space-between;align-items:center;gap:10px}.sectionHead a{color:#7048ce;font-weight:800;font-size:11px;text-decoration:none}.sectionHead small{color:#777d9a}
   @media(max-width:1050px){.cabinetShell{grid-template-columns:190px 1fr}.cabinetContent{padding:22px 20px}.cabinetTopbar{padding:16px 22px}}
   @media(max-width:780px){.cabinetShell{grid-template-columns:1fr}.cabinetSidebar{position:relative;height:auto;padding:12px 14px}.cabinetBrand{height:auto}.cabinetNav{display:flex;overflow:auto;margin-top:12px}.cabinetNav a{white-space:nowrap}.cabinetDivider,.cabinetMotivation,.cabinetMarsArt,.cabinetSecondary{display:none}.cabinetTopbar{padding:14px 16px}.cabinetGreeting strong{font-size:21px}.cabinetGreeting small,.cabinetUser b,.cabinetSearch{display:none}.cabinetContent{padding:16px 12px 35px}}
  `}</style>
 </main>
}
