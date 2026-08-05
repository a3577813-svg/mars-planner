"use client";

import {useEffect,useRef,useState} from "react";

export default function PlannerSaveStatus(){
  const[state,setState]=useState<"idle"|"saving"|"saved">("idle");
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const savingRef=useRef(false);

  useEffect(()=>{
    const isPlanner=()=>location.pathname.startsWith("/book")||location.pathname.startsWith("/senior/unique");

    const markSaving=()=>{
      if(!isPlanner())return;
      savingRef.current=true;
      setState("saving");
      if(timer.current)clearTimeout(timer.current);
      timer.current=setTimeout(()=>{
        savingRef.current=false;
        setState("saved");
      },420);
    };

    const onChange=(event:Event)=>{
      const target=event.target as HTMLElement|null;
      if(!target?.matches("input,textarea,select"))return;
      markSaving();
    };

    const onKeyDown=(event:KeyboardEvent)=>{
      if(!isPlanner())return;
      if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="s"){
        event.preventDefault();
        markSaving();
      }
    };

    const onBeforeUnload=(event:BeforeUnloadEvent)=>{
      if(!savingRef.current)return;
      event.preventDefault();
      event.returnValue="";
    };

    document.addEventListener("input",onChange,true);
    document.addEventListener("change",onChange,true);
    document.addEventListener("keydown",onKeyDown,true);
    window.addEventListener("beforeunload",onBeforeUnload);

    return()=>{
      document.removeEventListener("input",onChange,true);
      document.removeEventListener("change",onChange,true);
      document.removeEventListener("keydown",onKeyDown,true);
      window.removeEventListener("beforeunload",onBeforeUnload);
      if(timer.current)clearTimeout(timer.current);
    };
  },[]);

  if(state==="idle")return null;
  return <div className={`plannerSaveStatus ${state}`} role="status" aria-live="polite">
    {state==="saving"?"💾 Сохранение…":"✓ Все изменения сохранены"}
    <style jsx global>{`
      .plannerSaveStatus{position:fixed;right:18px;bottom:18px;z-index:1200;padding:10px 14px;border-radius:999px;font:800 12px/1 Inter,Arial,sans-serif;box-shadow:0 10px 30px #30243e2b;transition:.2s ease}
      .plannerSaveStatus.saving{background:#fff4df;color:#8a5c10;border:1px solid #efd39a}
      .plannerSaveStatus.saved{background:#eaf7ee;color:#2f7447;border:1px solid #bfe1c9}
      @media(max-width:650px){.plannerSaveStatus{right:10px;bottom:10px;font-size:11px;padding:9px 11px}}
      @media print{.plannerSaveStatus{display:none!important}}
    `}</style>
  </div>;
}
