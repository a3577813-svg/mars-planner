"use client";

import {useEffect} from "react";

const SHARED_PATHS=new Set([
  "/book","/book-next","/book-next2","/book-next3","/book-next4",
  "/book-next5","/book-next6","/book-next7","/book-next8"
]);

export default function SeniorSpreadCountEnhancer(){
  useEffect(()=>{
    const enhance=()=>{
      const params=new URLSearchParams(location.search);
      if(params.get("senior")!=="1"||!SHARED_PATHS.has(location.pathname))return;

      const page=Math.min(28,Math.max(1,Number(params.get("page")||1)));
      localStorage.setItem("mars-senior-current-page",String(page));

      const brandSub=document.querySelector<HTMLElement>("header .brand span");
      if(brandSub)brandSub.textContent="8–11 уровни";

      const metaFirst=document.querySelector<HTMLElement>("header .meta span:first-child");
      if(metaFirst)metaFirst.textContent=`Разворот ${page} из 45`;

      const routeLink=document.querySelector<HTMLAnchorElement>("header>a");
      if(routeLink){
        routeLink.href="/senior";
        routeLink.textContent="← К моему маршруту";
      }

      const footer=document.querySelector("footer");
      const center=footer?.querySelector<HTMLElement>("span");
      if(center)center.textContent=`${page} / 45`;
    };

    enhance();
    const observer=new MutationObserver(()=>requestAnimationFrame(enhance));
    observer.observe(document.body,{childList:true,subtree:true,characterData:true});
    window.addEventListener("popstate",enhance);
    return()=>{observer.disconnect();window.removeEventListener("popstate",enhance)};
  },[]);
  return null;
}
