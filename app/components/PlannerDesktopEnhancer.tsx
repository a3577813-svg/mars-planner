"use client";

import {useEffect} from "react";

export default function PlannerDesktopEnhancer(){
  useEffect(()=>{
    const isPlanner=()=>location.pathname.startsWith("/book")||location.pathname.startsWith("/senior/unique");

    const enhance=()=>{
      if(!isPlanner())return;
      document.querySelectorAll<HTMLTextAreaElement>("textarea").forEach((textarea,index)=>{
        if(textarea.dataset.desktopEnhanced==="1")return;
        textarea.dataset.desktopEnhanced="1";
        const parent=textarea.parentElement;
        if(!parent)return;
        parent.classList.add("expandableField");
        const button=document.createElement("button");
        button.type="button";
        button.className="expandFieldButton";
        button.textContent="⤢ Развернуть";
        button.setAttribute("aria-label",`Развернуть поле ${index+1}`);
        button.addEventListener("click",()=>{
          const open=!parent.classList.contains("fieldFullscreen");
          document.querySelectorAll(".fieldFullscreen").forEach(el=>el.classList.remove("fieldFullscreen"));
          parent.classList.toggle("fieldFullscreen",open);
          document.body.classList.toggle("plannerModalOpen",open);
          button.textContent=open?"× Закрыть":"⤢ Развернуть";
          if(open)setTimeout(()=>textarea.focus(),30);
        });
        parent.insertBefore(button,textarea);
      });
    };

    const onKey=(event:KeyboardEvent)=>{
      if(event.key!=="Escape")return;
      const full=document.querySelector<HTMLElement>(".fieldFullscreen");
      if(!full)return;
      full.classList.remove("fieldFullscreen");
      document.body.classList.remove("plannerModalOpen");
      const button=full.querySelector<HTMLButtonElement>(".expandFieldButton");
      if(button)button.textContent="⤢ Развернуть";
    };

    enhance();
    const observer=new MutationObserver(()=>requestAnimationFrame(enhance));
    observer.observe(document.body,{childList:true,subtree:true});
    document.addEventListener("keydown",onKey);
    return()=>{observer.disconnect();document.removeEventListener("keydown",onKey)};
  },[]);

  return <style jsx global>{`
    .expandableField{position:relative}.expandFieldButton{justify-self:end;border:0;background:transparent;color:#6531b7;font:800 11px Inter,Arial,sans-serif;cursor:pointer;padding:2px 0}.fieldFullscreen{position:fixed!important;inset:24px!important;z-index:1200!important;display:grid!important;grid-template-rows:auto auto 1fr!important;margin:0!important;padding:20px!important;border-radius:20px!important;background:#fff!important;box-shadow:0 25px 90px #1e142b80!important}.fieldFullscreen textarea{height:100%!important;min-height:0!important;padding:15px!important;border:1px solid #d8cfdf!important;border-radius:12px!important;background:#fff!important;font-size:16px!important;line-height:1.65!important}.fieldFullscreen .expandFieldButton{font-size:13px}.plannerModalOpen{overflow:hidden}.plannerModalOpen:before{content:"";position:fixed;inset:0;z-index:1190;background:#241830b3}@media(max-width:650px){.expandFieldButton{font-size:10px}.fieldFullscreen{inset:10px!important;padding:14px!important}}@media print{.expandFieldButton{display:none!important}.fieldFullscreen{position:static!important;box-shadow:none!important}}
  `}</style>;
}
