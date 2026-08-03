"use client";

import {useEffect} from "react";
import {createRoot,Root} from "react-dom/client";
import PlannerAttachment from "./PlannerAttachment";

const roots=new Map<Element,Root>();

export default function PlannerAttachmentEnhancer(){
  useEffect(()=>{
    const enhance=()=>{
      const params=new URLSearchParams(location.search);
      const page=params.get("page");
      if(location.pathname!=="/book-next6"||page!=="30")return;
      const labels=Array.from(document.querySelectorAll<HTMLLabelElement>("label.field"));
      const target=labels.find(label=>(label.querySelector("b")?.textContent||"").includes("Ссылки или фото"));
      if(!target||target.dataset.attachmentEnhanced==="1")return;
      target.dataset.attachmentEnhanced="1";
      const title=target.querySelector("b");
      if(title)title.textContent="👉 Ссылки:";
      const textarea=target.querySelector("textarea");
      if(textarea)textarea.rows=6;
      const mount=document.createElement("div");
      mount.className="attachmentMount";
      target.insertAdjacentElement("afterend",mount);
      const root=createRoot(mount);
      roots.set(mount,root);
      root.render(<PlannerAttachment id="middle-p30-media" title="Фото, скриншот или рисунок проекта"/>);
    };
    enhance();
    const observer=new MutationObserver(()=>requestAnimationFrame(enhance));
    observer.observe(document.body,{childList:true,subtree:true});
    window.addEventListener("popstate",enhance);
    return()=>{observer.disconnect();window.removeEventListener("popstate",enhance);roots.forEach(root=>root.unmount());roots.clear()};
  },[]);
  return null;
}
