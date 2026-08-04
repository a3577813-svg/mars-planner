"use client";

import {useEffect} from "react";

export default function SeniorFinalSpreadEnhancer(){
  useEffect(()=>{
    const enhance=()=>{
      const params=new URLSearchParams(location.search);
      if(location.pathname!=="/book-next9"||params.get("senior")!=="1")return;

      const raw=Number(params.get("page")||37);
      const seniorPage=raw===38?45:44;
      localStorage.setItem("mars-senior-current-page",String(seniorPage));

      const brandSub=document.querySelector<HTMLElement>("header .brand span");
      if(brandSub)brandSub.textContent="8–11 уровни";

      const metaFirst=document.querySelector<HTMLElement>("header .meta span:first-child");
      if(metaFirst)metaFirst.textContent=`Разворот ${seniorPage} из 45`;

      const routeLink=document.querySelector<HTMLAnchorElement>("header>a");
      if(routeLink){routeLink.href="/senior";routeLink.textContent="← К моему маршруту";}

      const footer=document.querySelector("footer");
      if(!footer)return;
      const center=footer.querySelector<HTMLElement>("span");
      if(center)center.textContent=`${seniorPage} / 45`;

      const prev=footer.querySelector<HTMLAnchorElement>("a.button");
      if(prev)prev.href=raw===37?"/senior/unique5?page=43":"/book-next9?page=37&mode=student&senior=1";

      const next=footer.querySelector<HTMLButtonElement>("button");
      if(next){
        const isLast=raw===38;
        next.disabled=isLast;
        next.dataset.seniorFinalNext=isLast?"":"1";
        next.setAttribute("aria-disabled",isLast?"true":"false");
      }
    };

    const onClick=(event:MouseEvent)=>{
      const target=(event.target as HTMLElement|null)?.closest<HTMLButtonElement>('button[data-senior-final-next="1"]');
      if(!target)return;
      event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
      localStorage.setItem("mars-senior-current-page","45");
      location.href="/book-next9?page=38&mode=student&senior=1";
    };

    enhance();
    const observer=new MutationObserver(()=>requestAnimationFrame(enhance));
    observer.observe(document.body,{childList:true,subtree:true});
    document.addEventListener("click",onClick,true);
    window.addEventListener("popstate",enhance);
    return()=>{observer.disconnect();document.removeEventListener("click",onClick,true);window.removeEventListener("popstate",enhance)};
  },[]);
  return null;
}
