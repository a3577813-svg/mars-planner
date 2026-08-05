"use client";

import {useEffect} from "react";

export default function DashboardNavigationFix(){
  useEffect(()=>{
    const onClick=(event:MouseEvent)=>{
      const target=event.target as Element|null;
      const link=target?.closest<HTMLAnchorElement>("main.studentCabinet .routeList a,main.senior .list a,main.studentCabinet a.primary,main.senior a.primary,main.studentCabinet .panel a,main.senior .panel a");
      if(!link)return;
      const href=link.getAttribute("href");
      if(!href||href.startsWith("#"))return;
      event.preventDefault();
      event.stopPropagation();
      window.location.assign(href);
    };
    document.addEventListener("click",onClick,true);
    return()=>document.removeEventListener("click",onClick,true);
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
