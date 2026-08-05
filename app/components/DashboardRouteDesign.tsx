"use client";

import {useEffect} from "react";

type Stage={label:string;date:string;icon:string};

const stages:Stage[]=[
 {label:"Запуск",date:"2026-09-02",icon:"🚀"},
 {label:"Академический трек",date:"2026-09-09",icon:"📚"},
 {label:"МАРСФЕСТ",date:"2026-10-05",icon:"🎭"},
 {label:"Проектная конференция",date:"2026-12-24",icon:"🎤"},
 {label:"Второй цикл",date:"2027-01-11",icon:"↗"},
 {label:"Весенний МАРСФЕСТ",date:"2027-02-15",icon:"🎭"},
 {label:"Финал года",date:"2027-05-25",icon:"🏁"},
 {label:"Смены",date:"2027-06-01",icon:"☀️"}
];

const parse=(value:string)=>new Date(`${value}T00:00:00`).getTime();

function routePosition(now:Date){
 const current=new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime();
 const first=parse(stages[0].date),last=parse(stages[stages.length-1].date);
 if(current<=first)return 0;
 if(current>=last)return 100;
 return Math.round((current-first)/(last-first)*100);
}

export default function DashboardRouteDesign(){
 useEffect(()=>{
  const apply=()=>{
   const isSenior=location.pathname==="/senior";
   const isJunior=location.pathname==="/student";
   if(!isSenior&&!isJunior)return;
   const root=document.querySelector<HTMLElement>(isSenior?"main.senior":"main.studentCabinet");
   if(!root)return;
   const hero=root.querySelector<HTMLElement>(".hero");
   if(!hero)return;

   if(!root.querySelector(".marsYearRoute")){
    const position=routePosition(new Date());
    const route=document.createElement("section");
    route.className="marsYearRoute";
    route.innerHTML=`<div class="marsYearRouteHead"><div><p>МАРШРУТ УЧЕБНОГО ГОДА</p><h2>Где мы сейчас</h2></div><span>2026–2027</span></div><div class="marsYearRouteTrack"><div class="marsYearRouteLine"><i style="width:${position}%"></i><b style="left:${position}%" aria-label="Текущая точка"></b></div><div class="marsYearRouteStages">${stages.map(stage=>`<div><span>${stage.icon}</span><small>${stage.label}</small></div>`).join("")}</div></div>`;
    hero.insertAdjacentElement("afterend",route);
   }

   const title=root.querySelector<HTMLElement>(isSenior?".sectionTitle h2":".cardTitle h2");
   if(title&&title.textContent?.trim()==="Мой маршрут")title.textContent="Мои развороты";

   const links=Array.from(root.querySelectorAll<HTMLAnchorElement>(isSenior?".list>a":".routeList>a"));
   links.forEach(link=>{
    if(link.querySelector(".marsCardIcon"))return;
    const number=Number((link.querySelector(isSenior?":scope>b":".num")?.textContent||"0").trim());
    const icon=number<=5?"✦":number<=13?"🧭":number<=21?"🚀":number<=28?"💬":number<=36?"🛠":number<=43?"🎤":"🏛";
    const iconNode=document.createElement("span");
    iconNode.className="marsCardIcon";
    iconNode.textContent=icon;
    const text=link.querySelector("div");
    if(text)link.insertBefore(iconNode,text);
   });
  };

  apply();
  const observer=new MutationObserver(()=>requestAnimationFrame(apply));
  observer.observe(document.body,{childList:true,subtree:true});
  return()=>observer.disconnect();
 },[]);

 return <style jsx global>{`
  .marsYearRoute{max-width:1256px;margin:0 auto 24px;padding:24px 28px;border:1px solid #e8e0ef;border-radius:28px;background:#fff;box-shadow:0 18px 48px #3b2a5510}
  .studentCabinet .wrap>.marsYearRoute{max-width:none;margin:24px 0 0}
  .marsYearRouteHead{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:22px}
  .marsYearRouteHead p{margin:0 0 5px;font-size:10px;letter-spacing:.15em;font-weight:900;color:#7a4fbd}
  .marsYearRouteHead h2{margin:0;font-size:25px;color:#3f245f}
  .marsYearRouteHead>span{padding:7px 11px;border-radius:999px;background:#f2ecfa;color:#6a3ab7;font-size:12px;font-weight:900}
  .marsYearRouteTrack{position:relative;padding-top:5px}
  .marsYearRouteLine{position:relative;height:8px;margin:0 24px 15px;border-radius:999px;background:#ece6f1}
  .marsYearRouteLine i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#6a31bc,#ff6847)}
  .marsYearRouteLine b{position:absolute;top:50%;width:18px;height:18px;transform:translate(-50%,-50%);border:4px solid #fff;border-radius:50%;background:#ff6547;box-shadow:0 0 0 3px #ff65472a}
  .marsYearRouteStages{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:8px}
  .marsYearRouteStages>div{display:grid;justify-items:center;gap:5px;text-align:center}
  .marsYearRouteStages span{font-size:20px}
  .marsYearRouteStages small{font-size:10px;line-height:1.2;color:#756c7d}
  .marsCardIcon{width:34px;height:34px;flex:0 0 34px;display:grid;place-items:center;border-radius:11px;background:#f7f2fb;font-size:16px}
  .routeList a,.list>a{transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}
  .routeList a:hover,.list>a:hover{transform:translateY(-2px);border-color:#cdb8e5!important;box-shadow:0 10px 24px #4f356914}
  .routeList a.current .marsCardIcon,.list>a.current .marsCardIcon{background:#ffe9e1}
  .routeList a.done .marsCardIcon,.list>a.done .marsCardIcon{background:#eaf7ee}
  @media(max-width:900px){.marsYearRoute{margin-left:20px;margin-right:20px}.studentCabinet .wrap>.marsYearRoute{margin-left:0;margin-right:0}.marsYearRouteStages{grid-template-columns:repeat(4,1fr);row-gap:14px}}
  @media(max-width:650px){.marsYearRoute{margin-left:14px;margin-right:14px;padding:20px 16px}.studentCabinet .wrap>.marsYearRoute{margin-left:0;margin-right:0}.marsYearRouteHead h2{font-size:22px}.marsYearRouteStages{grid-template-columns:repeat(2,1fr)}.marsYearRouteLine{margin:0 8px 16px}.marsCardIcon{display:none}}
 `}</style>;
}
