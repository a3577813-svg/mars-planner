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
      const login=loginInput?.value.trim();
      if(passwordInput?.value!=="1234")return;
      if(login!=="student7"&&login!=="student8")return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      localStorage.setItem("mars-active-account",login);
      location.assign(login==="student8"?"/senior":"/student");
    };

    document.addEventListener("submit",onSubmit,true);
    return()=>document.removeEventListener("submit",onSubmit,true);
  },[]);

  return null;
}
