"use client";

import {useEffect} from "react";

export default function AdminSpreadLinkEnhancer(){
 useEffect(()=>{
  if(location.pathname!=="/admin")return;
  const apply=()=>{
   const cards=document.querySelectorAll<HTMLElement>(".adminCards article");
   const card=Array.from(cards).find(x=>(x.textContent||"").includes("ШАБЛОНЫ"));
   if(!card||card.querySelector(".adminSpreadLink"))return !!card;
   const link=document.createElement("a");link.className="adminSpreadLink";link.href="/admin/spreads";link.textContent="Назначить развороты по неделям →";card.appendChild(link);return true;
  };
  if(apply())return;let n=0;const timer=setInterval(()=>{n++;if(apply()||n>20)clearInterval(timer)},100);return()=>clearInterval(timer)
 },[]);
 return <style jsx global>{`.adminSpreadLink{display:inline-block;margin-top:13px;padding:10px 12px;border-radius:11px;background:#5e2abb;color:#fff!important;text-decoration:none;font-weight:900;font-size:12px}`}</style>
}
