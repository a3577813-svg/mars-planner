"use client";

import Link from "next/link";
import type {ReactNode} from "react";

export type CabinetNavItem={href:string;label:string;icon?:string;badge?:string};
type Props={roleLabel:string;title:string;nav:CabinetNavItem[];activeHref?:string;children:ReactNode;action?:ReactNode;studentName?:string;gradeLabel?:string};

const icons:Record<string,string>={home:"⌂",book:"▣",projects:"◇",materials:"▱",comments:"▢",submit:"▤",profile:"♙",settings:"⚙"};

export default function CabinetShell({nav,activeHref,children,studentName="Аня Иванова",gradeLabel="8–11 класс"}:Props){
 const firstName=studentName.split(" ")[0];
 return <main className="cabinetShell">
  <aside className="cabinetSidebar">
   <Link href="/" className="cabinetBrand">
    <span className="cabinetLogo"><img src="/mars-logo.svg" alt="МАРС"/></span>
    <span className="cabinetBrandText"><b>МАРС</b><small>ПРОЕКТИРУЕМ<br/>БУДУЩЕЕ</small></span>
   </Link>
   <nav className="cabinetNav">{nav.map(item=><Link key={item.href} href={item.href} className={item.href===activeHref?"active":""}><span className="cabinetNavIcon">{item.icon||"•"}</span><span>{item.label}</span>{item.badge&&<b className="cabinetBadge">{item.badge}</b>}</Link>)}</nav>
   <div className="cabinetDivider"/>
   <nav className="cabinetNav cabinetSecondary">
    <a href="#profile"><span className="cabinetNavIcon">{icons.profile}</span><span>Профиль</span></a>
    <a href="#settings"><span className="cabinetNavIcon">{icons.settings}</span><span>Настройки</span></a>
   </nav>
   <div className="cabinetMotivation">БОЛЬШИЕ<br/>ЦЕЛИ<br/>НАЧИНАЮТСЯ<br/>С ПЛАНА <span>↗</span></div>
   <div className="cabinetMarsArt"><div className="marsOrb"/><div className="marsLine l1"/><div className="marsLine l2"/><small>МАРС<br/>— ЭТО ЛЮДИ ♡</small></div>
  </aside>
  <section className="cabinetMain">
   <header className="cabinetTopbar">
    <div className="cabinetGreeting"><strong>Привет, {firstName}! <span>👋</span></strong><small>Хороший день, чтобы сделать ещё один шаг к своим целям.</small></div>
    <div className="cabinetUser"><span className="cabinetSearch">⌕</span><button className="cabinetGrade">♧&nbsp; {gradeLabel}</button><span className="cabinetAvatar">{firstName.slice(0,1)}</span><b>{studentName}</b><span className="cabinetChevron">⌄</span></div>
   </header>
   <div className="cabinetContent">{children}</div>
  </section>
  <style jsx global>{`
   *{box-sizing:border-box}html,body{margin:0;padding:0}body{font-family:Inter,Arial,sans-serif;background:#f7f8ff;color:#1e275f}
   .cabinetShell{min-height:100vh;display:grid;grid-template-columns:236px minmax(0,1fr);background:#f7f8ff}
   .cabinetSidebar{position:sticky;top:0;height:100vh;overflow:hidden;display:flex;flex-direction:column;padding:20px 14px 0;background:linear-gradient(180deg,#292651 0%,#24214e 66%,#1d1c46 100%);color:#fff}
   .cabinetBrand{height:105px;padding:0 9px;display:flex;align-items:flex-start;gap:10px;color:#fff;text-decoration:none}.cabinetLogo{width:52px;height:52px;border-radius:14px;background:#fff;display:grid;place-items:center;overflow:hidden;flex:0 0 auto}.cabinetLogo img{width:47px;height:40px;object-fit:contain}.cabinetBrandText{display:grid;gap:3px;padding-top:3px}.cabinetBrandText b{font-size:27px;line-height:1;letter-spacing:.02em}.cabinetBrandText small{font-size:9px;line-height:1.45;letter-spacing:.13em;color:#e9e6f6}
   .cabinetNav{display:grid;gap:6px}.cabinetNav a{position:relative;display:flex;align-items:center;gap:13px;min-height:44px;padding:10px 13px;border-radius:12px;color:#f5f3fb;text-decoration:none;font-size:13px;font-weight:800}.cabinetNav a:hover{background:#ffffff12}.cabinetNav a.active{background:#7448d4;box-shadow:0 9px 24px #0c082b45}.cabinetNavIcon{width:22px;text-align:center;font-size:19px;line-height:1;color:#fff}.cabinetBadge{margin-left:auto;min-width:20px;height:20px;padding:0 6px;display:grid;place-items:center;border-radius:99px;background:#ff693a;color:#fff;font-size:10px}.cabinetDivider{height:1px;background:#ffffff30;margin:25px 10px 7px}.cabinetSecondary{margin-top:0}.cabinetMotivation{margin-top:auto;padding:0 14px 14px;color:#f4f0fb;font-family:Georgia,serif;font-size:15px;line-height:1.25;font-style:italic;letter-spacing:.03em}.cabinetMotivation span{float:right;font-size:26px}.cabinetMarsArt{height:142px;margin:0 -14px;position:relative;overflow:hidden;background:linear-gradient(180deg,#28234f,#1c1b45)}.marsOrb{position:absolute;width:190px;height:112px;left:18px;bottom:-55px;border-radius:50%;background:radial-gradient(circle at 36% 22%,#f6b181 0 10%,#d56d55 25%,#8b4960 58%,#3c315f 84%);box-shadow:0 -5px 40px #d8785360}.marsLine{position:absolute;height:1px;background:#bca9ef66;transform:rotate(-18deg);transform-origin:left}.marsLine.l1{width:220px;left:-30px;bottom:69px}.marsLine.l2{width:175px;left:40px;bottom:48px}.cabinetMarsArt small{position:absolute;left:18px;bottom:9px;color:#fff;font:italic 12px/1.25 Georgia,serif;z-index:2}
   .cabinetMain{min-width:0}.cabinetTopbar{min-height:92px;display:flex!important;align-items:center;justify-content:space-between;gap:24px;padding:18px 38px;background:#fff;border-bottom:1px solid #ecebf4}.cabinetGreeting{display:grid;gap:5px}.cabinetGreeting strong{font-size:28px;line-height:1;color:#17205f;letter-spacing:-.045em}.cabinetGreeting strong span{font-size:22px}.cabinetGreeting small{font-size:12px;color:#667092}.cabinetUser{display:flex;align-items:center;gap:12px;color:#20275f;font-size:12px;white-space:nowrap}.cabinetSearch{font-size:27px;line-height:1;margin-right:2px}.cabinetGrade{border:0;border-radius:24px;padding:11px 16px;background:#eeeaff;color:#382478;font:800 12px Inter,Arial,sans-serif}.cabinetAvatar{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:#7048c8;color:#fff;font-size:17px;font-weight:900}.cabinetUser b{font-size:12px}.cabinetChevron{font-size:18px}.cabinetContent{width:min(1340px,100%);margin:0 auto;padding:28px 30px 54px}.cabinetGrid{display:grid;gap:16px}.cabinetCard{background:#fff;border:1px solid #e7e6f0;border-radius:19px;box-shadow:0 7px 28px #25245b0b}.cabinetCard.pad{padding:20px}.cabinetPrimary{display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:12px;padding:13px 20px;background:#6332c7;color:#fff;text-decoration:none;font:800 13px Inter,Arial,sans-serif;cursor:pointer}.cabinetSecondary{display:inline-flex;align-items:center;justify-content:center;border:1px solid #dedbea;border-radius:11px;padding:9px 13px;background:#fff;color:#56348f;font:800 12px Inter,Arial,sans-serif;cursor:pointer}.sectionHead{display:flex;justify-content:space-between;align-items:center;gap:10px}.sectionHead a{color:#7048ce;font-weight:800;font-size:11px;text-decoration:none}.sectionHead small{color:#777d9a}
   @media(max-width:1050px){.cabinetShell{grid-template-columns:205px 1fr}.cabinetContent{padding:22px 20px}.cabinetTopbar{padding:16px 22px}}
   @media(max-width:780px){.cabinetShell{grid-template-columns:1fr}.cabinetSidebar{position:relative;height:auto;padding:12px 14px}.cabinetBrand{height:auto}.cabinetNav{display:flex;overflow:auto;margin-top:12px}.cabinetNav a{white-space:nowrap}.cabinetDivider,.cabinetMotivation,.cabinetMarsArt,.cabinetSecondary{display:none}.cabinetTopbar{padding:14px 16px}.cabinetGreeting strong{font-size:21px}.cabinetGreeting small,.cabinetUser b,.cabinetSearch{display:none}.cabinetContent{padding:16px 12px 35px}}
  `}</style>
 </main>
}
