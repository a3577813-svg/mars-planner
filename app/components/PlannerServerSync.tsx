"use client";

import {useEffect} from "react";

function shouldSync(key:string){
  if(key==="mars-book-current-page"||key==="mars-senior-current-page")return false;

  return (
    key.startsWith("mars-book-") ||
    key.startsWith("mars-senior-") ||
    key.startsWith("mars-custom-option:")
  );
}

export default function PlannerServerSync(){
  useEffect(()=>{
    const originalSetItem=Storage.prototype.setItem;
    const timers=new Map<string,ReturnType<typeof setTimeout>>();
    let active=true;
    let serverReady=false;
 const params=new URLSearchParams(window.location.search);const teacherMode=params.get("mode")==="teacher";const methodistMode=params.get("mode")==="methodist";const staffReadOnlyMode=teacherMode||methodistMode;const staffStudent=params.get("student")||"";

    Storage.prototype.setItem=function(key:string,value:string){
      originalSetItem.call(this,key,value);

      if(this!==localStorage||!shouldSync(key))return;
 if(staffReadOnlyMode)return;
      if(!serverReady)return;

      const existing=timers.get(key);
      if(existing)clearTimeout(existing);

      const timer=setTimeout(()=>{
        fetch("/api/planner",{
          method:"PUT",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({
            fieldKey:key,
            value
          }),
          keepalive:true
        }).catch(()=>{});

        timers.delete(key);
      },350);

      timers.set(key,timer);
    };

    const loadFromServer=async()=>{
      try{
 const apiUrl=staffReadOnlyMode?"/api/staff/planner?student="+encodeURIComponent(staffStudent):"/api/planner";
 const response=await fetch(apiUrl,{method:"GET",credentials:"include",cache:"no-store"});

        if(!response.ok)return;

        const data=await response.json();
        if(!active||!data.ok||!Array.isArray(data.entries))return;
 if(staffReadOnlyMode){for(let i=localStorage.length-1;i>=0;i--){const key=localStorage.key(i);if(key&&shouldSync(key))localStorage.removeItem(key);}}

        for(const entry of data.entries){
          if(
            typeof entry?.field_key==="string" &&
            typeof entry?.value==="string" &&
            shouldSync(entry.field_key)
          ){
            originalSetItem.call(localStorage,entry.field_key,entry.value);
          }
        }

        serverReady=true;
        window.dispatchEvent(new Event("mars-server-data-loaded"));
      }catch{}
    };

    loadFromServer();

    return()=>{
      active=false;
      Storage.prototype.setItem=originalSetItem;
      timers.forEach(timer=>clearTimeout(timer));
      timers.clear();
    };
  },[]);

  return null;
}
