"use client";

import {useEffect} from "react";

export default function LoginRedirect(){
  useEffect(()=>{
    const dashboardFor=(login:string)=>login==="student8"?"/senior":login==="student7"?"/student":"";

    if(location.pathname==="/"){
      const remembered=localStorage.getItem("mars-active-account")||"";
      const dashboard=dashboardFor(remembered);
      if(dashboard){location.replace(dashboard);return}
    }

    const onSubmit=(event:SubmitEvent)=>{
      if(location.pathname!=="/")return;
      const form=event.target;
      if(!(form instanceof HTMLFormElement))return;
      const loginInput=form.querySelector<HTMLInputElement>('input:not([type="password"])');
      const passwordInput=form.querySelector<HTMLInputElement>('input[type="password"]');
      const login=loginInput?.value.trim()||"";
      const dashboard=dashboardFor(login);
      if(passwordInput?.value!=="1234"||!dashboard)return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      localStorage.setItem("mars-active-account",login);
      location.replace(dashboard);
    };

    const keepCorrectDashboard=()=>{
      if(location.pathname!=="/")return;
      const dashboard=dashboardFor(localStorage.getItem("mars-active-account")||"");
      if(dashboard)location.replace(dashboard);
    };

    document.addEventListener("submit",onSubmit,true);
    window.addEventListener("storage",keepCorrectDashboard);
    const timer=window.setInterval(keepCorrectDashboard,250);
    return()=>{
      document.removeEventListener("submit",onSubmit,true);
      window.removeEventListener("storage",keepCorrectDashboard);
      window.clearInterval(timer);
    };
  },[]);

  return null;
}
