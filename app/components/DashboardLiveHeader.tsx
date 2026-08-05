"use client";

import {useEffect} from "react";

type EventItem={title:string;start:string;end?:string;icon:string};

const events:EventItem[]=[
 {title:"Праздник",start:"2026-09-01",icon:"🎉"},
 {title:"Запускной интенсив",start:"2026-09-02",end:"2026-09-08",icon:"🚀"},
 {title:"Биосмена",start:"2026-09-09",end:"2026-09-20",icon:"🌿"},
 {title:"Академический трек",start:"2026-09-09",end:"2026-10-02",icon:"📚"},
 {title:"МАРСФЕСТ",start:"2026-10-05",end:"2026-10-09",icon:"🎭"},
 {title:"Каникулы",start:"2026-10-12",end:"2026-10-16",icon:"🍂"},
 {title:"Встреча команд: рефлексия МАРСФЕСТа",start:"2026-10-14",icon:"👥"},
 {title:"Родительское собрание 9 и 11 уровней",start:"2026-10-15",icon:"👨‍👩‍👧"},
 {title:"Академический трек",start:"2026-10-19",end:"2026-10-30",icon:"📚"},
 {title:"Академический трек",start:"2026-11-02",end:"2026-11-20",icon:"📚"},
 {title:"День Карьеры",start:"2026-11-05",end:"2026-11-06",icon:"🎓"},
 {title:"Родительский День Партнера",start:"2026-11-18",end:"2026-11-20",icon:"🤝"},
 {title:"Каникулы",start:"2026-11-23",end:"2026-11-27",icon:"🍂"},
 {title:"День Партнера с предпринимателями",start:"2026-11-27",icon:"🤝"},
 {title:"Академический трек",start:"2026-11-30",end:"2026-12-23",icon:"📚"},
 {title:"Интенсив по реализации проекта",start:"2026-12-14",end:"2026-12-15",icon:"🚀"},
 {title:"Итоговая проектная конференция",start:"2026-12-24",icon:"🎤"},
 {title:"Историческая игра",start:"2026-12-25",end:"2026-12-27",icon:"🏛️"},
 {title:"Каникулы",start:"2026-12-28",end:"2027-01-10",icon:"❄️"},
 {title:"Запускной интенсив",start:"2027-01-11",end:"2027-01-15",icon:"🚀"},
 {title:"Академический трек",start:"2027-01-18",end:"2027-01-29",icon:"📚"},
 {title:"Спектакль по Чехову",start:"2027-01-25",icon:"🎭"},
 {title:"Академический трек",start:"2027-02-01",end:"2027-02-12",icon:"📚"},
 {title:"МАРСФЕСТ",start:"2027-02-15",end:"2027-02-19",icon:"🎭"},
 {title:"Каникулы",start:"2027-02-22",end:"2027-02-26",icon:"❄️"},
 {title:"Встреча команд: рефлексия МАРСФЕСТа",start:"2027-02-25",icon:"👥"},
 {title:"Академический трек",start:"2027-03-01",end:"2027-03-31",icon:"📚"},
 {title:"День Карьеры",start:"2027-03-09",end:"2027-03-10",icon:"🎓"},
 {title:"Родительский День Партнера",start:"2027-03-31",end:"2027-04-02",icon:"🤝"},
 {title:"Каникулы",start:"2027-04-05",end:"2027-04-09",icon:"🌱"},
 {title:"День Партнера с предпринимателями",start:"2027-04-08",icon:"🤝"},
 {title:"Академический трек",start:"2027-04-12",end:"2027-04-23",icon:"📚"},
 {title:"Биосмена / академический трек",start:"2027-04-26",end:"2027-05-09",icon:"🌿"},
 {title:"Академический трек / аттестация",start:"2027-05-11",end:"2027-05-14",icon:"📝"},
 {title:"Интенсив по реализации проектов",start:"2027-05-17",end:"2027-05-18",icon:"🚀"},
 {title:"Уличный спектакль по Чехову",start:"2027-05-21",icon:"🎭"},
 {title:"Итоговая проектная конференция",start:"2027-05-25",icon:"🎤"},
 {title:"Последний звонок",start:"2027-05-26",icon:"🔔"},
 {title:"Историческая игра",start:"2027-05-27",end:"2027-05-29",icon:"🏛️"},
 {title:"Образовательные смены",start:"2027-06-01",end:"2027-06-25",icon:"☀️"},
 {title:"Контест",start:"2027-06-12",icon:"🏆"}
];

const day=(value:string)=>new Date(`${value}T00:00:00`);
const plural=(n:number)=>{const a=Math.abs(n)%100,b=a%10;return a>10&&a<20?"дней":b===1?"день":b>1&&b<5?"дня":"дней"};

function liveMessage(now:Date){
 const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
 const active=events.filter(item=>day(item.start)<=today&&day(item.end||item.start)>=today);
 if(active.length){
  const item=active[0],end=day(item.end||item.start),left=Math.max(0,Math.ceil((end.getTime()-today.getTime())/86400000));
  if(day(item.start).getTime()===today.getTime()&&end.getTime()===today.getTime())return `${item.icon} Сегодня: ${item.title}`;
  return `${item.icon} Сейчас проходит ${item.title}${left?`. Осталось ${left} ${plural(left)}`:""}`;
 }
 const next=events.find(item=>day(item.start)>today);
 if(!next)return "✨ Учебный год завершён — впереди новые маршруты";
 const diff=Math.ceil((day(next.start).getTime()-today.getTime())/86400000);
 return `${next.icon} До события «${next.title}» — ${diff} ${plural(diff)}`;
}

export default function DashboardLiveHeader(){
 useEffect(()=>{
  const apply=()=>{
   if(location.pathname!=="/student"&&location.pathname!=="/senior")return;
   const root=document.querySelector<HTMLElement>(location.pathname==="/senior"?"main.senior":"main.studentCabinet");
   if(!root)return;
   const header=root.querySelector("header");
   const hero=root.querySelector<HTMLElement>(".hero");
   if(!header||!hero)return;

   if(!root.querySelector(".marsLiveStrip")){
    const strip=document.createElement("section");
    strip.className="marsLiveStrip";
    strip.innerHTML=`<div><span class="marsLiveDot"></span><strong>СЕГОДНЯ В МАРС</strong><p>${liveMessage(new Date())}</p></div><button type="button" aria-label="Календарь скоро появится">Календарь года →</button>`;
    header.insertAdjacentElement("afterend",strip);
   }

   const h1=hero.querySelector("h1");
   if(h1)h1.textContent="Продолжим?";
   const primary=hero.querySelector<HTMLAnchorElement>("a.primary");
   if(primary){
    const number=(hero.querySelector(".ring strong")?.textContent||"1").trim();
    primary.textContent=`Продолжить с разворота ${number} →`;
   }
  };

  apply();
  const observer=new MutationObserver(()=>requestAnimationFrame(apply));
  observer.observe(document.body,{childList:true,subtree:true});
  return()=>observer.disconnect();
 },[]);

 return <style jsx global>{`
  .marsLiveStrip{max-width:1320px;margin:20px auto 0;padding:0 32px;display:flex;align-items:center;justify-content:space-between;gap:18px}
  .marsLiveStrip>div{min-height:62px;flex:1;display:grid;grid-template-columns:auto auto 1fr;align-items:center;gap:10px;padding:13px 18px;border:1px solid #e4d8f2;border-radius:20px;background:linear-gradient(120deg,#fff,#f6efff);box-shadow:0 12px 30px #3b2a5510}
  .marsLiveDot{width:10px;height:10px;border-radius:50%;background:#ff6547;box-shadow:0 0 0 6px #ff65471c}
  .marsLiveStrip strong{font-size:11px;letter-spacing:.14em;color:#6d3bb3;white-space:nowrap}
  .marsLiveStrip p{margin:0;color:#3e3150;font-weight:800;line-height:1.35}
  .marsLiveStrip button{border:0;border-radius:15px;padding:13px 16px;background:#5e2abb;color:#fff;font-weight:900;white-space:nowrap;cursor:pointer;opacity:.86}
  @media(max-width:900px){.marsLiveStrip{padding:0 20px}.marsLiveStrip>div{grid-template-columns:auto 1fr}.marsLiveStrip strong{grid-column:2}.marsLiveStrip p{grid-column:2}.marsLiveStrip button{display:none}}
  @media(max-width:650px){.marsLiveStrip{padding:0 14px;margin-top:12px}.marsLiveStrip>div{padding:12px 14px}.marsLiveStrip p{font-size:13px}}
 `}</style>;
}
