"use client";

import {useEffect} from "react";

export default function LoginRedirect(){
  useEffect(()=>{
    if(location.pathname!=="/")return;

    const onSubmit=(event:SubmitEvent)=>{
      const form=event.target;
      if(!(form instanceof HTMLFormElement))return;
      const loginInput=form.querySelector<HTMLInputElement>('input:not([type="password"])');
      const passwordInput=form.querySelector<HTMLInputElement>('input[type="password"]');
      if(loginInput?.value.trim()!=="student7"||passwordInput?.value!=="1234")return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      localStorage.setItem("mars-active-account","student7");
      location.assign("/student");
    };

    document.addEventListener("submit",onSubmit,true);
    return()=>document.removeEventListener("submit",onSubmit,true);
  },[]);

  return null;
}
