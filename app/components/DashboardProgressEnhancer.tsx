"use client";

import {useEffect} from "react";

type Status="empty"|"progress"|"done";
type PageStats={count:number;substantial:number};

function emptyStats(total:number){
  return Array.from({length:total+1},():PageStats=>({count:0,substantial:0}));
}

function pageFromKey(key:string,isSenior:boolean){
  if(isSenior){
    const unique=key.match(/^mars-senior-p(\d+)-/);
    if(unique)return Number(unique[1]);
    const shared=key.match(/^mars-senior-shared-p(\d+)-/);
    if(shared)return Number(shared[1]);
  }else{
    const middle=key.match(/^mars-book-p(\d+)-/);
    if(middle)return Number(middle[1]);
  }
  return 0;
}

function attachmentPage(key:string,isSenior:boolean){
  const pattern=isSenior?/mars-planner-attachment:senior-p(\d+)-/:/mars-planner-attachment:middle-p(\d+)-/;
  const match=key.match(pattern);
  return match?Number(match[1]):0;
}

function collectStats(total:number,isSenior:boolean){
  const stats=emptyStats(total);
  let attachments=0;

  // LocalStorage is scanned only once. Image values can be very large, so they
  // are read only for the matching audience and never once per planner page.
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i)||"";
    const attachment=attachmentPage(key,isSenior);
    if(attachment){
      if(key.endsWith(":image")){
        const value=localStorage.getItem(key)||"";
        if(value){
          attachments++;
          if(attachment<=total){stats[attachment].count++;stats[attachment].substantial++}
        }
      }else if(key.endsWith(":caption")){
        const value=(localStorage.getItem(key)||"").trim();
        if(value&&attachment<=total){stats[attachment].count++;if(value.length>=18)stats[attachment].substantial++}
      }
      continue;
    }

    const page=pageFromKey(key,isSenior);
    if(!page||page>total)continue;
    const value=(localStorage.getItem(key)||"").trim();
    if(!value)continue;
    stats[page].count++;
    if(value.length>=18)stats[page].substantial++;
  }

  // Senior pages 44 and 45 use shared templates 37 and 38.
  if(isSenior){
    stats[44]={...stats[37]};
    stats[45]={...stats[38]};
  }
  return{stats,attachments};
}

function statusFor(stat:PageStats):Status{
  if(stat.count===0)return"empty";
  if(stat.count>=3||stat.substantial>=2)return"done";
  return"progress";
}

function statusLabel(status:Status){
  if(status==="done")return"Заполнено";
  if(status==="progress")return"В процессе";
  return"Не начато";
}

export default function DashboardProgressEnhancer(){
  useEffect(()=>{
    let frame=0;
    let timer=0;

    const enhance=()=>{
      const isSenior=location.pathname==="/senior";
      const isJunior=location.pathname==="/student";
      if(!isSenior&&!isJunior)return;

      const total=isSenior?45:38;
      const root=document.querySelector<HTMLElement>(isSenior?"main.senior":"main.studentCabinet");
      if(!root)return;
      const links=Array.from(root.querySelectorAll<HTMLAnchorElement>(isSenior?".list>a":".routeList>a"));
      if(!links.length)return;

      const{stats,attachments}=collectStats(total,isSenior);
      let done=0;
      let started=0;

      links.forEach(link=>{
        const numberElement=link.querySelector<HTMLElement>(isSenior?":scope>b":".num");
        const page=Number(numberElement?.textContent||0);
        if(!page)return;
        const status=statusFor(stats[page]||{count:0,substantial:0});
        if(status==="done")done++;
        if(status!=="empty")started++;
        if(link.dataset.fillStatus!==status)link.dataset.fillStatus=status;
        const small=link.querySelector<HTMLElement>("small");
        const label=statusLabel(status);
        if(small&&small.textContent!==label)small.textContent=label;
      });

      const percent=Math.round(done/total*100);
      const inProgress=Math.max(0,started-done);
      const notStarted=Math.max(0,total-started);
      const primary=root.querySelector<HTMLAnchorElement>("a.primary");
      const currentKey=isSenior?"mars-senior-current-page":"mars-book-current-page";
      const current=Math.min(total,Math.max(1,Number(localStorage.getItem(currentKey)||1)||1));
      const primaryText=`Продолжить с разворота ${current} →`;
      if(primary&&primary.textContent!==primaryText)primary.textContent=primaryText;

      const aside=root.querySelector<HTMLElement>("aside");
      if(!aside)return;
      let panel=aside.querySelector<HTMLElement>("[data-dashboard-progress]");
      if(!panel){
        panel=document.createElement("section");
        panel.className="panel dashboardProgressPanel";
        panel.dataset.dashboardProgress="1";
        aside.appendChild(panel);
      }
      const signature=`${percent}:${done}:${inProgress}:${notStarted}:${attachments}:${total}`;
      if(panel.dataset.signature===signature)return;
      panel.dataset.signature=signature;
      panel.innerHTML=`<p class="eyebrow">МОЙ ПРОГРЕСС</p><div class="dashboardProgressTop"><div><h3>${percent}%</h3><small>планёрки заполнено</small></div><b>${done} из ${total}</b></div><div class="dashboardProgressTrack"><span style="width:${percent}%"></span></div><div class="dashboardProgressStats"><div><span>✓</span><b>${done}</b><small>заполнено</small></div><div><span>◐</span><b>${inProgress}</b><small>в процессе</small></div><div><span>○</span><b>${notStarted}</b><small>не начато</small></div><div><span>▧</span><b>${attachments}</b><small>фото и рисунки</small></div></div>`;
    };

    const schedule=(delay=0)=>{
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
      timer=window.setTimeout(()=>{frame=requestAnimationFrame(enhance)},delay);
    };

    // Let the dashboard render first, then calculate statistics without
    // blocking the initial paint.
    schedule(40);
    const onStorage=()=>schedule(80);
    const onFocus=()=>schedule(20);
    window.addEventListener("storage",onStorage);
    window.addEventListener("focus",onFocus);
    return()=>{
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
      window.removeEventListener("storage",onStorage);
      window.removeEventListener("focus",onFocus);
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
