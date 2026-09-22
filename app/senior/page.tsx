"use client";

import {useEffect,useMemo,useState} from "react";
import CabinetShell from "../components/cabinet/CabinetShell";
import {seniorItems,seniorHref} from "../lib/senior-planner-map";
import {getSeniorPageStatuses,type PlannerEntry} from "../lib/planner-progress";
import {seniorCabinetNav} from "../lib/senior-cabinet-nav";

type SpreadAssignment={page:number;week:string;start:string;end:string;visible:boolean};
const isFutureAssignment=(assignment?:SpreadAssignment)=>Boolean(assignment?.start&&new Date(assignment.start+"T00:00:00").getTime()>Date.now());

export default function SeniorPlanner(){
 const[entries,setEntries]=useState<PlannerEntry[]>([]);
 const[allowedPages,setAllowedPages]=useState<number[]>([]);
 const[assignments,setAssignments]=useState<SpreadAssignment[]>([]);
 const[loading,setLoading]=useState(true);

 useEffect(()=>{
  let active=true;
  Promise.all([
   fetch("/api/planner",{credentials:"include",cache:"no-store"}).then(r=>r.json()),
   fetch("/api/student/access",{credentials:"include",cache:"no-store"}).then(r=>r.json()),
   fetch("/api/spread-assignments?audience=senior",{credentials:"include",cache:"no-store"}).then(r=>r.json())
  ]).then(([planner,access,spread])=>{
   if(!active)return;
   if(planner?.ok&&Array.isArray(planner.entries))setEntries(planner.entries);
   if(access?.ok&&Array.isArray(access.allowedPages))setAllowedPages(access.allowedPages.map(Number).filter((n:number)=>Number.isInteger(n)&&n>=1&&n<=45));
   if(spread?.ok&&Array.isArray(spread.assignments))setAssignments(spread.assignments);
  }).catch(()=>{}).finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[]);

 const pageStatuses=useMemo(()=>getSeniorPageStatuses(entries),[entries]);
 const visibleItems=useMemo(()=>seniorItems.filter(item=>allowedPages.includes(item.n)&&assignments.find(value=>value.page===item.n)?.visible!==false),[allowedPages,assignments]);
 const doneCount=visibleItems.filter(item=>pageStatuses[item.n]==="done").length;
 const progressCount=visibleItems.filter(item=>pageStatuses[item.n]==="progress").length;
 const futureCount=visibleItems.filter(item=>isFutureAssignment(assignments.find(value=>value.page===item.n))).length;
 const openItems=visibleItems.filter(item=>!isFutureAssignment(assignments.find(value=>value.page===item.n)));
 const currentItem=openItems.find(item=>pageStatuses[item.n]==="progress")||openItems.find(item=>pageStatuses[item.n]==="empty")||openItems[openItems.length-1]||null;

 return <CabinetShell roleLabel="Кабинет ученика" title="Моя планёрка" activeHref="/senior" gradeLabel="8–11 класс" brandHref="/senior/cabinet-preview" nav={seniorCabinetNav}>
  <div className="plannerPage">
   <section className="plannerIntro">
    <div><span className="eyebrow">МОЙ МАРШРУТ</span><h1>Моя планёрка</h1><p>Все развороты твоего маршрута — от первых идей до итоговой рефлексии.</p></div>
    <a className="backCabinet" href="/senior/cabinet-preview">← На главную</a>
   </section>
   {loading?<section className="plannerLoading">Загружаем планёрку…</section>:<>
    <section className="plannerStats">
     <div><strong>{visibleItems.length}</strong><span>Всего разворотов</span></div>
     <div><strong>{doneCount}</strong><span>Завершено</span></div>
     <div><strong>{progressCount}</strong><span>В работе</span></div>
     <div><strong>{futureCount}</strong><span>Откроется позже</span></div>
    </section>
    {currentItem&&<section className="currentSpread"><div><span>СЕЙЧАС В ФОКУСЕ</span><h2>{currentItem.n}. {currentItem.title}</h2><p>{pageStatuses[currentItem.n]==="progress"?"Ты уже начал этот разворот. Продолжи с того места, где остановился.":"Следующий доступный шаг твоего маршрута."}</p></div><a href={seniorHref(currentItem)} onClick={()=>localStorage.setItem("mars-senior-current-page",String(currentItem.n))}>Открыть разворот →</a></section>}
    <section className="allSpreads"><div className="plannerSectionHead"><div><span>▣</span><h2>Все развороты</h2></div><small>{visibleItems.length} доступно</small></div>
     <div className="spreadGrid">{visibleItems.map(item=>{const status=pageStatuses[item.n];const future=isFutureAssignment(assignments.find(value=>value.page===item.n));return <a key={item.n} href={seniorHref(item)} onClick={()=>localStorage.setItem("mars-senior-current-page",String(item.n))} className={`spreadCard ${status} ${future?"future":""}`}><div className="spreadNumber">{item.n}</div><h3>{item.title}</h3><div className="spreadMeta"><span>{status==="done"?"✓ Завершено":status==="progress"?"● В работе":future?"◷ Откроется позже":"○ Впереди"}</span><b>→</b></div></a>})}</div>
    </section>
   </>}
  </div>
  <style jsx>{`
   .plannerPage{display:grid;gap:18px}.plannerIntro{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;padding:8px 4px 4px}.eyebrow{font-size:10px;font-weight:900;letter-spacing:.16em;color:#7048c8}.plannerIntro h1{margin:7px 0 7px;font-size:38px;line-height:1;color:#17205f;letter-spacing:-.045em}.plannerIntro p{margin:0;color:#69718f;font-size:13px}.backCabinet{flex:0 0 auto;color:#6332c7;text-decoration:none;font-size:12px;font-weight:800}.plannerLoading{padding:50px;background:#fff;border:1px solid #e7e6f0;border-radius:19px;text-align:center;color:#747b99}.plannerStats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.plannerStats>div{min-height:94px;padding:17px 19px;background:#fff;border:1px solid #e7e6f0;border-radius:16px;box-shadow:0 7px 28px #25245b0b;display:flex;flex-direction:column;justify-content:center}.plannerStats strong{font-size:27px;color:#20275f}.plannerStats span{margin-top:5px;font-size:10px;font-weight:800;color:#7a819d}.currentSpread{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:24px 27px;border-radius:19px;background:linear-gradient(110deg,#2c285b,#54349c);color:#fff;box-shadow:0 12px 30px #30236d24}.currentSpread span{font-size:9px;font-weight:900;letter-spacing:.15em;color:#d9cff6}.currentSpread h2{margin:7px 0 7px;font-size:22px;letter-spacing:-.025em}.currentSpread p{margin:0;color:#e4dff3;font-size:11px;line-height:1.5}.currentSpread>a{flex:0 0 auto;padding:12px 17px;border-radius:11px;background:#fff;color:#55329f;text-decoration:none;font-size:11px;font-weight:900}.allSpreads{padding:21px;background:#fff;border:1px solid #e7e6f0;border-radius:19px;box-shadow:0 7px 28px #25245b0b}.plannerSectionHead{display:flex;align-items:center;justify-content:space-between;gap:12px}.plannerSectionHead>div{display:flex;align-items:center;gap:9px}.plannerSectionHead>div>span{font-size:20px;color:#6737c8}.plannerSectionHead h2{margin:0;font-size:20px;color:#17205f}.plannerSectionHead small{color:#858ba5;font-size:10px}.spreadGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:17px}.spreadCard{min-height:158px;padding:15px;display:flex;flex-direction:column;border:1px solid #e3e2ef;border-radius:13px;background:#f8f7fc;color:#303867;text-decoration:none;transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease}.spreadCard:hover{transform:translateY(-2px);box-shadow:0 9px 24px #2b285b12;border-color:#cfc8e5}.spreadNumber{width:34px;height:34px;border-radius:10px;background:#ece9f7;display:grid;place-items:center;font-size:14px;font-weight:900;color:#5d42a2}.spreadCard h3{margin:12px 0;font-size:13px;line-height:1.35;color:#303867}.spreadMeta{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:9px;font-weight:900;color:#8a90aa}.spreadMeta b{font-size:17px;color:#6d47c6}.spreadCard.done{background:#f2faf6;border-color:#d8eee3}.spreadCard.done .spreadNumber{background:#daf1e5;color:#269c69}.spreadCard.done .spreadMeta{color:#27a96f}.spreadCard.progress{background:#fff6f1;border-color:#f5d8ca}.spreadCard.progress .spreadNumber{background:#ffe2d4;color:#e8623a}.spreadCard.progress .spreadMeta{color:#e8623a}.spreadCard.future{opacity:.68;background:#f5f5f8}.spreadCard.future .spreadMeta{color:#8a90aa}@media(max-width:1150px){.spreadGrid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:850px){.plannerStats{grid-template-columns:repeat(2,1fr)}.spreadGrid{grid-template-columns:repeat(2,minmax(0,1fr))}.currentSpread{align-items:flex-start;flex-direction:column}}@media(max-width:560px){.plannerIntro{align-items:flex-start;flex-direction:column}.plannerIntro h1{font-size:31px}.plannerStats{gap:8px}.plannerStats>div{min-height:80px;padding:14px}.spreadGrid{grid-template-columns:1fr}.spreadCard{min-height:135px}.allSpreads{padding:15px}.currentSpread{padding:20px}}
  `}</style>
 </CabinetShell>;
}
