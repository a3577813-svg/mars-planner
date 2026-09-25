"use client";

import {useEffect,useRef,useState} from "react";
import type {PointerEvent as ReactPointerEvent} from "react";

type ReviewStatus="great"|"revise"|"talk"|"";

type MethodistComment={
 comment:string;
 author:string;
 updatedAt:string|null;
};

const statusOptions:[ReviewStatus,string,string][]=[
 ["great","Отлично","✓"],
 ["revise","Доработать","↻"],
 ["talk","Нужно обсудить","!"]
];

function context(){
 const params=new URLSearchParams(location.search);
 const mode=params.get("mode")||"student";
 const isSenior=params.get("senior")==="1"||location.pathname.startsWith("/senior/");
 const sourcePage=Number(params.get("page")||"1")||1;
 const page=Number(params.get("logicalPage")||sourcePage)||sourcePage;
 const student=isSenior?"student8":"student7";
 return{mode,isSenior,page,student};
}

function key(student:string,page:number,suffix:string){return`mars-tutor-review:${student}:p${page}:${suffix}`}

export default function TutorSpreadReview(){
 const[ready,setReady]=useState(false);
 const[mode,setMode]=useState("student");
 const[student,setStudent]=useState("student7");
 const[page,setPage]=useState(1);
 const[status,setStatus]=useState<ReviewStatus>("");
 const[comment,setComment]=useState("");
 const[saved,setSaved]=useState(false);
 const[methodistComments,setMethodistComments]=useState<MethodistComment[]>([]);
 const dockRef=useRef<HTMLElement|null>(null);
 const[position,setPosition]=useState<{x:number;y:number}|null>(null);
 const[collapsed,setCollapsed]=useState(false);
 const dragRef=useRef<{dx:number;dy:number;pointerId:number}|null>(null);

 useEffect(()=>{
  const sync=()=>{
   const c=context();
   const plannerPath=location.pathname.startsWith("/book")||location.pathname.startsWith("/senior/unique");
   if(!plannerPath)return;
   setMode(c.mode);setStudent(c.student);setPage(c.page);
   setStatus((localStorage.getItem(key(c.student,c.page,"status"))||"") as ReviewStatus);
   setComment(localStorage.getItem(key(c.student,c.page,"comment"))||"");

   if(c.mode==="methodist"){
    const studentId=new URLSearchParams(location.search).get("student")||"";
    if(studentId){
     fetch("/api/staff/student?student="+encodeURIComponent(studentId),{cache:"no-store"})
      .then(r=>r.json())
      .then(data=>{
       if(data.ok&&Array.isArray(data.student?.comments)){
        setMethodistComments(data.student.comments);
       }
      })
      .finally(()=>setReady(true));
     return;
    }
   }

   setReady(true);
  };

  const originalReplaceState=history.replaceState;
  history.replaceState=function(...args){
   originalReplaceState.apply(history,args);
   window.dispatchEvent(new Event("mars-page-change"));
  };

  sync();
  window.addEventListener("popstate",sync);
  window.addEventListener("mars-page-change",sync);
  return()=>{
   history.replaceState=originalReplaceState;
   window.removeEventListener("popstate",sync);
   window.removeEventListener("mars-page-change",sync);
  };
 },[]);

 if(!ready)return null;
 const save=()=>{
  if(status)localStorage.setItem(key(student,page,"status"),status);else localStorage.removeItem(key(student,page,"status"));
  if(comment.trim())localStorage.setItem(key(student,page,"comment"),comment.trim());else localStorage.removeItem(key(student,page,"comment"));
  localStorage.setItem(key(student,page,"updated"),new Date().toISOString());
  window.dispatchEvent(new Event("storage"));
  setSaved(true);window.setTimeout(()=>setSaved(false),1200);
 };
 const selected=statusOptions.find(item=>item[0]===status);

 const startDrag=(e:ReactPointerEvent<HTMLDivElement>)=>{
  if((e.target as HTMLElement).closest("button"))return;
  const dock=dockRef.current;if(!dock)return;
  const rect=dock.getBoundingClientRect();
  dragRef.current={dx:e.clientX-rect.left,dy:e.clientY-rect.top,pointerId:e.pointerId};
  e.currentTarget.setPointerCapture(e.pointerId);
 };

 const moveDrag=(e:ReactPointerEvent<HTMLDivElement>)=>{
  const drag=dragRef.current;const dock=dockRef.current;if(!drag||!dock)return;
  const rect=dock.getBoundingClientRect();
  const x=Math.max(8,Math.min(e.clientX-drag.dx,window.innerWidth-rect.width-8));
  const y=Math.max(8,Math.min(e.clientY-drag.dy,window.innerHeight-rect.height-8));
  setPosition({x,y});
 };

 const stopDrag=(e:ReactPointerEvent<HTMLDivElement>)=>{
  if(dragRef.current?.pointerId===e.pointerId)dragRef.current=null;
  if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
 };

 if(mode==="methodist"){
  if(!methodistComments.length)return null;
  return <aside className="studentTutorFeedback neutral">
   <p>КОММЕНТАРИИ ТЬЮТОРА</p>
   {methodistComments.map((item,index)=><div key={index} style={{marginTop:index?14:0}}>
    <strong style={{display:"block",marginBottom:4,color:"#432172"}}>{item.author||"Тьютор"}</strong>
    <div style={{whiteSpace:"pre-wrap",lineHeight:1.5}}>{item.comment}</div>
   </div>)}
  </aside>;
 }

 if(mode!=="teacher"){
  if(!status&&!comment.trim())return null;
  return <aside className={`studentTutorFeedback ${status||"neutral"}`}>
   <p>КОММЕНТАРИЙ ТЬЮТОРА К РАЗВОРОТУ {page}</p>
   {selected&&<h3><span>{selected[2]}</span>{selected[1]}</h3>}
   {comment.trim()&&<div>{comment}</div>}
  </aside>;
 }

 return <aside ref={dockRef} className={`tutorReviewDock${collapsed?" collapsed":""}`} style={position?{left:position.x,top:position.y,right:"auto",bottom:"auto"}:undefined} aria-label="Проверка разворота тьютором">
  <div className="tutorReviewHead" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={stopDrag} onPointerCancel={stopDrag}><div><p>ПРОВЕРКА РАЗВОРОТА</p><h3>Разворот {page}</h3></div><button type="button" onClick={()=>setCollapsed(v=>!v)}>{collapsed?"▢":"×"}</button></div>
  {!collapsed&&<>
  <div className="tutorStatusButtons">{statusOptions.map(([value,label,icon])=><button key={value} type="button" className={status===value?`active ${value}`:""} onClick={()=>setStatus(status===value?"":value)}><span>{icon}</span>{label}</button>)}</div>
  <label><span>Комментарий ученику</span><textarea rows={5} value={comment} onChange={e=>setComment(e.target.value)} placeholder="Что получилось? На что обратить внимание? Что сделать дальше?"/></label>
  <button type="button" className="saveTutorReview" onClick={save}>{saved?"Сохранено ✓":"Сохранить обратную связь"}</button>
  <small>Комментарий будет виден ученику на этом развороте.</small>
  </>}
  <style jsx global>{`
   .tutorReviewDock{position:fixed;height:auto!important;min-height:0!important;right:18px;bottom:18px;z-index:1200;width:min(360px,calc(100vw - 28px));padding:18px;max-height:calc(100vh - 36px);overflow-y:auto;overscroll-behavior:contain;border:1px solid #ded3e8;border-radius:22px;background:#fff;box-shadow:0 24px 70px #2e203c40;font-family:Inter,Arial,sans-serif;color:#352641}
   .tutorReviewDock.collapsed{height:74px!important;min-height:74px!important;max-height:74px!important;overflow:hidden!important}.tutorReviewHead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;cursor:grab;touch-action:none;user-select:none}.tutorReviewHead:active{cursor:grabbing}.tutorReviewHead p{margin:0 0 4px;font-size:10px;letter-spacing:.14em;font-weight:900;color:#7650ad}.tutorReviewHead h3{margin:0;color:#432172}.tutorReviewHead>button{width:32px;height:32px;border:0;border-radius:50%;background:#eee7f8;color:#5b2aac;font-size:22px;cursor:pointer}
   .tutorStatusButtons{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:14px 0}.tutorStatusButtons button{display:grid;gap:4px;justify-items:center;border:1px solid #e4dbe9;border-radius:12px;padding:9px 5px;background:#faf8fc;color:#685c70;font-size:10px;font-weight:800;cursor:pointer}.tutorStatusButtons button span{width:24px;height:24px;display:grid;place-items:center;border-radius:8px;background:#eee8f3;font-size:14px}.tutorStatusButtons button.active.great{border-color:#9dcfab;background:#eff9f2;color:#2f7547}.tutorStatusButtons button.active.revise{border-color:#e4c678;background:#fff8e4;color:#8e6208}.tutorStatusButtons button.active.talk{border-color:#e5a79c;background:#fff1ee;color:#a54432}
   .tutorReviewDock label{display:grid;gap:6px}.tutorReviewDock label>span{font-size:12px;font-weight:800}.tutorReviewDock textarea{width:100%;resize:vertical;border:1px solid #dcd2e5;border-radius:12px;padding:10px;font:13px/1.45 Inter}.saveTutorReview{width:100%;margin-top:10px;border:0;border-radius:12px;padding:11px;background:#5e2abb;color:#fff;font-weight:900;cursor:pointer}.tutorReviewDock>small{display:block;margin-top:7px;color:#80758a;font-size:10px;line-height:1.3}
   .studentTutorFeedback{margin:14px auto;padding:16px 18px;border:1px solid #dfd6e7;border-left:5px solid #7650ad;border-radius:16px;background:#fff;box-shadow:0 10px 28px #3b2a5510;font-family:Inter,Arial,sans-serif;break-inside:avoid}.studentTutorFeedback p{margin:0 0 7px;font-size:10px;letter-spacing:.12em;font-weight:900;color:#7650ad}.studentTutorFeedback h3{display:flex;align-items:center;gap:8px;margin:0 0 7px;color:#432172}.studentTutorFeedback h3 span{width:25px;height:25px;display:grid;place-items:center;border-radius:8px;background:#eee7f8}.studentTutorFeedback>div{white-space:pre-wrap;line-height:1.5;color:#5f5566}.studentTutorFeedback.great{border-left-color:#49a368}.studentTutorFeedback.revise{border-left-color:#d59a22}.studentTutorFeedback.talk{border-left-color:#d55d49}
   @media(max-width:700px){.tutorReviewDock{right:14px;bottom:14px}.tutorStatusButtons{grid-template-columns:1fr}.tutorStatusButtons button{grid-template-columns:auto 1fr;align-items:center;justify-items:start}.tutorStatusButtons button span{grid-row:1}}
   @media print{.tutorReviewDock{display:none!important}.studentTutorFeedback{box-shadow:none}}
  `}</style>
 </aside>;
}
