"use client";

import {useEffect} from "react";

type Status="empty"|"progress"|"done";

function valuesFor(page:number,isSenior:boolean){
  const values:string[]=[];
  const sourcePage=isSenior&&page===44?37:isSenior&&page===45?38:page;
  const prefixes=isSenior&&page>=29&&page<=43?[`mars-senior-p${page}-`]:[`mars-book-p${sourcePage}-`];
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i)||"";
    const value=(localStorage.getItem(key)||"").trim();
    if(!value)continue;
    if(prefixes.some(prefix=>key.startsWith(prefix)))values.push(value);
    if(key.startsWith("mars-planner-attachment:")){
      const seniorNeedle=`senior-p${page}-`;
      const middleNeedle=`middle-p${sourcePage}-`;
      if((isSenior&&key.includes(seniorNeedle))||(!isSenior&&key.includes(middleNeedle)))values.push(value);
    }
  }
  return values;
}

function statusFor(page:number,isSenior:boolean):Status{
  const values=valuesFor(page,isSenior);
  if(values.length===0)return"empty";
  const substantial=values.filter(value=>value.length>=18).length;
  if(values.length>=3||substantial>=2)return"done";
  return"progress";
}

function missionText(page:number,status:Status){
  if(status==="progress")return{
    eyebrow:"ТВОЯ СЛЕДУЮЩАЯ ТОЧКА",
    title:`Заверши разворот ${page}`,
    text:"Ты уже начал. Вернись к ответам, добавь недостающее и доведи мысль до конца.",
    action:"Продолжить"
  };
  return{
    eyebrow:"ТВОЯ СЛЕДУЮЩАЯ ТОЧКА",
    title:`Открой разворот ${page}`,
    text:"Посмотри, какой вопрос ждёт тебя дальше, и зафиксируй первую мысль — этого достаточно, чтобы начать.",
    action:"Начать"
  };
}

export default function DashboardMission(){
  useEffect(()=>{
    const apply=()=>{
      const isSenior=location.pathname==="/senior";
      const isJunior=location.pathname==="/student";
      if(!isSenior&&!isJunior)return;
      const total=isSenior?45:38;
      const root=document.querySelector<HTMLElement>(isSenior?"main.senior":"main.studentCabinet");
      const aside=root?.querySelector<HTMLElement>("aside");
      if(!root||!aside)return;

      let target=1;
      let targetStatus:Status="empty";
      for(let page=1;page<=total;page++){
        const status=statusFor(page,isSenior);
        if(status!=="done"){target=page;targetStatus=status;break}
        if(page===total){target=total;targetStatus="done"}
      }

      let panel=aside.querySelector<HTMLElement>("[data-dashboard-mission]");
      if(!panel){
        panel=document.createElement("section");
        panel.className="panel dashboardMissionPanel";
        panel.dataset.dashboardMission="1";
        const firstPanel=aside.querySelector(".panel");
        if(firstPanel?.nextSibling)aside.insertBefore(panel,firstPanel.nextSibling);else aside.appendChild(panel);
      }

      if(targetStatus==="done"){
        panel.innerHTML=`<p>МАРШРУТ СОБРАН</p><h3>Все развороты заполнены</h3><div>Можно вернуться к любому этапу, дополнить ответы или выбрать материалы для будущего PDF.</div>`;
        return;
      }

      const mission=missionText(target,targetStatus);
      const link=root.querySelector<HTMLAnchorElement>(isSenior?`.list>a:nth-child(${target})`:`.routeList>a:nth-child(${target})`);
      panel.innerHTML=`<p>${mission.eyebrow}</p><h3>${mission.title}</h3><div>${mission.text}</div><a href="${link?.getAttribute("href")||"#"}" data-mission-page="${target}">${mission.action} →</a>`;
      panel.querySelector("a")?.addEventListener("click",()=>{
        localStorage.setItem(isSenior?"mars-senior-current-page":"mars-book-current-page",String(target));
      });
    };

    apply();
    const refresh=()=>requestAnimationFrame(apply);
    window.addEventListener("focus",refresh);
    window.addEventListener("storage",refresh);
    document.addEventListener("input",refresh,true);
    document.addEventListener("change",refresh,true);
    const observer=new MutationObserver(refresh);
    observer.observe(document.body,{childList:true,subtree:true});
    return()=>{
      window.removeEventListener("focus",refresh);
      window.removeEventListener("storage",refresh);
      document.removeEventListener("input",refresh,true);
      document.removeEventListener("change",refresh,true);
      observer.disconnect();
    };
  },[]);

  return <style jsx global>{`
    .dashboardMissionPanel{background:linear-gradient(145deg,#23183b,#4f2892)!important;border-color:#6f4aaa!important;color:#fff!important}
    .dashboardMissionPanel>p{color:#ffb39b!important}
    .dashboardMissionPanel h3{color:#fff!important}
    .dashboardMissionPanel>div{color:#e8def5!important}
    .dashboardMissionPanel a{background:#ff6547!important;color:#fff!important}
  `}</style>;
}
