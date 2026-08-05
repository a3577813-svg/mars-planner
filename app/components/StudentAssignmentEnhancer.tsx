"use client";

import {useEffect} from "react";
import {assignmentFor,assignmentLabel,assignmentState} from "../lib/plannerAssignments";
import type {PlannerAudience} from "../lib/plannerAssignments";
import {usePlannerAssignments} from "../lib/usePlannerAssignments";

function hrefPage(path:string,search:string,audience:PlannerAudience){
  const params=new URLSearchParams(search);
  const raw=Number(params.get("page")||"1")||1;
  if(audience==="senior"&&path.startsWith("/book")){
    if(raw===37)return 44;
    if(raw===38)return 45;
  }
  return raw;
}

export default function StudentAssignmentEnhancer(){
  const{assignments}=usePlannerAssignments();

  useEffect(()=>{
    const today=new Date();
    const role=localStorage.getItem("mars-active-account");
    const dashboardAudience:PlannerAudience|null=location.pathname==="/student"?"middle":location.pathname==="/senior"?"senior":null;

    if(dashboardAudience){
      const root=document.querySelector<HTMLElement>(dashboardAudience==="middle"?"main.studentCabinet":"main.senior");
      if(!root)return;
      const dashboardLinks=Array.from(root.querySelectorAll<HTMLAnchorElement>(dashboardAudience==="middle"?".routeList>a":".list>a"));

      dashboardLinks.forEach((link,index)=>{
        const page=index+1;
        const assignment=assignmentFor(assignments,dashboardAudience,page);
        const state=assignmentState(assignment,today);
        const small=link.querySelector<HTMLElement>("small");
        if(small)small.textContent=assignmentLabel(assignment,today);
        link.dataset.assignmentPage=String(page);
        link.classList.toggle("weekCurrent",state==="current");
        link.classList.toggle("weekFuture",state==="future");
        link.classList.toggle("adminHidden",state==="hidden");
        link.setAttribute("aria-disabled",state==="hidden"?"true":"false");
        link.tabIndex=state==="hidden"?-1:0;
      });

      const preferred=dashboardLinks.find(link=>link.classList.contains("weekCurrent")&&!link.classList.contains("adminHidden"));
      const firstOpen=dashboardLinks.find(link=>!link.classList.contains("adminHidden"));
      const target=preferred??firstOpen;
      if(target){
        const primary=root.querySelector<HTMLAnchorElement>(".hero a.primary");
        const focus=root.querySelector<HTMLAnchorElement>("aside .accent a");
        const targetHref=target.getAttribute("href");
        if(targetHref){
          [primary,focus].forEach(link=>{if(link)link.setAttribute("href",targetHref)});
        }
        const page=Number(target.dataset.assignmentPage||1);
        const title=target.querySelector<HTMLElement>(dashboardAudience==="middle"?"b":"strong")?.textContent||"";
        const progressStrong=root.querySelector<HTMLElement>(".progress .ring strong");
        const progressSmall=root.querySelector<HTMLElement>(".progress>small");
        const focusTitle=root.querySelector<HTMLElement>("aside .accent h3");
        const focusText=root.querySelector<HTMLElement>(dashboardAudience==="middle"?"aside .accent p:not(.eyebrow)":"aside .accent>div");
        if(progressStrong)progressStrong.textContent=String(page);
        if(progressSmall)progressSmall.textContent=title;
        if(focusTitle)focusTitle.textContent=`Разворот ${String(page).padStart(2,"0")}`;
        if(focusText)focusText.textContent=title;
      }
      return;
    }

    if(role!=="student7"&&role!=="student8")return;
    const audience:PlannerAudience=role==="student8"?"senior":"middle";
    const plannerPath=location.pathname.startsWith("/book")||location.pathname.startsWith("/senior/unique");
    if(!plannerPath)return;
    const page=hrefPage(location.pathname,location.search,audience);
    if(assignmentState(assignmentFor(assignments,audience,page))==="hidden"){
      location.replace(audience==="senior"?"/senior":"/student");
    }
  },[assignments]);

  return <style jsx global>{`
    .weekCurrent{border-color:#ff9b7f!important;background:#fff3ed!important;box-shadow:0 0 0 2px #ff6b4930!important}
    .weekCurrent small{color:#c94f32!important;font-weight:850!important}
    .weekFuture{opacity:.68!important}
    .weekFuture small{color:#8d8298!important}
    .adminHidden{display:none!important}
  `}</style>;
}
