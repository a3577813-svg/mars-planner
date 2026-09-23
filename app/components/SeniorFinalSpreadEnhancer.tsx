"use client";

import {useEffect} from "react";
import {seniorReturnHref} from "../lib/senior-planner-map";

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

      // Номер, напечатанный непосредственно на левой странице разворота.
      const spreadNumber=document.querySelector<HTMLElement>("article.page.left .num");
      if(spreadNumber)spreadNumber.textContent=String(seniorPage).padStart(2,"0");

      const routeLink=document.querySelector<HTMLAnchorElement>("header>a");
      if(routeLink){routeLink.href=seniorReturnHref(location.search);routeLink.textContent="← К моему маршруту";}

      const footer=document.querySelector("footer");
      if(!footer)return;
      const center=footer.querySelector<HTMLElement>("span");
      if(center)center.textContent=`${seniorPage} / 45`;

      const prev=footer.querySelector<HTMLAnchorElement>("a.button");
      if(prev){
  if(raw===37){
    const backParams=new URLSearchParams(location.search);
    backParams.set("page","43");
    prev.href=`/senior/unique5?${backParams.toString()}`;
  }else{
    const backParams=new URLSearchParams(location.search);
    backParams.set("page","37");
    backParams.set("senior","1");
    prev.href=`/book-next9?${backParams.toString()}`;
  }
}

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
      const nextParams=new URLSearchParams(location.search);
      nextParams.set("page","38");
      nextParams.set("senior","1");
      location.href=`/book-next9?${nextParams.toString()}`;
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
