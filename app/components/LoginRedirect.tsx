"use client";

import {useEffect} from "react";

export default function LoginRedirect(){
  useEffect(()=>{
    const dashboardFor=(login:string)=>login==="student8"?"/senior":login==="student7"?"/student":login==="teacher"?"/teacher":login==="methodist"?"/methodist":login==="admin"?"/admin":"";

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
      location.assign(dashboard);
    };

    const onClick=(event:MouseEvent)=>{
      const link=(event.target as HTMLElement|null)?.closest<HTMLAnchorElement>('a[href="/"]');
      if(!link)return;
      const text=(link.textContent||"").trim().toLowerCase();
      if(text.includes("выйти"))localStorage.removeItem("mars-active-account");
    };

    document.addEventListener("submit",onSubmit,true);
    document.addEventListener("click",onClick,true);
    return()=>{
      document.removeEventListener("submit",onSubmit,true);
      document.removeEventListener("click",onClick,true);
    };
  },[]);

  return null;
}
