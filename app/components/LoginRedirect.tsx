"use client";

import {useEffect} from "react";

export default function LoginRedirect(){
  useEffect(()=>{
    const legacyDashboard=(login:string)=>
      login==="student8"?"/senior":
      login==="student7"?"/student":
      login==="teacher"?"/teacher":
      login==="methodist"?"/methodist":
      login==="admin"?"/admin":"";

    const onSubmit=async(event:SubmitEvent)=>{
      if(location.pathname!=="/")return;

      const form=event.target;
      if(!(form instanceof HTMLFormElement))return;

      const loginInput=form.querySelector<HTMLInputElement>('input:not([type="password"])');
      const passwordInput=form.querySelector<HTMLInputElement>('input[type="password"]');
      const login=loginInput?.value.trim()||"";
      const password=passwordInput?.value||"";

      if(login==="admin"){
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        try{
          const response=await fetch("/api/auth/admin-login",{
            method:"POST",
            credentials:"include",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({login,password})
          });

          const data=await response.json();

          if(!response.ok||!data.ok){
            alert(data.error||"Неверный логин или пароль");
            return;
          }

          localStorage.setItem("mars-active-account","admin");
          location.assign("/admin");
        }catch{
          alert("Не удалось связаться с сервером");
        }
        return;
      }

 if(login==="teacher"||login==="methodist"){
 event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
 try{
 const response=await fetch("/api/auth/staff-login",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({login,password})});
 const data=await response.json();
 if(!response.ok||!data.ok){alert(data.error||"Неверный логин или пароль");return;}
 localStorage.setItem("mars-active-account",login);
 location.assign(data.role==="methodist"?"/methodist":"/teacher");
 }catch{alert("Не удалось связаться с сервером");}
 return;
 }
      const legacy=legacyDashboard(login);

      if(legacy&&password==="1234"){
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        localStorage.setItem("mars-active-account",login);
        location.assign(legacy);
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      try{
        const response=await fetch("/api/auth/login",{
          method:"POST",
          credentials:"include",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({studentId:login,password})
        });

        const data=await response.json();

        if(!response.ok||!data.ok){
          alert(data.error||"Неверный ID или пароль");
          return;
        }

        const role=data.plannerType==="senior"?"student8":"student7";
        localStorage.setItem("mars-active-account",role);
        localStorage.setItem("mars-student-id",data.studentId);
        location.assign(data.plannerType==="senior"?"/senior/cabinet-preview":"/student");
      }catch{
        alert("Не удалось связаться с сервером");
      }
    };

    const onClick=(event:MouseEvent)=>{
      const link=(event.target as HTMLElement|null)?.closest<HTMLAnchorElement>('a[href="/"]');
      if(!link)return;
      const text=(link.textContent||"").trim().toLowerCase();
      if(text.includes("выйти")){
        localStorage.removeItem("mars-active-account");
        localStorage.removeItem("mars-student-id");
      }
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
