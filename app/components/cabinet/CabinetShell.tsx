"use client";

import Link from "next/link";
import type {ReactNode} from "react";

export type CabinetNavItem={href:string;label:string;icon?:string;badge?:string};
type Props={roleLabel:string;title:string;nav:CabinetNavItem[];activeHref?:string;children:ReactNode;action?:ReactNode;studentName?:string;gradeLabel?:string;brandHref?:string};

export default function CabinetShell({nav,activeHref,children,studentName="Аня Иванова",gradeLabel="8–11 класс",brandHref="/"}:Props){
 const firstName=studentName.split(" ")[0];
 return <main className="cabinetShell">
  <aside className="cabinetSidebar">
   <Link href={brandHref} className="cabinetBrand">
    <span className="cabinetLogo"><img src="/mars-logo.svg" alt="МАРС"/></span>
    <span className="cabinetBrandText"><b>МАРС</b><small>ПРОЕКТИРУЕМ<br/>БУДУЩЕЕ</small></span>
   </Link>
   <nav className="cabinetNav">{nav.map(item=><Link key={item.href} href={item.href} className={item.href===activeHref?"active":""}><span className="cabinetNavIcon">{item.icon||"•"}</span><span>{item.label}</span>{item.badge&&<b className="cabinetBadge">{item.badge}</b>}</Link>)}</nav>
   <div className="cabinetDivider"/>
   <div className="cabinetCosmos">
    <i className="orbit o1"/><i className="orbit o2"/><i className="orbit o3"/>
    <i className="planet p1"/><i className="planet p2"/><i className="planet p3"/>
    <div className="cabinetMotivation">БОЛЬШИЕ<br/>ЦЕЛИ<br/>НАЧИНАЮТСЯ<br/>С ПЛАНА <span>↗</span></div>
   </div>
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
   .cabinetNav{display:grid;gap:6px}.cabinetNav a{position:relative;display:flex;align-items:center;gap:13px;min-height:44px;padding:10px 13px;border-radius:12px;color:#f5f3fb;text-decoration:none;font-size:13px;font-weight:800}.cabinetNav a:hover{background:#ffffff12}.cabinetNav a.active{background:#7448d4;box-shadow:0 9px 24px #0c082b45}.cabinetNavIcon{width:22px;text-align:center;font-size:19px;line-height:1;color:#fff}.cabinetBadge{margin-left:auto;min-width:20px;height:20px;padding:0 6px;display:grid;place-items:center;border-radius:99px;background:#ff693a;color:#fff;font-size:10px}.cabinetDivider{height:1px;background:#ffffff30;margin:20px 10px 8px}.cabinetSecondaryNav{margin-top:0;flex:0 0 auto}.cabinetSecondaryNav a{background:transparent!important;border:0!important;padding:9px 13px!important;color:#e9e6f6!important;justify-content:flex-start!important}.cabinetSecondaryNav a:hover{background:#ffffff12!important;color:#fff!important}.cabinetCosmos{margin-top:auto;height:148px;position:relative;overflow:hidden}.cabinetCosmos:after{content:"";position:absolute;width:150px;height:150px;right:-54px;bottom:-44px;border-radius:50%;background:radial-gradient(circle,#7d55df66 0%,#6a43ce2e 38%,transparent 70%)}.orbit{position:absolute;border:1px solid #b7a6ea55;border-radius:50%;transform:rotate(-19deg)}.orbit.o1{width:250px;height:72px;left:-42px;bottom:62px}.orbit.o2{width:230px;height:64px;left:-20px;bottom:40px}.orbit.o3{width:210px;height:58px;left:20px;bottom:16px}.planet{position:absolute;border-radius:50%;box-shadow:0 0 12px #a88df255}.planet.p1{width:10px;height:10px;left:28px;bottom:106px;background:#d7cef7}.planet.p2{width:13px;height:13px;left:154px;bottom:84px;background:#9d87e5}.planet.p3{width:7px;height:7px;left:112px;bottom:46px;background:#e7e2fb}.cabinetMotivation{position:absolute;left:14px;right:10px;bottom:4px;z-index:2;padding:0;color:#f4f0fb;font-family:Georgia,serif;font-size:15px;line-height:1.25;font-style:italic;letter-spacing:.03em}.cabinetMotivation span{float:right;font-size:26px}
   .cabinetMain{min-width:0}.cabinetTopbar{min-height:92px;display:flex!important;align-items:center;justify-content:space-between;gap:24px;padding:18px 38px;background:#fff;border-bottom:1px solid #ecebf4}.cabinetGreeting{display:grid;gap:5px}.cabinetGreeting strong{font-size:28px;line-height:1;color:#17205f;letter-spacing:-.045em}.cabinetGreeting strong span{font-size:22px}.cabinetGreeting small{font-size:12px;color:#667092}.cabinetUser{display:flex;align-items:center;gap:12px;color:#20275f;font-size:12px;white-space:nowrap}.cabinetSearch{font-size:27px;line-height:1;margin-right:2px}.cabinetGrade{border:0;border-radius:24px;padding:11px 16px;background:#eeeaff;color:#382478;font:800 12px Inter,Arial,sans-serif}.cabinetAvatar{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:#7048c8;color:#fff;font-size:17px;font-weight:900}.cabinetUser b{font-size:12px}.cabinetChevron{font-size:18px}.cabinetContent{width:min(1340px,100%);margin:0 auto;padding:28px 30px 54px}.cabinetGrid{display:grid;gap:16px}.cabinetCard{background:#fff;border:1px solid #e7e6f0;border-radius:19px;box-shadow:0 7px 28px #25245b0b}.cabinetCard.pad{padding:20px}.cabinetPrimary{display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:12px;padding:13px 20px;background:#6332c7;color:#fff;text-decoration:none;font:800 13px Inter,Arial,sans-serif;cursor:pointer}.cabinetSecondary{display:inline-flex;align-items:center;justify-content:center;border:1px solid #dedbea;border-radius:11px;padding:9px 13px;background:#fff;color:#56348f;font:800 12px Inter,Arial,sans-serif;cursor:pointer}.sectionHead{display:flex;justify-content:space-between;align-items:center;gap:10px}.sectionHead a{color:#7048ce;font-weight:800;font-size:11px;text-decoration:none}.sectionHead small{color:#777d9a}
   @media(max-width:1050px){.cabinetShell{grid-template-columns:205px 1fr}.cabinetContent{padding:22px 20px}.cabinetTopbar{padding:16px 22px}}
   @media(max-width:780px){.cabinetShell{grid-template-columns:1fr}.cabinetSidebar{position:relative;height:auto;padding:12px 14px}.cabinetBrand{height:auto}.cabinetNav{display:flex;overflow:auto;margin-top:12px}.cabinetNav a{white-space:nowrap}.cabinetDivider,.cabinetMotivation,.cabinetMarsArt,.cabinetSecondaryNav{display:none}.cabinetTopbar{padding:14px 16px}.cabinetGreeting strong{font-size:21px}.cabinetGreeting small,.cabinetUser b,.cabinetSearch{display:none}.cabinetContent{padding:16px 12px 35px}}
  `}</style>
 </main>
}
