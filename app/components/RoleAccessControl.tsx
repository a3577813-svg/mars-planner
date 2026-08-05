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

export default function RoleAccessControl(){
  useEffect(()=>{
    if(location.pathname==="/")return;
    const role=localStorage.getItem("mars-active-account") as Role|null;
    if(!role){location.replace("/");return}
    if(!allowed(role,location.pathname,location.search))location.replace(homeFor(role));
  },[]);
  return null;
}
