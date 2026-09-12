"use client";

import {useEffect,useState} from "react";

export function usePlannerPageAccess(
  page:number,
  cabinet:"middle"|"senior",
  enabled=true
){
  const[checked,setChecked]=useState(false);
  const[allowed,setAllowed]=useState(false);

  useEffect(()=>{
    setChecked(false);
    setAllowed(false);

    if(!enabled){
      setAllowed(true);
      setChecked(true);
      return;
    }

    let cancelled=false;

    fetch("/api/student/access",{
      credentials:"include",
      cache:"no-store"
    })
      .then(async response=>{
        if(response.status===401){
          window.location.href="/";
          return null;
        }

        const data=await response.json();

        if(!response.ok||!data.ok){
          throw new Error(data.error||"Ошибка проверки доступа");
        }

        if(cancelled)return null;

        const expectedType=cabinet==="senior"?"senior":"middle";

        if(data.plannerType!==expectedType){
          window.location.href=data.plannerType==="senior"?"/senior":"/student";
          return null;
        }

        const pages=Array.isArray(data.allowedPages)
          ?data.allowedPages.map(Number)
          :[];

        console.log("ACCESS DEBUG",{
          requestedPage:page,
          cabinet,
          enabled,
          studentId:data.studentId,
          plannerType:data.plannerType,
          allowedPages:pages,
          isAllowed:pages.includes(page)
        });

        if(!pages.includes(page)){
          window.location.href=cabinet==="senior"?"/senior":"/student";
          return null;
        }

        setAllowed(true);
        setChecked(true);
        return null;
      })
      .catch(error=>{
        console.error("Planner page access error:",error);

        if(!cancelled){
          window.location.href=cabinet==="senior"?"/senior":"/student";
        }
      });

    return()=>{cancelled=true};
  },[page,cabinet,enabled]);

  return {accessChecked:checked,hasPageAccess:allowed};
}
