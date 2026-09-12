"use client";

import {useEffect} from "react";

const pageNumber=()=>Number(new URLSearchParams(location.search).get("page")||1)||1;
const logicalPageNumber=()=>{const params=new URLSearchParams(location.search);let page=pageNumber();if(params.get("senior")==="1"&&location.pathname==="/book-next9"){if(page===37)page=44;if(page===38)page=45;}return page;};
const audience=()=>new URLSearchParams(location.search).get("senior")==="1"||location.pathname.startsWith("/senior/")?"senior":"middle";

function pathFor(el:Element){
 const parts:string[]=[];
 let node:Element|null=el;
 while(node&&node!==document.querySelector("main")){
  const parent:Element|null=node.parentElement;
  if(!parent)break;
  const same:Element[]=Array.from(parent.children).filter((child:Element)=>child.tagName===node!.tagName);
  parts.unshift(`${node.tagName.toLowerCase()}:nth-of-type(${same.indexOf(node)+1})`);
  node=parent;
 }
 return parts.join(">");
}

function editableNodes(){
 const root=document.querySelector("main");
 if(!root)return[] as HTMLElement[];
 const selector="h1,h2,h3,h4,p,label,legend,li,th,td,.title,.subtitle,.question,.prompt,.caption";
 return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(el=>{
  if(el.closest("header,nav,.adminTextPanel,.tutorReviewPanel"))return false;
  if(el.children.length>0&&el.querySelector("input,textarea,select,button,a"))return false;
  return (el.textContent||"").trim().length>0;
 });
}

function fieldLabel(el:HTMLElement,index:number){
 const tag=el.tagName.toLowerCase();
 if(tag==="h1")return"Название разворота";
 if(tag==="h2")return"Заголовок блока";
 if(tag==="h3"||tag==="h4")return"Подзаголовок";
 if(tag==="label")return"Название поля / вопрос";
 if(tag==="legend")return"Название группы";
 if(tag==="li")return"Пункт списка";
 if(tag==="th")return"Заголовок таблицы";
 if(tag==="td")return"Текст в таблице";
 return `Текстовый блок ${index+1}`;
}

export default function AdminSpreadTextEditor(){
 useEffect(()=>{
  let active=true;
  const mode=new URLSearchParams(location.search).get("mode");
  const currentAudience=audience();
  const currentPage=logicalPageNumber();

  const apiUrl=`/api/spread-text/overrides?audience=${encodeURIComponent(currentAudience)}&page=${currentPage}`;

  const start=async()=>{
   let serverOverrides:Record<string,string>={};

   try{
    const response=await fetch(apiUrl,{
     method:"GET",
     credentials:"include",
     cache:"no-store"
    });
    const data=await response.json();
    if(response.ok&&data?.ok&&Array.isArray(data.overrides)){
     for(const item of data.overrides){
      if(typeof item?.selector==="string"&&typeof item?.text==="string"){
       serverOverrides[item.selector]=item.text;
      }
     }
    }
   }catch{}

   if(!active)return;

   const apply=()=>{
    Object.entries(serverOverrides).forEach(([selector,text])=>{
     try{
      const el=document.querySelector("main")?.querySelector<HTMLElement>(selector);
      if(el)el.textContent=text;
     }catch{}
    });
   };

   apply();

   if(mode!=="admin-edit"){ let n=0; const timer=setInterval(()=>{ n++; apply(); if(n>=20)clearInterval(timer); },150); return; }

   const install=()=>{
    if(document.querySelector(".adminTextPanel"))return true;

    const main=document.querySelector("main");
    if(!main)return false;

    apply();

    const nodes=editableNodes();
    if(!nodes.length)return false;

    const panel=document.createElement("aside");
    panel.className="adminTextPanel";
    panel.innerHTML=`
     <div class="adminTextHeader">
       <div><p>РЕДАКТОР РАЗВОРОТА</p><h3>Содержание разворота ${currentPage}</h3></div>
       <button type="button" data-close aria-label="Свернуть">×</button>
     </div>
     <span class="adminTextHint">Здесь редактируются реальные названия, вопросы, инструкции и подписи, которые увидит ученик.</span>
     <div class="adminTextFields"></div>
     <div class="adminTextActions">
       <button type="button" data-save>Сохранить изменения</button>
       <button type="button" data-reset>Вернуть исходный текст</button>
       <button type="button" data-back>← К назначениям</button>
     </div>
     <small>Ответы ученика, фото и рисунки не изменяются. Изменения текста сохраняются для всех пользователей.</small>`;

    document.body.appendChild(panel);

    const fields=panel.querySelector<HTMLElement>(".adminTextFields")!;

    nodes.forEach((el,index)=>{
     el.dataset.adminEditable="1";

     const row=document.createElement("label");
     row.className="adminTextField";

     const title=document.createElement("span");
     title.textContent=fieldLabel(el,index);

     const area=document.createElement("textarea");
     area.rows=Math.min(6,Math.max(2,Math.ceil(((el.textContent||"").length||1)/55)));
     area.value=(el.textContent||"").trim();

     area.oninput=()=>{
      el.textContent=area.value;
      el.scrollIntoView({block:"center",behavior:"smooth"});
     };

     el.onclick=()=>{
      area.focus();
      area.scrollIntoView({block:"center"});
     };

     row.append(title,area);
     fields.appendChild(row);
    });

    panel.querySelector<HTMLButtonElement>("[data-save]")!.onclick=async()=>{
     const button=panel.querySelector<HTMLButtonElement>("[data-save]")!;
     button.disabled=true;
     button.textContent="Сохраняю...";

     const overrides=nodes.map(el=>({
      selector:pathFor(el),
      text:(el.textContent||"").trim()
     }));

     try{
      const response=await fetch("/api/spread-text/overrides",{
       method:"PUT",
       credentials:"include",
       headers:{"Content-Type":"application/json"},
       body:JSON.stringify({
        audience:currentAudience,
        page:currentPage,
        overrides
       })
      });

      if(!response.ok)throw new Error("save_failed");

      serverOverrides={};
      for(const item of overrides)serverOverrides[item.selector]=item.text;

      button.textContent="Сохранено ✓";
     }catch{
      button.textContent="Ошибка сохранения";
     }finally{
      button.disabled=false;
      setTimeout(()=>button.textContent="Сохранить изменения",1400);
     }
    };

    panel.querySelector<HTMLButtonElement>("[data-reset]")!.onclick=async()=>{
     const button=panel.querySelector<HTMLButtonElement>("[data-reset]")!;
     if(!confirm("Вернуть исходный текст этого разворота?"))return;

     button.disabled=true;
     button.textContent="Возвращаю...";

     try{
      const response=await fetch("/api/spread-text/overrides",{
       method:"DELETE",
       credentials:"include",
       headers:{"Content-Type":"application/json"},
       body:JSON.stringify({
        audience:currentAudience,
        page:currentPage
       })
      });

      if(!response.ok)throw new Error("reset_failed");
      location.reload();
     }catch{
      button.disabled=false;
      button.textContent="Ошибка";
      setTimeout(()=>button.textContent="Вернуть исходный текст",1400);
     }
    };

    panel.querySelector<HTMLButtonElement>("[data-back]")!.onclick=()=>location.assign("/admin/spreads");
    panel.querySelector<HTMLButtonElement>("[data-close]")!.onclick=()=>panel.classList.toggle("collapsed");

    return true;
   };

   if(install())return;

   let n=0;
   const timer=setInterval(()=>{
    n++;
    if(install()||n>40)clearInterval(timer);
   },100);

   return()=>clearInterval(timer);
  };

  start();

  return()=>{
   active=false;
  };
 },[]);

 return <style jsx global>{`
  [data-admin-editable="1"]{outline:2px dashed #9b72d2!important;outline-offset:4px;cursor:pointer!important;border-radius:5px}
  [data-admin-editable="1"]:hover{outline-color:#ff7758!important;background:#fff8f4!important}
  .adminTextPanel{position:fixed;right:18px;top:88px;bottom:18px;z-index:5000;width:390px;padding:18px;border:1px solid #d9c9e8;border-radius:22px;background:#fff;box-shadow:0 22px 70px #24152f35;font-family:Inter,Arial,sans-serif;color:#3f2c4d;display:flex;flex-direction:column}
  .adminTextHeader{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.adminTextHeader p{margin:0 0 4px;font-size:10px;letter-spacing:.14em;font-weight:900;color:#7650ad}.adminTextHeader h3{margin:0;font-size:20px}.adminTextHeader>button{border:0;background:#eee7f8;color:#5e2abb;width:34px;height:34px;border-radius:10px;font-size:22px;cursor:pointer}
  .adminTextHint{display:block;margin:10px 0 14px;color:#766b7d;font-size:13px;line-height:1.4}.adminTextFields{flex:1;overflow:auto;display:grid;gap:12px;padding-right:4px}.adminTextField{display:grid;gap:6px}.adminTextField>span{font-size:11px;font-weight:900;color:#674388}.adminTextField textarea{width:100%;resize:vertical;border:1px solid #d9cee3;border-radius:11px;padding:10px;font:13px/1.4 Inter,Arial,sans-serif;color:#3f2c4d;background:#fcfaff}.adminTextField textarea:focus{outline:2px solid #8d63c7;border-color:transparent;background:#fff}
  .adminTextActions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}.adminTextActions button{border:0;border-radius:11px;padding:10px 11px;background:#5e2abb;color:#fff;font-weight:850;cursor:pointer}.adminTextActions button:disabled{opacity:.65;cursor:wait}.adminTextActions button:nth-child(2){background:#fff1ec;color:#c64c33}.adminTextActions button:nth-child(3){grid-column:1/-1;background:#eee7f8;color:#5e2abb}.adminTextPanel>small{margin-top:9px;color:#82778a;line-height:1.35}
  .adminTextPanel.collapsed{bottom:auto;height:auto;width:300px}.adminTextPanel.collapsed .adminTextHint,.adminTextPanel.collapsed .adminTextFields,.adminTextPanel.collapsed .adminTextActions,.adminTextPanel.collapsed>small{display:none}
  @media(max-width:900px){.adminTextPanel{left:10px;right:10px;top:auto;bottom:10px;width:auto;height:55vh}.adminTextPanel.collapsed{width:auto}.adminTextActions{grid-template-columns:1fr 1fr}}
  @media print{.adminTextPanel{display:none!important}[data-admin-editable="1"]{outline:0!important}}
 `}</style>;
}
