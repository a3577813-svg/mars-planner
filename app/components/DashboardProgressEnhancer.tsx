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
      if((isSenior&&key.includes(seniorNeedle))||(!isSenior&&key.includes(middleNeedle)))values.push(value);
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

function attachmentCount(isSenior:boolean){
  const audience=isSenior?"senior-":"middle-";
  let count=0;
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i)||"";
    if(!key.startsWith("mars-planner-attachment:"))continue;
    if(!key.includes(audience)||!key.endsWith(":image"))continue;
    if((localStorage.getItem(key)||"").trim())count++;
  }
  return count;
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
      const inProgress=Math.max(0,started-done);
      const notStarted=Math.max(0,total-started);
      const attachments=attachmentCount(isSenior);
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
        panel.innerHTML=`<p class="eyebrow">МОЙ ПРОГРЕСС</p><div class="dashboardProgressTop"><div><h3>${percent}%</h3><small>планёрки заполнено</small></div><b>${done} из ${total}</b></div><div class="dashboardProgressTrack"><span style="width:${percent}%"></span></div><div class="dashboardProgressStats"><div><span>✓</span><b>${done}</b><small>заполнено</small></div><div><span>◐</span><b>${inProgress}</b><small>в процессе</small></div><div><span>○</span><b>${notStarted}</b><small>не начато</small></div><div><span>▧</span><b>${attachments}</b><small>фото и рисунки</small></div></div>`;
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
    .dashboardProgressTop{display:flex!important;align-items:flex-end!important;justify-content:space-between!important;gap:16px!important;margin-bottom:12px!important}
    .dashboardProgressTop h3{margin:0!important;font-size:34px!important;line-height:1!important}
    .dashboardProgressTop small{display:block!important;margin-top:4px!important;color:#756d7d!important}
    .dashboardProgressTop>b{padding:7px 10px;border-radius:999px;background:#fff;color:#5b2aac;font-size:12px}
    .dashboardProgressTrack{height:11px;border-radius:999px;background:#e8e0ef;overflow:hidden}
    .dashboardProgressTrack span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#5e2abb,#ff6547);transition:width .3s ease}
    .dashboardProgressStats{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important;margin-top:13px!important}
    .dashboardProgressStats>div{display:grid!important;grid-template-columns:auto 1fr!important;grid-template-rows:auto auto!important;column-gap:8px!important;padding:10px!important;border-radius:14px!important;background:#ffffffc7!important;border:1px solid #ebe2f2!important}
    .dashboardProgressStats span{grid-row:1/3;width:26px;height:26px;display:grid;place-items:center;border-radius:9px;background:#f1eafa;color:#6132b7;font-weight:900}
    .dashboardProgressStats b{font-size:17px;color:#41236d;line-height:1}
    .dashboardProgressStats small{font-size:10px;color:#7e7488;line-height:1.2}
  `}</style>;
}
