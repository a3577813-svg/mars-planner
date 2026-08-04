"use client";

import {useEffect} from "react";
import {createRoot,Root} from "react-dom/client";
import PlannerAttachment from "./PlannerAttachment";

type Rule={
  path:string;
  page:string;
  id:string;
  title:string;
  targetText?:string;
  pageSide?:"left"|"right";
  allowDrawing?:boolean;
  placement?:"after"|"inside";
};

const rules:Rule[]=[
  {path:"/book",page:"1",id:"middle-p1-first-impression",title:"Фото к первой мысли или впечатлению",targetText:"Первая мысль",allowDrawing:false,placement:"inside"},
  {path:"/book",page:"4",id:"middle-p4-quest",title:"Фото с задания-квеста",targetText:"Задание квест",allowDrawing:false},
  {path:"/book",page:"5",id:"middle-p5-memory",title:"Фото на память",pageSide:"right",allowDrawing:false},
  {path:"/book",page:"9",id:"middle-p9-trip-notes",title:"Фото к заметкам о поездке",targetText:"Заметки о поездке",allowDrawing:false},
  {path:"/book-next",page:"13",id:"middle-p13-trip-notes",title:"Фото к заметкам о поездке",targetText:"Заметки о поездке",allowDrawing:false},
  {path:"/book-next",page:"15",id:"middle-p15-marsfest",title:"Фото с МАРСФеста",pageSide:"left",allowDrawing:false},
  {path:"/book-next",page:"15",id:"middle-p15-map",title:"Наглядная карта",targetText:"Нарисуй наглядную карту",allowDrawing:true,placement:"inside"},
  {path:"/book-next2",page:"16",id:"middle-p16-drawing",title:"Место для рисунка",targetText:"Место для рисунка",allowDrawing:true,placement:"inside"},
  {path:"/book-next3",page:"21",id:"middle-p21-project-talk",title:"Фото выступлений с проектом",pageSide:"left",allowDrawing:false},
  {path:"/book-next6",page:"28",id:"middle-p28-free-space",title:"Фото или изображение для свободного пространства",targetText:"Свободное пространство",allowDrawing:true,placement:"inside"},
  {path:"/book-next6",page:"30",id:"middle-p30-project-talks",title:"Фото с выступлений с проектами",pageSide:"left",allowDrawing:false},
  {path:"/book-next8",page:"36",id:"middle-p36-sketches",title:"Скетчи макетов",targetText:"Скетчи макетов",allowDrawing:true,placement:"inside"},
  {path:"/book-next9",page:"38",id:"middle-p38-game-photos",title:"Фотографии с игры",pageSide:"right",allowDrawing:false}
];

const roots=new Map<Element,Root>();

function normalized(value:string){return value.replace(/\s+/g," ").trim().toLowerCase()}

function findTextTarget(text:string){
  const needle=normalized(text);
  const fields=Array.from(document.querySelectorAll<HTMLElement>("label.field,.field,section,div"));
  return fields.find(element=>{
    if(element.dataset.attachmentMountHost==="1")return false;
    const heading=element.querySelector("b,h2,h3")?.textContent||element.textContent||"";
    return normalized(heading).includes(needle);
  })||null;
}

function mountRule(rule:Rule){
  const mountId=`attachment-${rule.id}`;
  if(document.getElementById(mountId))return;

  let host:Element|null=null;
  if(rule.targetText)host=findTextTarget(rule.targetText);
  if(!host&&rule.pageSide)host=document.querySelector(`article.page.${rule.pageSide}`);
  if(!host)return;

  host.setAttribute("data-attachment-mount-host","1");
  const mount=document.createElement("div");
  mount.id=mountId;
  mount.className="attachmentMount";

  if(rule.placement==="inside"){
    const textarea=host.querySelector("textarea");
    if(textarea)textarea.insertAdjacentElement("beforebegin",mount);
    else host.appendChild(mount);
  }else if(rule.targetText){
    host.insertAdjacentElement("afterend",mount);
  }else{
    host.appendChild(mount);
  }

  const root=createRoot(mount);
  roots.set(mount,root);
  root.render(<PlannerAttachment id={rule.id} title={rule.title} allowDrawing={rule.allowDrawing!==false}/>);
}

export default function PlannerAttachmentEnhancer(){
  useEffect(()=>{
    const enhance=()=>{
      const params=new URLSearchParams(location.search);
      if(params.get("senior")==="1")return;
      const page=params.get("page")||"1";
      rules.filter(rule=>rule.path===location.pathname&&rule.page===page).forEach(mountRule);
    };

    enhance();
    const observer=new MutationObserver(()=>requestAnimationFrame(enhance));
    observer.observe(document.body,{childList:true,subtree:true});
    window.addEventListener("popstate",enhance);
    return()=>{
      observer.disconnect();
      window.removeEventListener("popstate",enhance);
      roots.forEach(root=>root.unmount());
      roots.clear();
    };
  },[]);
  return null;
}
