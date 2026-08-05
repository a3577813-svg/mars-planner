"use client";

import {useEffect,useMemo,useState} from "react";

type EventItem={title:string;start:string;end?:string;icon:string};

const events:EventItem[]=[
 {title:"Праздник",start:"2026-09-01",icon:"🎉"},{title:"Запускной интенсив",start:"2026-09-02",end:"2026-09-08",icon:"🚀"},{title:"Биосмена",start:"2026-09-09",end:"2026-09-20",icon:"🌿"},{title:"Академический трек",start:"2026-09-09",end:"2026-10-02",icon:"📚"},
 {title:"МАРСФЕСТ",start:"2026-10-05",end:"2026-10-09",icon:"🎭"},{title:"Каникулы",start:"2026-10-12",end:"2026-10-16",icon:"🍂"},{title:"Встреча команд: рефлексия МАРСФЕСТа",start:"2026-10-14",icon:"👥"},{title:"Родительское собрание 9 и 11 уровней",start:"2026-10-15",icon:"👨‍👩‍👧"},{title:"Академический трек",start:"2026-10-19",end:"2026-10-30",icon:"📚"},
 {title:"Академический трек",start:"2026-11-02",end:"2026-11-20",icon:"📚"},{title:"День Карьеры",start:"2026-11-05",end:"2026-11-06",icon:"🎓"},{title:"Родительский День Партнера",start:"2026-11-18",end:"2026-11-20",icon:"🤝"},{title:"Каникулы",start:"2026-11-23",end:"2026-11-27",icon:"🍂"},{title:"День Партнера с предпринимателями",start:"2026-11-27",icon:"🤝"},{title:"Академический трек",start:"2026-11-30",end:"2026-12-23",icon:"📚"},
 {title:"Интенсив по реализации проекта",start:"2026-12-14",end:"2026-12-15",icon:"🚀"},{title:"Итоговая проектная конференция",start:"2026-12-24",icon:"🎤"},{title:"Историческая игра",start:"2026-12-25",end:"2026-12-27",icon:"🏛️"},{title:"Каникулы",start:"2026-12-28",end:"2027-01-10",icon:"❄️"},
 {title:"Запускной интенсив",start:"2027-01-11",end:"2027-01-15",icon:"🚀"},{title:"Академический трек",start:"2027-01-18",end:"2027-01-29",icon:"📚"},{title:"Спектакль по Чехову",start:"2027-01-25",icon:"🎭"},
 {title:"Академический трек",start:"2027-02-01",end:"2027-02-12",icon:"📚"},{title:"МАРСФЕСТ",start:"2027-02-15",end:"2027-02-19",icon:"🎭"},{title:"Каникулы",start:"2027-02-22",end:"2027-02-26",icon:"❄️"},{title:"Встреча команд: рефлексия МАРСФЕСТа",start:"2027-02-25",icon:"👥"},
 {title:"Академический трек",start:"2027-03-01",end:"2027-03-31",icon:"📚"},{title:"День Карьеры",start:"2027-03-09",end:"2027-03-10",icon:"🎓"},{title:"Родительский День Партнера",start:"2027-03-31",end:"2027-04-02",icon:"🤝"},
 {title:"Каникулы",start:"2027-04-05",end:"2027-04-09",icon:"🌱"},{title:"День Партнера с предпринимателями",start:"2027-04-08",icon:"🤝"},{title:"Академический трек",start:"2027-04-12",end:"2027-04-23",icon:"📚"},{title:"Биосмена / академический трек",start:"2027-04-26",end:"2027-05-09",icon:"🌿"},
 {title:"Академический трек / аттестация",start:"2027-05-11",end:"2027-05-14",icon:"📝"},{title:"Интенсив по реализации проектов",start:"2027-05-17",end:"2027-05-18",icon:"🚀"},{title:"Уличный спектакль по Чехову",start:"2027-05-21",icon:"🎭"},{title:"Итоговая проектная конференция",start:"2027-05-25",icon:"🎤"},{title:"Последний звонок",start:"2027-05-26",icon:"🔔"},{title:"Историческая игра",start:"2027-05-27",end:"2027-05-29",icon:"🏛️"},
 {title:"Образовательные смены",start:"2027-06-01",end:"2027-06-25",icon:"☀️"},{title:"Контест",start:"2027-06-12",icon:"🏆"}
];

const parse=(value:string)=>new Date(`${value}T00:00:00`);
const fmt=(item:EventItem)=>{const a=parse(item.start),b=parse(item.end||item.start),f=(d:Date)=>d.toLocaleDateString("ru-RU",{day:"2-digit",month:"short"});return item.end?`${f(a)}–${f(b)}`:f(a)};
const monthKey=(value:string)=>value.slice(0,7);
const monthTitle=(key:string)=>parse(`${key}-01`).toLocaleDateString("ru-RU",{month:"long",year:"numeric"});
const dayDiff=(from:Date,to:Date)=>Math.max(0,Math.ceil((to.getTime()-from.getTime())/86400000));
const plural=(n:number)=>{const a=n%100,b=n%10;return a>10&&a<20?"дней":b===1?"день":b>1&&b<5?"дня":"дней"};

function summary(today:Date){
 const active=events.filter(item=>parse(item.start)<=today&&parse(item.end||item.start)>=today);
 const next=events.find(item=>parse(item.start)>today);
 return {active,next};
}

export default function DashboardCalendar(){
 const[open,setOpen]=useState(false);
 const groups=useMemo(()=>Array.from(new Set(events.map(e=>monthKey(e.start)))).map(key=>({key,items:events.filter(e=>monthKey(e.start)===key)})),[]);

 useEffect(()=>{
  let cancelled=false;
  let attempts=0;
  const apply=()=>{
   if(cancelled||location.pathname!=="/student"&&location.pathname!=="/senior")return;
   const root=document.querySelector<HTMLElement>(location.pathname==="/senior"?"main.senior":"main.studentCabinet");
   const aside=root?.querySelector("aside");
   if(!root||!aside){if(attempts++<20)setTimeout(apply,100);return}

   let panel=aside.querySelector<HTMLElement>(".marsCalendarPanel");
   if(!panel){
    const now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
    const {active,next}=summary(today);
    const current=active[0];
    const untilNext=next?dayDiff(today,parse(next.start)):0;
    panel=document.createElement("section");
    panel.className="panel marsCalendarPanel";
    panel.innerHTML=`<p>КАЛЕНДАРЬ МАРС</p><h3>Что происходит сейчас</h3><div class="marsCalendarSummary">${current?`<article class="isCurrent"><span class="marsEventBadge">Сейчас</span><div class="marsEventRow"><i>${current.icon}</i><div><b>${current.title}</b><small>${fmt(current)}</small></div></div></article>`:`<article class="isQuiet"><span class="marsEventBadge">Сейчас</span><p>Между событиями — можно спокойно продолжить работу в планёрке.</p></article>`}${next?`<article class="isNext"><span class="marsEventBadge">Следующее</span><div class="marsEventRow"><i>${next.icon}</i><div><b>${next.title}</b><small>${fmt(next)} · через ${untilNext} ${plural(untilNext)}</small></div></div></article>`:""}</div><button type="button" class="marsOpenCalendar">Открыть календарь года</button>`;
   }
   if(aside.firstElementChild!==panel)aside.prepend(panel);
   root.querySelectorAll<HTMLElement>(".marsOpenCalendar,.marsLiveStrip button").forEach(button=>{button.onclick=()=>setOpen(true)});
  };

  apply();
  const esc=(e:KeyboardEvent)=>{if(e.key==="Escape")setOpen(false)};
  window.addEventListener("keydown",esc);
  return()=>{cancelled=true;window.removeEventListener("keydown",esc)};
 },[]);

 return <>
  {open&&<div className="marsCalendarModal" role="dialog" aria-modal="true" aria-label="Календарь МАРС"><div className="marsCalendarSheet"><header><div><span>2026–2027</span><h2>Календарь МАРС</h2></div><button type="button" onClick={()=>setOpen(false)}>×</button></header><div className="marsCalendarMonths">{groups.map(group=><section key={group.key}><h3>{monthTitle(group.key)}</h3><div>{group.items.map((item,i)=><article key={`${item.start}-${i}`}><span>{item.icon}</span><div><b>{item.title}</b><small>{fmt(item)}</small></div></article>)}</div></section>)}</div><footer><p><b>Регулярно:</b> тьюториал — август, январь и июнь; ВР — октябрь–ноябрь и февраль–март; ИР — декабрь и апрель/май; ВСОШ — сентябрь–ноябрь; пробники — по графику Статграда.</p></footer></div></div>}
  <style jsx global>{`
   .marsCalendarPanel h3{margin-bottom:12px}.marsCalendarSummary{display:grid;gap:10px}.marsCalendarSummary article{padding:12px;border-radius:15px;border:1px solid #ece4f2;background:#faf7ff}.marsCalendarSummary article.isCurrent{background:#f2faf5;border-color:#cce7d4}.marsCalendarSummary article.isNext{background:#fff8ed;border-color:#f0d7a8}.marsCalendarSummary article.isQuiet{background:#faf8fc}.marsEventBadge{display:inline-flex;margin-bottom:8px;padding:4px 7px;border-radius:999px;background:#fff;color:#6432b4;font-size:9px;font-weight:900;letter-spacing:.09em;text-transform:uppercase}.marsEventRow{display:flex;gap:10px;align-items:flex-start}.marsEventRow i{font-style:normal;font-size:22px}.marsEventRow>div{display:grid;gap:3px}.marsEventRow b{font-size:13px;color:#49345f}.marsEventRow small{color:#80758b}.marsCalendarSummary p{margin:0;color:#756d7d;font-size:13px;line-height:1.4}.marsOpenCalendar{width:100%;margin-top:12px;border:0;border-radius:12px;padding:11px;background:#5e2abb;color:#fff;font-weight:900;cursor:pointer}
   .marsCalendarModal{position:fixed;inset:0;z-index:2000;display:grid;place-items:center;padding:24px;background:#24172fba;backdrop-filter:blur(8px)}.marsCalendarSheet{width:min(1100px,96vw);max-height:92vh;overflow:auto;border-radius:28px;background:#f8f5fb;box-shadow:0 30px 100px #0006}.marsCalendarSheet>header{position:sticky;top:0;z-index:2;display:flex;justify-content:space-between;align-items:center;padding:24px 28px;background:#fff;border-bottom:1px solid #e9e1ef}.marsCalendarSheet header span{font-size:11px;letter-spacing:.15em;color:#7a4fbd;font-weight:900}.marsCalendarSheet h2{margin:4px 0 0;font-size:32px;color:#432172}.marsCalendarSheet header button{width:42px;height:42px;border:0;border-radius:50%;font-size:28px;background:#eee7f8;color:#5b2aac;cursor:pointer}.marsCalendarMonths{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;padding:24px}.marsCalendarMonths>section{padding:20px;border-radius:22px;background:#fff;border:1px solid #ece4f2}.marsCalendarMonths h3{margin:0 0 13px;text-transform:capitalize;color:#5a2ca7}.marsCalendarMonths section>div{display:grid;gap:9px}.marsCalendarMonths article{display:flex;gap:11px;padding:10px;border-radius:14px;background:#faf8fc}.marsCalendarMonths article>span{font-size:20px}.marsCalendarMonths article div{display:grid;gap:3px}.marsCalendarMonths b{font-size:13px;color:#44364d}.marsCalendarMonths small{color:#80758b}.marsCalendarSheet footer{padding:0 24px 24px}.marsCalendarSheet footer p{margin:0;padding:16px;border-radius:16px;background:#fff1ea;color:#6b473e;line-height:1.45}
   @media(max-width:760px){.marsCalendarModal{padding:10px}.marsCalendarMonths{grid-template-columns:1fr;padding:14px}.marsCalendarSheet>header{padding:18px}.marsCalendarSheet h2{font-size:25px}}
  `}</style>
 </>;
}
