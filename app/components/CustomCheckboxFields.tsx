"use client";

import {useEffect} from "react";

const CUSTOM_OPTION_RE = /(?:^|\s)(?:свой|своя|своё|свое|свои|другой|другая|другое|другие|иной|иная|иное|иные)(?:\s+(?:вариант|способ|цель|роль|образ|идея|ответ|формат|пункт|варианты))?(?:\s|$|:)/i;

function normalize(value:string){return value.replace(/\s+/g," ").trim()}
function keyFor(label:HTMLLabelElement,index:number,text:string){
  return `mars-custom-option:${location.pathname}:${new URLSearchParams(location.search).get("page")||""}:${index}:${normalize(text).slice(0,80)}`;
}

export default function CustomCheckboxFields(){
  useEffect(()=>{
    const enhanceCustomOptions=()=>{
      const labels=Array.from(document.querySelectorAll<HTMLLabelElement>("label"));
      labels.forEach((label,index)=>{
        const option=label.querySelector<HTMLInputElement>('input[type="checkbox"],input[type="radio"]');
        if(!option||label.dataset.customCheckboxEnhanced==="1")return;

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

        const sync=()=>{
          input.disabled=!option.checked;
          if(option.checked)requestAnimationFrame(()=>input.focus());
        };

        option.addEventListener("change",sync);
        option.addEventListener("click",()=>requestAnimationFrame(sync));
        if(option.type==="radio"&&option.name){
          document.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="${CSS.escape(option.name)}"]`).forEach(radio=>{
            if(radio!==option)radio.addEventListener("change",sync);
          });
        }
        input.addEventListener("input",()=>localStorage.setItem(storageKey,input.value));
        input.addEventListener("click",event=>event.stopPropagation());
        input.addEventListener("pointerdown",event=>event.stopPropagation());

        label.appendChild(input);
        sync();
      });
    };

    const enhanceSpreadTwoScale=()=>{
      const params=new URLSearchParams(location.search);
      if(location.pathname!=="/book"||params.get("page")!=="2")return;

      const scales=Array.from(document.querySelectorAll<HTMLElement>(".scale"));
      if(!scales.length)return;

      const first=scales[0];
      if(!first.previousElementSibling?.classList.contains("scaleColumnHeader")){
        const header=document.createElement("div");
        header.className="scaleColumnHeader";
        header.innerHTML='<span></span><div><b>Пока нет</b><b>Частично да</b><b>Да</b></div>';
        first.parentElement?.insertBefore(header,first);
      }

      const shortLabels=["🤔","🟡","✅"];
      const ariaLabels=["Пока нет","Частично да","Да"];
      scales.forEach(scale=>{
        const optionLabels=Array.from(scale.querySelectorAll<HTMLLabelElement>(".choices label"));
        optionLabels.forEach((label,index)=>{
          const span=label.querySelector("span");
          const input=label.querySelector<HTMLInputElement>('input[type="radio"]');
          if(span&&shortLabels[index])span.textContent=shortLabels[index];
          if(input&&ariaLabels[index])input.setAttribute("aria-label",ariaLabels[index]);
          if(ariaLabels[index])label.title=ariaLabels[index];
        });
      });
    };

    const enhance=()=>{
      enhanceCustomOptions();
      enhanceSpreadTwoScale();
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
    .scaleColumnHeader{display:grid;grid-template-columns:1.25fr 1fr;gap:8px;align-items:end;margin:5px 0 2px}
    .scaleColumnHeader>div{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
    .scaleColumnHeader b{padding:6px 4px;border-radius:7px;background:#f2ecfa;color:#5c2eb3;text-align:center;font-size:11px;line-height:1.15}
    @media(max-width:980px){.scaleColumnHeader{grid-template-columns:1fr}.scaleColumnHeader>span{display:none}}
    @media(max-width:650px){.customCheckboxText{flex-basis:100%;margin-left:25px}.compactNote{max-width:100%!important}.scaleColumnHeader b{font-size:10px;padding:5px 2px}}
  `}</style>;
}
