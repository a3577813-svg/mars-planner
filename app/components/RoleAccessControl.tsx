"use client";

import {useEffect} from "react";

type Role="student7"|"student8"|"teacher"|"methodist"|"admin";

const homeFor=(role:Role)=>role==="student7"?"/student":role==="student8"?"/senior":`/${role}`;

function allowed(role:Role,path:string,search:string){
  const params=new URLSearchParams(search);
  const teacherMode=params.get("mode")==="teacher";
  const adminEditMode=params.get("mode")==="admin-edit";
  const senior=params.get("senior")==="1";
  if(path==="/")return true;
  if(role==="admin")return path.startsWith("/admin")||(path.startsWith("/book")&&adminEditMode)||(path.startsWith("/senior/unique")&&adminEditMode);
  if(role==="methodist")return path.startsWith("/methodist");
  if(role==="teacher")return path.startsWith("/teacher")||(path.startsWith("/book")&&teacherMode)||(path.startsWith("/senior/unique")&&teacherMode);
  if(role==="student7")return path==="/student"||(path.startsWith("/book")&&!senior&&!teacherMode&&!adminEditMode);
  if(role==="student8")return path==="/senior"||path.startsWith("/senior/unique")||(path.startsWith("/book")&&senior&&!teacherMode&&!adminEditMode);
  return false;
}

function addMethodistButton(){
  if(location.pathname!=="/")return;
  const switcher=document.querySelector<HTMLElement>(".roleSwitch");
  if(!switcher||switcher.querySelector('[data-methodist-login="1"]'))return;
  const button=document.createElement("button");
  button.type="button";
  button.dataset.methodistLogin="1";
  button.textContent="Методист";
  button.onclick=()=>{
    const form=switcher.parentElement?.querySelector("form");
    const login=form?.querySelector<HTMLInputElement>('input:not([type="password"])');
    const password=form?.querySelector<HTMLInputElement>('input[type="password"]');
    if(login){login.value="methodist";login.dispatchEvent(new Event("input",{bubbles:true}))}
    if(password){password.value="1234";password.dispatchEvent(new Event("input",{bubbles:true}))}
    switcher.querySelectorAll("button").forEach(item=>item.classList.remove("selected"));
    button.classList.add("selected");
  };
  switcher.appendChild(button);
}

export default function RoleAccessControl(){
  useEffect(()=>{
    const guard=()=>{
      addMethodistButton();
      if(location.pathname==="/")return;
      const role=localStorage.getItem("mars-active-account") as Role|null;
      if(!role){location.replace("/");return}
      if(!allowed(role,location.pathname,location.search))location.replace(homeFor(role));
    };

    guard();
    const observer=new MutationObserver(addMethodistButton);
    observer.observe(document.body,{childList:true,subtree:true});
    window.addEventListener("pageshow",addMethodistButton);
    return()=>{
      observer.disconnect();
      window.removeEventListener("pageshow",addMethodistButton);
    };
  },[]);
  return null;
}
