"use client";

import {useEffect} from "react";

type Assignment={week?:string;start?:string;end?:string;visible?:boolean};
type AssignmentStore=Record<string,Assignment>;
type Audience="middle"|"senior";

function readStore():AssignmentStore{
  try{return JSON.parse(localStorage.getItem("mars-spread-assignments")||"{}")||{}}catch{return{}}
}
function parseDate(value?:string,end=false){
  if(!value)return null;
  const date=new Date(`${value}T${end?"23:59:59":"00:00:00"}`);
  return Number.isNaN(date.getTime())?null:date;
}
function labelFor(item:Assignment,today:Date){
  const start=parseDate(item.start),end=parseDate(item.end,true);
  if(item.visible===false)return"Скрыт";
  if(start&&today<start)return item.week?`${item.week} · откроется позже`:"Откроется позже";
  if(start&&end&&today>=start&&today<=end)return item.week?`${item.week} · на этой неделе`:"На этой неделе";
  if(end&&today>end)return item.week?`${item.week} · уже доступен`:"Уже доступен";
  if(item.week)return item.week;
  return"Доступен";
}
function isCurrent(item:Assignment,today:Date){
  const start=parseDate(item.start),end=parseDate(item.end,true);
  return item.visible!==false&&!!start&&!!end&&today>=start&&today<=end;
}
function isFuture(item:Assignment,today:Date){
  const start=parseDate(item.start);
  return item.visible!==false&&!!start&&today<start;
}
function hrefPage(path:string,search:string,audience:Audience){
  const params=new URLSearchParams(search);
  const raw=Number(params.get("page")||"1")||1;
  if(audience==="senior"&&path.startsWith("/book")){
    if(raw===37)return 44;
    if(raw===38)return 45;
  }
  return raw;
}

export default function StudentAssignmentEnhancer(){
  useEffect(()=>{
    const today=new Date();
    const role=localStorage.getItem("mars-active-account");
    const dashboardAudience:Audience|null=location.pathname==="/student"?"middle":location.pathname==="/senior"?"senior":null;
    const store=readStore();

    if(dashboardAudience){
      const root=document.querySelector<HTMLElement>(dashboardAudience==="middle"?"main.studentCabinet":"main.senior");
      if(!root)return;
      const links=Array.from(root.querySelectorAll<HTMLAnchorElement>(dashboardAudience==="middle"?".routeList>a":".list>a"));
      const openLinks:HTMLAnchorElement[]=[];
      const currentLinks:HTMLAnchorElement[]=[];
      links.forEach((link,index)=>{
        const n=index+1;
        const assignment=store[`${dashboardAudience}:${n}`]||{};
        const small=link.querySelector<HTMLElement>("small");
        if(small)small.textContent=labelFor(assignment,today);
        link.dataset.assignmentPage=String(n);
        link.classList.toggle("weekCurrent",isCurrent(assignment,today));
        link.classList.toggle("weekFuture",isFuture(assignment,today));
        if(assignment.visible===false){
          link.classList.add("adminHidden");
          link.setAttribute("aria-disabled","true");
          link.tabIndex=-1;
          link.addEventListener("click",event=>{event.preventDefault();event.stopImmediatePropagation()},true);
        }else{
          openLinks.push(link);
          if(isCurrent(assignment,today))currentLinks.push(link);
        }
      });

      const target=currentLinks[0]??openLinks[0];
      if(target){
        const primary=root.querySelector<HTMLAnchorElement>(".hero a.primary");
        const focus=root.querySelector<HTMLAnchorElement>("aside .accent a");
        [primary,focus].forEach(link=>{if(link)link.href=target.href});
        const n=Number(target.dataset.assignmentPage||1);
        const title=target.querySelector<HTMLElement>(dashboardAudience==="middle"?"b":"strong")?.textContent||"";
        const progressStrong=root.querySelector<HTMLElement>(".progress .ring strong");
        const progressSmall=root.querySelector<HTMLElement>(".progress>small");
        const focusTitle=root.querySelector<HTMLElement>("aside .accent h3");
        const focusText=root.querySelector<HTMLElement>(dashboardAudience==="middle"?"aside .accent p:not(.eyebrow)":"aside .accent>div");
        if(progressStrong)progressStrong.textContent=String(n);
        if(progressSmall)progressSmall.textContent=title;
        if(focusTitle)focusTitle.textContent=`Разворот ${String(n).padStart(2,"0")}`;
        if(focusText)focusText.textContent=title;
      }
      return;
    }

    if(role!=="student7"&&role!=="student8")return;
    const audience:Audience=role==="student8"?"senior":"middle";
    const plannerPath=location.pathname.startsWith("/book")||location.pathname.startsWith("/senior/unique");
    if(!plannerPath)return;
    const n=hrefPage(location.pathname,location.search,audience);
    const assignment=store[`${audience}:${n}`];
    if(assignment?.visible===false){
      location.replace(audience==="senior"?"/senior":"/student");
    }
  },[]);

  return <style jsx global>{`
    .weekCurrent{border-color:#ff9b7f!important;background:#fff3ed!important;box-shadow:0 0 0 2px #ff6b4930!important}
    .weekCurrent small{color:#c94f32!important;font-weight:850!important}
    .weekFuture{opacity:.68!important}
    .weekFuture small{color:#8d8298!important}
    .adminHidden{display:none!important}
  `}</style>;
}
