"use client";

import {useEffect} from "react";

const CUSTOM_OPTION_RE = /(?:^|\s)(свой способ|свой вариант|своя цель|другое|другой вариант|другая роль|новая роль|свой образ)(?:\s|$|:)/i;

function normalize(value:string){return value.replace(/\s+/g," ").trim()}
function keyFor(label:HTMLLabelElement,index:number,text:string){
  return `mars-custom-checkbox:${location.pathname}:${new URLSearchParams(location.search).get("page")||""}:${index}:${normalize(text).slice(0,80)}`;
}

export default function CustomCheckboxFields(){
  useEffect(()=>{
    const enhance=()=>{
      const labels=Array.from(document.querySelectorAll<HTMLLabelElement>("label"));
      labels.forEach((label,index)=>{
        const checkbox=label.querySelector<HTMLInputElement>('input[type="checkbox"]');
        if(!checkbox||label.dataset.customCheckboxEnhanced==="1")return;

        const caption=label.querySelector("span")?.textContent||label.textContent||"";
        const text=normalize(caption);
        if(!CUSTOM_OPTION_RE.test(text))return;

        label.dataset.customCheckboxEnhanced="1";
        label.classList.add("customCheckboxOption");

        const input=document.createElement("input");
        input.type="text";
        input.className="customCheckboxText";
        input.placeholder="Впиши свой вариант";
        input.setAttribute("aria-label",`${text}: свой ответ`);
        const storageKey=keyFor(label,index,text);
        input.value=localStorage.getItem(storageKey)||"";
        input.disabled=!checkbox.checked;

        const sync=()=>{
          input.disabled=!checkbox.checked;
          if(checkbox.checked)requestAnimationFrame(()=>input.focus());
        };
        checkbox.addEventListener("change",sync);
        checkbox.addEventListener("click",()=>requestAnimationFrame(sync));
        input.addEventListener("input",()=>localStorage.setItem(storageKey,input.value));
        input.addEventListener("click",event=>event.stopPropagation());
        input.addEventListener("pointerdown",event=>event.stopPropagation());

        label.appendChild(input);
      });
    };

    enhance();
    const observer=new MutationObserver(()=>requestAnimationFrame(enhance));
    observer.observe(document.body,{childList:true,subtree:true});
    window.addEventListener("popstate",enhance);
    return()=>{observer.disconnect();window.removeEventListener("popstate",enhance)};
  },[]);

  return <style jsx global>{`
    .customCheckboxOption{flex-wrap:wrap!important;align-items:center!important}
    .customCheckboxOption>span{flex:1;min-width:130px}
    .customCheckboxText{flex:1 1 220px;min-width:180px;border:0;border-bottom:1px solid #9d92a8;background:transparent;padding:5px 4px;font:13px/1.3 Inter,Arial,sans-serif;color:#2a2233;outline:none}
    .customCheckboxText:focus{border-bottom-color:#6330b5;box-shadow:0 1px 0 #6330b5}
    .customCheckboxText:disabled{opacity:.45;cursor:not-allowed}
    .compactNote{display:block!important;width:fit-content!important;max-width:min(100%,620px)!important;height:auto!important;min-height:0!important;align-self:start!important;justify-self:start!important;padding:7px 10px!important}
    .compactNote p{margin:3px 0 0!important}
    @media(max-width:650px){.customCheckboxText{flex-basis:100%;margin-left:25px}.compactNote{max-width:100%!important}}
  `}</style>;
}
