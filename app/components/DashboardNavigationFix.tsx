"use client";

import {useEffect} from "react";

export default function DashboardNavigationFix(){
  useEffect(()=>{
    const onClick=(event:MouseEvent)=>{
      if(location.pathname!=="/senior")return;
      const links=Array.from(document.querySelectorAll<HTMLAnchorElement>("main.senior a[href]"));
      const link=links.find(a=>{const r=a.getBoundingClientRect();return event.clientX>=r.left&&event.clientX<=r.right&&event.clientY>=r.top&&event.clientY<=r.bottom;});
      if(!link)return;
      const href=link.getAttribute("href");
      if(!href||href.startsWith("#"))return;
      window.location.href=href;
    };

    window.addEventListener("click",onClick,true);
    return()=>window.removeEventListener("click",onClick,true);
  },[]);

  return <style jsx global>{`
    main.studentCabinet .routeList a,
    main.senior .list a,
    main.studentCabinet a.primary,
    main.senior a.primary,
    main.studentCabinet .panel a,
    main.senior .panel a{position:relative!important;z-index:5!important;pointer-events:auto!important;cursor:pointer!important}
    main.studentCabinet .routeCard,
    main.senior .routeCard,
    main.studentCabinet aside,
    main.senior aside{position:relative;z-index:2}
  `}</style>;
}
