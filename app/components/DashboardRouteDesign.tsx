"use client";

import {useEffect} from "react";

type Stage={label:string;start:string;end?:string;icon:string;type:"study"|"project"|"break"|"partner"|"event"};

const stages:Stage[]=[
 {label:"Праздник",start:"2026-09-01",icon:"🎉",type:"event"},
 {label:"Запускной интенсив",start:"2026-09-02",end:"2026-09-08",icon:"🚀",type:"project"},
 {label:"Биосмена",start:"2026-09-09",end:"2026-09-20",icon:"🌿",type:"study"},
 {label:"Академический трек",start:"2026-09-09",end:"2026-10-02",icon:"📚",type:"study"},
 {label:"МАРСФЕСТ",start:"2026-10-05",end:"2026-10-09",icon:"🎭",type:"project"},
 {label:"Каникулы",start:"2026-10-12",end:"2026-10-16",icon:"🍂",type:"break"},
 {label:"Встреча команд",start:"2026-10-14",icon:"👥",type:"partner"},
 {label:"Родительское собрание",start:"2026-10-15",icon:"👨‍👩‍👧",type:"partner"},
 {label:"Академический трек",start:"2026-10-19",end:"2026-10-30",icon:"📚",type:"study"},
 {label:"Академический трек",start:"2026-11-02",end:"2026-11-20",icon:"📚",type:"study"},
 {label:"День Карьеры",start:"2026-11-05",end:"2026-11-06",icon:"🎓",type:"partner"},
 {label:"Родительский День Партнера",start:"2026-11-18",end:"2026-11-20",icon:"🤝",type:"partner"},
 {label:"Каникулы",start:"2026-11-23",end:"2026-11-27",icon:"🍂",type:"break"},
 {label:"День Партнера с предпринимателями",start:"2026-11-27",icon:"🤝",type:"partner"},
 {label:"Академический трек",start:"2026-11-30",end:"2026-12-23",icon:"📚",type:"study"},
 {label:"Интенсив по реализации проекта",start:"2026-12-14",end:"2026-12-15",icon:"🚀",type:"project"},
 {label:"Итоговая проектная конференция",start:"2026-12-24",icon:"🎤",type:"project"},
 {label:"Историческая игра",start:"2026-12-25",end:"2026-12-27",icon:"🏛️",type:"event"},
 {label:"Каникулы",start:"2026-12-28",end:"2027-01-10",icon:"❄️",type:"break"},
 {label:"Запускной интенсив",start:"2027-01-11",end:"2027-01-15",icon:"🚀",type:"project"},
 {label:"Академический трек",start:"2027-01-18",end:"2027-01-29",icon:"📚",type:"study"},
 {label:"Спектакль по Чехову",start:"2027-01-25",icon:"🎭",type:"event"},
 {label:"Академический трек",start:"2027-02-01",end:"2027-02-12",icon:"📚",type:"study"},
 {label:"МАРСФЕСТ",start:"2027-02-15",end:"2027-02-19",icon:"🎭",type:"project"},
 {label:"Каникулы",start:"2027-02-22",end:"2027-02-26",icon:"❄️",type:"break"},
 {label:"Встреча команд",start:"2027-02-25",icon:"👥",type:"partner"},
 {label:"Академический трек",start:"2027-03-01",end:"2027-03-31",icon:"📚",type:"study"},
 {label:"День Карьеры",start:"2027-03-09",end:"2027-03-10",icon:"🎓",type:"partner"},
 {label:"Родительский День Партнера",start:"2027-03-31",end:"2027-04-02",icon:"🤝",type:"partner"},
 {label:"Каникулы",start:"2027-04-05",end:"2027-04-09",icon:"🌱",type:"break"},
 {label:"День Партнера с предпринимателями",start:"2027-04-08",icon:"🤝",type:"partner"},
 {label:"Академический трек",start:"2027-04-12",end:"2027-04-23",icon:"📚",type:"study"},
 {label:"Биосмена / академический трек",start:"2027-04-26",end:"2027-05-09",icon:"🌿",type:"study"},
 {label:"Академический трек / аттестация",start:"2027-05-11",end:"2027-05-14",icon:"📝",type:"study"},
 {label:"Интенсив по реализации проектов",start:"2027-05-17",end:"2027-05-18",icon:"🚀",type:"project"},
 {label:"Уличный спектакль по Чехову",start:"2027-05-21",icon:"🎭",type:"event"},
 {label:"Итоговая проектная конференция",start:"2027-05-25",icon:"🎤",type:"project"},
 {label:"Последний звонок",start:"2027-05-26",icon:"🔔",type:"event"},
 {label:"Историческая игра",start:"2027-05-27",end:"2027-05-29",icon:"🏛️",type:"event"},
 {label:"Образовательные смены",start:"2027-06-01",end:"2027-06-25",icon:"☀️",type:"study"},
 {label:"Контест",start:"2027-06-12",icon:"🏆",type:"event"}
];

const parse=(value:string)=>new Date(`${value}T00:00:00`).getTime();
const format=(stage:Stage)=>{const f=(value:string)=>new Date(`${value}T00:00:00`).toLocaleDateString("ru-RU",{day:"2-digit",month:"short"});return stage.end?`${f(stage.start)}–${f(stage.end)}`:f(stage.start)};

export default function DashboardRouteDesign(){
 useEffect(()=>{
  const apply=()=>{
   const isSenior=location.pathname==="/senior";
   const isJunior=location.pathname==="/student";
   if(!isSenior&&!isJunior)return;
   const root=document.querySelector<HTMLElement>(isSenior?"main.senior":"main.studentCabinet");
   const hero=root?.querySelector<HTMLElement>(".hero");
   if(!root||!hero)return;

   if(!root.querySelector(".marsYearRoute")){
    const now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime();
    let currentIndex=stages.findIndex(stage=>parse(stage.start)<=today&&parse(stage.end||stage.start)>=today);
    if(currentIndex<0){currentIndex=stages.findIndex(stage=>parse(stage.start)>today);if(currentIndex<0)currentIndex=stages.length-1}
    const route=document.createElement("section");
    route.className="marsYearRoute";
    route.innerHTML=`<div class="marsYearRouteHead"><div><p>МАРШРУТ УЧЕБНОГО ГОДА</p><h2>Все события 2026–2027</h2></div><span>Прокручивай →</span></div><div class="marsYearRouteViewport"><div class="marsYearRouteStages">${stages.map((stage,index)=>`<article class="${index<currentIndex?"past":index===currentIndex?"current":"future"}" data-route-index="${index}" data-route-type="${stage.type}"><div class="marsRouteDot"></div><span>${stage.icon}</span><b>${stage.label}</b><small>${format(stage)}</small>${index===currentIndex?"<em>Ты здесь</em>":""}</article>`).join("")}</div></div><div class="marsRouteLegend"><span data-route-type="study">Учебные периоды</span><span data-route-type="project">Проектные события</span><span data-route-type="partner">Встречи и партнёры</span><span data-route-type="break">Каникулы</span><span data-route-type="event">Другие события</span></div>`;
    hero.insertAdjacentElement("afterend",route);
    requestAnimationFrame(()=>route.querySelector<HTMLElement>(`[data-route-index="${currentIndex}"]`)?.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"}));
   }

   const title=root.querySelector<HTMLElement>(isSenior?".sectionTitle h2":".cardTitle h2");
   if(title&&title.textContent?.trim()==="Мой маршрут")title.textContent="Мои развороты";
   Array.from(root.querySelectorAll<HTMLAnchorElement>(isSenior?".list>a":".routeList>a")).forEach(link=>{
    if(link.querySelector(".marsCardIcon"))return;
    const number=Number((link.querySelector(isSenior?":scope>b":".num")?.textContent||"0").trim());
    const icon=number<=5?"✦":number<=13?"🧭":number<=21?"🚀":number<=28?"💬":number<=36?"🛠":number<=43?"🎤":"🏛";
    const iconNode=document.createElement("span");iconNode.className="marsCardIcon";iconNode.textContent=icon;
    const text=link.querySelector("div");if(text)link.insertBefore(iconNode,text);
   });
  };

  apply();
  const observer=new MutationObserver(()=>requestAnimationFrame(apply));observer.observe(document.body,{childList:true,subtree:true});
  return()=>observer.disconnect();
 },[]);

 return <style jsx global>{`
  .marsYearRoute{max-width:1256px;margin:0 auto 24px;padding:24px 28px;border:1px solid #e8e0ef;border-radius:28px;background:#fff;box-shadow:0 18px 48px #3b2a5510;overflow:hidden}
  .studentCabinet .wrap>.marsYearRoute{max-width:none;margin:24px 0 0}
  .marsYearRouteHead{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:18px}.marsYearRouteHead p{margin:0 0 5px;font-size:10px;letter-spacing:.15em;font-weight:900;color:#7a4fbd}.marsYearRouteHead h2{margin:0;font-size:25px;color:#3f245f}.marsYearRouteHead>span{padding:7px 11px;border-radius:999px;background:#f2ecfa;color:#6a3ab7;font-size:12px;font-weight:900}
  .marsYearRouteViewport{overflow-x:auto;padding:12px 4px 18px;scroll-snap-type:x proximity;scrollbar-width:thin;scrollbar-color:#cdb9e8 #f2edf6}.marsYearRouteStages{position:relative;display:flex;gap:14px;width:max-content;padding:20px 10px 0}.marsYearRouteStages:before{content:"";position:absolute;left:14px;right:14px;top:30px;height:4px;border-radius:999px;background:#ebe5f0}.marsYearRouteStages article{position:relative;width:168px;min-height:142px;padding:30px 14px 13px;border:1px solid #ece5f2;border-radius:18px;background:#fcfbfd;display:grid;align-content:start;gap:5px;scroll-snap-align:center}.marsRouteDot{position:absolute;top:21px;left:50%;width:16px;height:16px;transform:translateX(-50%);border:4px solid #fff;border-radius:50%;background:#cfc5d7;box-shadow:0 0 0 2px #d9cfdf}.marsYearRouteStages article>span{margin-top:7px;font-size:22px}.marsYearRouteStages article b{font-size:13px;line-height:1.25;color:#49385a}.marsYearRouteStages article small{font-size:11px;color:#83788d}.marsYearRouteStages article em{margin-top:4px;width:max-content;padding:4px 7px;border-radius:999px;background:#fff0ea;color:#d84d31;font-size:10px;font-style:normal;font-weight:900}.marsYearRouteStages article.past{opacity:.58}.marsYearRouteStages article.current{border-color:#ffbda9;background:#fff7f3;box-shadow:0 12px 28px #ff68471a}.marsYearRouteStages article.current .marsRouteDot{background:#ff6547;box-shadow:0 0 0 4px #ff65472a}.marsYearRouteStages article[data-route-type="study"]{border-top:4px solid #6c6be8}.marsYearRouteStages article[data-route-type="project"]{border-top:4px solid #9a4ed0}.marsYearRouteStages article[data-route-type="partner"]{border-top:4px solid #52a86d}.marsYearRouteStages article[data-route-type="break"]{border-top:4px solid #ef9a45}.marsYearRouteStages article[data-route-type="event"]{border-top:4px solid #ea6b62}
  .marsRouteLegend{display:flex;flex-wrap:wrap;gap:8px 14px;margin-top:5px;font-size:10px;color:#73687c}.marsRouteLegend span:before{content:"";display:inline-block;width:8px;height:8px;margin-right:6px;border-radius:50%}.marsRouteLegend [data-route-type="study"]:before{background:#6c6be8}.marsRouteLegend [data-route-type="project"]:before{background:#9a4ed0}.marsRouteLegend [data-route-type="partner"]:before{background:#52a86d}.marsRouteLegend [data-route-type="break"]:before{background:#ef9a45}.marsRouteLegend [data-route-type="event"]:before{background:#ea6b62}
  .marsCardIcon{width:34px;height:34px;flex:0 0 34px;display:grid;place-items:center;border-radius:11px;background:#f7f2fb;font-size:16px}.routeList a,.list>a{transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}.routeList a:hover,.list>a:hover{transform:translateY(-2px);border-color:#cdb8e5!important;box-shadow:0 10px 24px #4f356914}.routeList a.current .marsCardIcon,.list>a.current .marsCardIcon{background:#ffe9e1}.routeList a.done .marsCardIcon,.list>a.done .marsCardIcon{background:#eaf7ee}
  @media(max-width:900px){.marsYearRoute{margin-left:20px;margin-right:20px}.studentCabinet .wrap>.marsYearRoute{margin-left:0;margin-right:0}}
  @media(max-width:650px){.marsYearRoute{margin-left:14px;margin-right:14px;padding:20px 16px}.studentCabinet .wrap>.marsYearRoute{margin-left:0;margin-right:0}.marsYearRouteHead h2{font-size:22px}.marsYearRouteHead>span{display:none}.marsYearRouteStages article{width:150px}.marsCardIcon{display:none}}
 `}</style>;
}
