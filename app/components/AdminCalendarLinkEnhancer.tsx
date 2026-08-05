"use client";

import {useEffect} from "react";

export default function AdminCalendarLinkEnhancer(){
 useEffect(()=>{
  if(location.pathname!=="/admin")return;
  const apply=()=>{
   const cards=Array.from(document.querySelectorAll<HTMLElement>(".adminCards article"));
   const card=cards.find(item=>(item.textContent||"").includes("КАЛЕНДАРЬ"));
   if(!card||card.querySelector("a"))return;
   const link=document.createElement("a");
   link.href="/admin/calendar";
   link.textContent="Редактировать календарь →";
   link.className="adminCalendarLink";
   card.appendChild(link);
  };
  apply();
  const timer=window.setTimeout(apply,200);
  return()=>window.clearTimeout(timer);
 },[]);
 return <style jsx global>{`.adminCalendarLink{display:inline-flex;margin-top:14px;padding:10px 13px;border-radius:11px;background:#5e2abb;color:#fff;text-decoration:none;font-weight:800}.adminCards article:first-child{border-color:#d8c8ef;background:linear-gradient(145deg,#fff,#faf6ff)}`}</style>;
}
