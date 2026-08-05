"use client";

import {useEffect} from "react";

type Status="empty"|"progress"|"done";

function nonEmptyValuesForPage(page:number,isSenior:boolean){
  const values:string[]=[];
  const sourcePage=isSenior&&page===44?37:isSenior&&page===45?38:page;
  const prefixes=isSenior&&page>=29&&page<=43
    ?[`mars-senior-p${page}-`]
    :[`mars-book-p${sourcePage}-`];

  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i)||"";
    const value=(localStorage.getItem(key)||"").trim();
    if(!value)continue;
    if(prefixes.some(prefix=>key.startsWith(prefix)))values.push(value);
    if(key.startsWith("mars-planner-attachment:")){
      const seniorNeedle=`senior-p${page}-`;
      const middleNeedle=`middle-p${sourcePage}-`;
      if((isSenior&&key.includes(seniorNeedle))||key.includes(middleNeedle))values.push(value);
    }
  }
  return values;
}

function statusFor(page:number,isSenior:boolean):Status{
  const values=nonEmptyValuesForPage(page,isSenior);
  if(values.length===0)return"empty";
  const substantial=values.filter(value=>value.length>=18).length;
  if(values.length>=3||substantial>=2)return"done";
  return"progress";
}

function statusLabel(status:Status){
  if(status==="done")return"Заполнено";
  if(status==="progress")return"В процессе";
  return"Не начато";
}

export default function DashboardProgressEnhancer(){
  useEffect(()=>{
    const enhance=()=>{
      const isSenior=location.pathname==="/senior";
      const isJunior=location.pathname==="/student";
      if(!isSenior&&!isJunior)return;

      const total=isSenior?45:38;
      const root=document.querySelector<HTMLElement>(isSenior?"main.senior":"main.studentCabinet");
      if(!root)return;

      const links=Array.from(root.querySelectorAll<HTMLAnchorElement>(isSenior?".list>a":".routeList>a"));
      let done=0;
      let started=0;

      links.forEach(link=>{
        const numberElement=link.querySelector<HTMLElement>(isSenior?":scope>b":".num");
        const page=Number(numberElement?.textContent||0);
        if(!page)return;
        const status=statusFor(page,isSenior);
        if(status==="done")done++;
        if(status!=="empty")started++;
        link.dataset.fillStatus=status;
        const small=link.querySelector<HTMLElement>("small");
        if(small)small.textContent=statusLabel(status);
      });

      const percent=Math.round(done/total*100);
      const primary=root.querySelector<HTMLAnchorElement>("a.primary");
      const currentKey=isSenior?"mars-senior-current-page":"mars-book-current-page";
      const current=Math.min(total,Math.max(1,Number(localStorage.getItem(currentKey)||1)||1));
      if(primary)primary.textContent=`Продолжить с разворота ${current} →`;

      const aside=root.querySelector<HTMLElement>("aside");
      if(aside){
        let panel=aside.querySelector<HTMLElement>("[data-dashboard-progress]");
        if(!panel){
          panel=document.createElement("section");
          panel.className="panel dashboardProgressPanel";
          panel.dataset.dashboardProgress="1";
          aside.appendChild(panel);
        }
        panel.innerHTML=`<p class="eyebrow">ПРОГРЕСС ПЛАНЁРКИ</p><h3>${done} из ${total}</h3><div class="dashboardProgressTrack"><span style="width:${percent}%"></span></div><div class="dashboardProgressMeta"><b>${percent}% заполнено</b><small>${started-done} в процессе</small></div>`;
      }
    };

    enhance();
    const onStorage=()=>requestAnimationFrame(enhance);
    const onFocus=()=>requestAnimationFrame(enhance);
    window.addEventListener("storage",onStorage);
    window.addEventListener("focus",onFocus);
    document.addEventListener("input",onStorage,true);
    document.addEventListener("change",onStorage,true);
    return()=>{
      window.removeEventListener("storage",onStorage);
      window.removeEventListener("focus",onFocus);
      document.removeEventListener("input",onStorage,true);
      document.removeEventListener("change",onStorage,true);
    };
  },[]);

  return <style jsx global>{`
    [data-fill-status="done"]{background:#f3faf5!important;border-color:#bfe0c7!important}
    [data-fill-status="progress"]{background:#fff8e8!important;border-color:#efd49b!important}
    [data-fill-status="empty"]{background:#fcfbfd!important;border-color:#eee7f3!important}
    [data-fill-status="done"] small{color:#2f7a49!important;font-weight:800}
    [data-fill-status="progress"] small{color:#9a6a08!important;font-weight:800}
    [data-fill-status="empty"] small{color:#8b8294!important}
    .dashboardProgressPanel{background:linear-gradient(145deg,#f4effc,#fff)!important;border-color:#d8c8ef!important}
    .dashboardProgressPanel h3{margin-bottom:12px!important}
    .dashboardProgressTrack{height:11px;border-radius:999px;background:#e8e0ef;overflow:hidden}
    .dashboardProgressTrack span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#5e2abb,#ff6547);transition:width .3s ease}
    .dashboardProgressMeta{display:flex!important;justify-content:space-between;gap:12px;margin-top:9px;color:#6d6375!important;font-size:12px}
    .dashboardProgressMeta b{color:#4d287f}
    .dashboardProgressMeta small{font-size:12px}
  `}</style>;
}
