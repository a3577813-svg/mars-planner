"use client";

import {ReactNode,useEffect,useMemo,useState} from "react";

type EditableBlock={index:number;title:string;text:string};

const selector=[
  ".miniNote",
  ".sourceCard",
  ".quoteCard",
  ".storyCard",
  ".callout",
  ".smartQuote",
  ".bottomQuote"
].join(",");

function currentPage(){
  if(typeof window==="undefined")return 1;
  return Number(new URLSearchParams(window.location.search).get("page")||localStorage.getItem("mars-book-current-page")||"1")||1;
}

function storageKey(page:number,index:number,field:"title"|"text"){
  return `mars-book-callout-p${page}-${index}-${field}`;
}

function collectBlocks():EditableBlock[]{
  if(typeof document==="undefined")return [];
  return Array.from(document.querySelectorAll<HTMLElement>(selector)).map((node,index)=>{
    const titleNode=node.querySelector<HTMLElement>("b,strong,h3,h4");
    const textNode=node.querySelector<HTMLElement>("p")||node;
    return {index,title:titleNode?.innerText.trim()||"",text:textNode.innerText.trim()};
  });
}

function applyOverrides(){
  const page=currentPage();
  const nodes=Array.from(document.querySelectorAll<HTMLElement>(selector));
  nodes.forEach((node,index)=>{
    node.classList.add("marsCompactCallout");
    const titleNode=node.querySelector<HTMLElement>("b,strong,h3,h4");
    const textNode=node.querySelector<HTMLElement>("p")||node;
    const title=localStorage.getItem(storageKey(page,index,"title"));
    const text=localStorage.getItem(storageKey(page,index,"text"));
    if(title!==null&&titleNode)titleNode.innerText=title;
    if(text!==null)textNode.innerText=text;
  });
}

export default function BookLayout({children}:{children:ReactNode}){
  const[admin,setAdmin]=useState(false);
  const[open,setOpen]=useState(false);
  const[page,setPage]=useState(1);
  const[blocks,setBlocks]=useState<EditableBlock[]>([]);

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    setAdmin(params.get("admin")==="1"||localStorage.getItem("mars-admin-mode")==="1");
    const refresh=()=>{
      const next=currentPage();
      setPage(next);
      applyOverrides();
      setBlocks(collectBlocks());
    };
    refresh();
    const observer=new MutationObserver(()=>requestAnimationFrame(refresh));
    observer.observe(document.body,{childList:true,subtree:true});
    const timer=window.setInterval(refresh,700);
    window.addEventListener("popstate",refresh);
    return()=>{observer.disconnect();window.clearInterval(timer);window.removeEventListener("popstate",refresh)};
  },[]);

  const editable=useMemo(()=>blocks,[blocks]);

  function save(index:number,field:"title"|"text",value:string){
    localStorage.setItem(storageKey(page,index,field),value);
    setBlocks(list=>list.map(item=>item.index===index?{...item,[field]:value}:item));
    requestAnimationFrame(applyOverrides);
  }

  return <>
    {children}
    {admin&&<>
      <button className="marsAdminEditButton" onClick={()=>setOpen(true)}>Редактировать тексты</button>
      {open&&<div className="marsAdminOverlay" onClick={()=>setOpen(false)}>
        <aside className="marsAdminPanel" onClick={e=>e.stopPropagation()}>
          <div className="marsAdminHeader"><div><b>Редактор разворота</b><span>Разворот {page}</span></div><button onClick={()=>setOpen(false)}>×</button></div>
          <p className="marsAdminHint">Можно менять только заголовки и тексты уже существующих плашек. Их количество, цвет и расположение остаются такими же, как в планёрке.</p>
          {editable.length===0?<p>На этом развороте нет текстовых плашек.</p>:editable.map(block=><section className="marsAdminBlock" key={block.index}>
            <label>Заголовок<input value={block.title} onChange={e=>save(block.index,"title",e.target.value)}/></label>
            <label>Текст<textarea rows={5} value={block.text} onChange={e=>save(block.index,"text",e.target.value)}/></label>
          </section>)}
        </aside>
      </div>}
    </>;
}

const css=`
.marsCompactCallout{height:auto!important;min-height:0!important;max-height:none!important;align-self:start!important;justify-self:stretch!important;overflow:visible!important;padding:9px 11px!important;margin-top:10px!important;margin-bottom:10px!important}
.marsCompactCallout p{margin:4px 0 0!important;line-height:1.35!important}
.marsCompactCallout b,.marsCompactCallout strong,.marsCompactCallout h3,.marsCompactCallout h4{margin:0!important}
.marsAdminEditButton{position:fixed;right:22px;bottom:22px;z-index:60;border:0;border-radius:14px;background:#5b2bb7;color:white;padding:13px 17px;font-weight:800;box-shadow:0 14px 34px #3d22613d}
.marsAdminOverlay{position:fixed;inset:0;background:#241a3147;z-index:80;display:flex;justify-content:flex-end}
.marsAdminPanel{width:min(430px,94vw);height:100%;overflow:auto;background:#fff;padding:22px;box-shadow:-20px 0 50px #241a3130}
.marsAdminHeader{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid #ece5f2;padding-bottom:14px;margin-bottom:14px}.marsAdminHeader div{display:grid;gap:3px}.marsAdminHeader b{font-size:21px;color:#42216f}.marsAdminHeader span{font-size:12px;color:#857b8e}.marsAdminHeader button{border:0;background:#f1ebf8;color:#5a2bac;width:34px;height:34px;border-radius:10px;font-size:22px}
.marsAdminHint{font-size:13px;line-height:1.45;color:#716878;background:#f7f3fb;padding:12px;border-radius:12px}
.marsAdminBlock{border:1px solid #e9e1ef;border-radius:16px;padding:14px;margin:12px 0;background:#fdfcfe}.marsAdminBlock label{display:grid;gap:6px;margin:8px 0;font-size:12px;font-weight:800;color:#5a5261}.marsAdminBlock input,.marsAdminBlock textarea{width:100%;border:1px solid #d9cfe2;border-radius:10px;padding:10px;font:14px/1.4 Inter,Arial,sans-serif;color:#282130;background:white}.marsAdminBlock textarea{resize:vertical}
`;

if(typeof document!=="undefined"&&!document.getElementById("mars-book-layout-css")){
  const style=document.createElement("style");style.id="mars-book-layout-css";style.textContent=css;document.head.appendChild(style);
}
