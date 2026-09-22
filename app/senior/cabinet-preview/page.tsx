"use client";

import {useEffect,useMemo,useState} from "react";
import CabinetShell from "../../components/cabinet/CabinetShell";
import {seniorItems,seniorHref} from "../../lib/senior-planner-map";
import {getSeniorPageStatuses} from "../../lib/planner-progress";

type PlannerEntry={
 field_key:string;
 value:string;
 updated_at?:string;
};

type SpreadAssignment={
 page:number;
 week:string;
 start:string;
 end:string;
 visible:boolean;
};
type Submission={status:"generating"|"submitted"|"error";submitted_at:string|null;pdf_path:string|null};

type PageStatus="empty"|"progress"|"done";

const isFutureAssignment=(assignment?:SpreadAssignment)=>Boolean(assignment?.start&&new Date(assignment.start+"T00:00:00").getTime()>Date.now());


export default function CabinetPreview(){
 const[entries,setEntries]=useState<PlannerEntry[]>([]);
 const[allowedPages,setAllowedPages]=useState<number[]>([]);
 const[assignments,setAssignments]=useState<SpreadAssignment[]>([]);
 const[submission,setSubmission]=useState<Submission|null>(null);
 const[tutorComment,setTutorComment]=useState("");
 const[loading,setLoading]=useState(true); const[submitLoading,setSubmitLoading]=useState(false); const[submitError,setSubmitError]=useState("");
 useEffect(()=>{
  let active=true;

  Promise.all([
   fetch("/api/planner",{credentials:"include",cache:"no-store"}).then(r=>r.json()),
   fetch("/api/student/access",{credentials:"include",cache:"no-store"}).then(r=>r.json()),
   fetch("/api/spread-assignments?audience=senior",{credentials:"include",cache:"no-store"}).then(r=>r.json()),
   fetch("/api/student/comment",{credentials:"include",cache:"no-store"}).then(r=>r.json()),
   fetch("/api/planner/submit",{credentials:"include",cache:"no-store"}).then(r=>r.json()),
  ])
   .then(([planner,access,spread,comment,submit])=>{
    if(!active)return;

    if(submit?.ok&&submit.submission)setSubmission(submit.submission);
    if(planner?.ok&&Array.isArray(planner.entries)){
     setEntries(planner.entries);
    }

    if(access?.ok&&Array.isArray(access.allowedPages)){
     setAllowedPages(
      access.allowedPages
       .map(Number)
       .filter((n:number)=>Number.isInteger(n)&&n>=1&&n<=45)
     );
    }

    if(spread?.ok&&Array.isArray(spread.assignments)){
     setAssignments(spread.assignments);
    }

    if(comment?.ok){
     setTutorComment(comment.comment||"");
    }
   })
   .catch(()=>{})
   .finally(()=>{
    if(active)setLoading(false);
   });

  return()=>{active=false;};
 },[]);
 const pageStatuses=useMemo(()=>getSeniorPageStatuses(entries),[entries]);
 const visibleItems=useMemo(()=>{
  return seniorItems.filter(item=>{
   if(!allowedPages.includes(item.n))return false;

   const assignment=assignments.find(
    value=>value.page===item.n
   );

   return assignment?.visible!==false;
  });
 },[allowedPages,assignments]);

 const openItems=visibleItems.filter(item=>!isFutureAssignment(assignments.find(value=>value.page===item.n)));

 const doneCount=visibleItems.filter(
  item=>pageStatuses[item.n]==="done"
 ).length;

 const progressCount=visibleItems.filter(
  item=>pageStatuses[item.n]==="progress"
 ).length;

 const emptyCount=visibleItems.filter(
  item=>pageStatuses[item.n]==="empty"
 ).length;

 const progressPercent=visibleItems.length
  ?Math.round(doneCount/visibleItems.length*100)
  :0;

 const currentItem=
  openItems.find(
   item=>pageStatuses[item.n]==="progress"
  )
  ||openItems.find(
   item=>pageStatuses[item.n]==="empty"
  )
  ||openItems[openItems.length-1]
  ||null;
 const currentIndex=currentItem?Math.max(0,visibleItems.findIndex(item=>item.n===currentItem.n)):-1;
 const previewStart=Math.max(0,Math.min(currentIndex-2,visibleItems.length-6));
 const plannerPreviewItems=visibleItems.slice(previewStart,previewStart+6);
 const submitPlanner=async()=>{
  setSubmitError(""); setSubmitLoading(true);
  try{
   const response=await fetch("/api/planner/submit",{method:"POST",credentials:"include"});
   const data=await response.json();
   if(!response.ok||!data.ok)throw new Error(data.error||"Не удалось завершить планёрку");
   setSubmission(data.submission);
  }catch(error:any){setSubmitError(error?.message||"Ошибка завершения планёрки");
  }finally{setSubmitLoading(false);}
 };
 return <CabinetShell roleLabel="Кабинет ученика" title="Мой маршрут" activeHref="/senior/cabinet-preview" gradeLabel="8–11 класс" brandHref="/senior/cabinet-preview" nav={[
  {href:"/senior/cabinet-preview",label:"Главная",icon:"⌂"},{href:"/senior",label:"Моя планёрка",icon:"▣"},{href:"#projects",label:"Мои проекты",icon:"◇"},{href:"#materials",label:"Мои материалы",icon:"▱"},{href:"#comments",label:"Комментарии",icon:"▢"},{href:"#submit",label:"Итоговая сдача",icon:"▤"}
 ]}>
  <div className="dashboard">
   <div className="topGrid">
    <section className="hero">
     <img src="/cabinet-hero-final.png" alt="" className="heroImage"/>
     <div className="heroOverlay"/>
     <div className="heroCopy">{currentItem?<><span>Сейчас ты на развороте</span><h1>{currentItem.n}. {currentItem.title}</h1><p>Продолжай работу — все изменения сохраняются автоматически.</p><a className="heroButton" href={seniorHref(currentItem)} onClick={()=>localStorage.setItem("mars-senior-current-page",String(currentItem.n))}>Продолжить заполнение <b>→</b></a></>:<><span>Моя планёрка</span><h1>Нет доступных разворотов</h1><p>Когда развороты будут открыты, они появятся здесь.</p></>}</div>    </section>
    <section className="cabinetCard progressCard"><h2>Твой прогресс</h2><div className="progressRing" style={{background:`conic-gradient(#6532c9 0 ${progressPercent}%,#e8e8f4 ${progressPercent}% 100%)`}}><div><strong>{progressPercent}%</strong><small>заполнено</small></div></div><div className="legend"><div><i className="green"/>Завершено <b>{doneCount}</b></div><div><i className="purple"/>В работе <b>{progressCount}</b></div><div><i className="gray"/>Впереди <b>{emptyCount}</b></div></div><div className="total">Всего разворотов <b>{visibleItems.length}</b></div></section>   </div>

   <section id="planner" className="cabinetCard plannerCard"><div className="sectionHead"><h2><span>▣</span> Моя планёрка</h2><a href="/senior">Открыть всю планёрку →</a></div><div className="plannerStrip">{plannerPreviewItems.map(item=>{const status=pageStatuses[item.n];const future=isFutureAssignment(assignments.find(value=>value.page===item.n));return <a key={item.n} href={seniorHref(item)} onClick={()=>localStorage.setItem("mars-senior-current-page",String(item.n))} className={`plannerTile ${status==="done"?"done":currentItem&&item.n===currentItem.n?"active":""}`} style={{textDecoration:"none"}}><b>{item.n}</b><strong>{item.title}</strong><small>{status==="done"?"✓ Завершено":status==="progress"?"● В работе":future?"◷ Откроется позже":"○ Впереди"}</small></a>})}</div></section>
   <div className="bottomGrid">
    <section id="projects" className="cabinetCard projectsCard"><div className="sectionHead"><h2><span>◇</span> Мои проекты</h2></div><div className="projectBody"><div className="projectText"><h3>Здесь появятся твои проекты</h3><p>Когда проекты будут добавлены в кабинет, ты увидишь их здесь.</p></div></div></section>
    <section id="materials" className="cabinetCard materialsCard"><div className="sectionHead"><h2><span>▱</span> Мои материалы</h2></div><div className="materialRow"><span className="materialIcon purpleBg">▤</span><b>Заметки</b><small>Пока нет файлов</small></div><div className="materialRow"><span className="materialIcon orangeBg">▣</span><b>Фотографии</b><small>Пока нет файлов</small></div><div className="materialRow"><span className="materialIcon purpleBg">▧</span><b>Исследования</b><small>Пока нет файлов</small></div></section>
    <section className="cabinetCard eventsCard"><div className="sectionHead"><h2><span>▣</span> Ближайшие события</h2></div><div className="event"><div style={{gridColumn:"1/-1"}}><strong>Событий пока нет</strong><small>Новые события появятся здесь.</small></div></div></section>
   </div>

    <section id="submit" className="cabinetCard submissionCard">
     <div className="sectionHead"><h2><span>▤</span> Итоговая сдача</h2></div>
     {submission?.status==="submitted"&&<div className="submissionBody"><h3>Планёрка сдана ✓</h3><p>{submission.submitted_at?`Дата сдачи: ${new Date(submission.submitted_at).toLocaleString("ru-RU")}`:"Сдача зафиксирована"}</p>{submission.pdf_path&&<a className="submissionButton" href="/api/planner/pdf" target="_blank" rel="noreferrer">Скачать итоговый PDF</a>}</div>}
     {submission?.status==="generating"&&<div className="submissionBody"><h3>Формируем итоговый PDF…</h3><p>Планёрка принята. Итоговый файл сейчас собирается.</p></div>}
     {submission?.status==="error"&&<div className="submissionBody"><h3>Не удалось сформировать PDF</h3><p>Попробуй завершить планёрку ещё раз.</p><button className="submissionButton" onClick={submitPlanner} disabled={submitLoading}>{submitLoading?"Запускаем повторно…":"Повторить завершение"}</button></div>}
     {!submission&&<div className="submissionBody"><h3>Готов(а) завершить?</h3><p>После завершения администратор увидит, что планёрка сдана, а система сформирует итоговый PDF.</p><button className="submissionButton" onClick={submitPlanner} disabled={submitLoading}>{submitLoading?"Сохраняем…":"Завершить планёрку"}</button></div>}
     {submitError&&<div className="submissionError">{submitError}</div>}
    </section>
   <div className="secondaryGrid">
    <section id="comments" className="cabinetCard feedbackCard"><div className="sectionHead"><h2><span>✦</span> Комментарий тьютора</h2></div>{tutorComment?<div className="feedback"><div className="avatar">Т</div><div><b>Твой тьютор</b><p>{tutorComment}</p></div></div>:<div className="feedback"><div className="avatar">Т</div><div><b>Комментариев пока нет</b><p>Когда тьютор оставит обратную связь, она появится здесь.</p></div></div>}</section>    <section className="cabinetCard quoteCard"><p>«План — это не ограничение, а свобода быть собой в будущем.»</p><b>Команда МАРС ♡</b></section>
   </div>
  </div>
  <style jsx>{`
   .dashboard{display:grid;gap:16px}.topGrid{display:grid;grid-template-columns:minmax(0,3fr) 286px;gap:16px}.hero{height:402px;border-radius:21px;overflow:hidden;position:relative;border:1px solid #e6e0ed;background:#eadcf0}.heroImage{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.heroOverlay{position:absolute;inset:0;background:linear-gradient(90deg,#fff2e8b8 0%,#fff0e233 40%,transparent 68%)}.heroCopy{position:absolute;left:48px;top:54px;z-index:2;color:#192260}.heroCopy>span{font-size:13px;font-weight:900}.heroCopy h1{margin:9px 0 12px;font-size:41px;letter-spacing:-.045em;line-height:1.05}.heroCopy p{font-size:14px;line-height:1.5;margin:0 0 22px;color:#4d587f}.heroButton{border:0;border-radius:12px;padding:14px 22px;background:#6332c7;color:#fff;font:800 14px Inter,Arial,sans-serif;box-shadow:0 9px 25px #6332c733}.heroButton b{font-size:18px;margin-left:7px}.heroWords{position:absolute;right:38px;top:45px;z-index:2;color:#1c225c;font:italic 700 20px/1.35 Georgia,serif;letter-spacing:.02em;transform:rotate(-3deg)}.cabinetCard{background:#fff;border:1px solid #e7e6f0;border-radius:19px;box-shadow:0 7px 28px #25245b0b}.progressCard{padding:20px 20px 16px}.progressCard h2,.sectionHead h2{margin:0;color:#17205f;font-size:20px;letter-spacing:-.02em}.progressRing{width:188px;height:188px;border-radius:50%;margin:12px auto 14px;display:grid;place-items:center;background:conic-gradient(#6532c9 0 58%,#e8e8f4 58% 100%);position:relative}.progressRing:after{content:"";position:absolute;inset:12px;border-radius:50%;background:#fff}.progressRing>div{position:relative;z-index:1;text-align:center}.progressRing strong{display:block;font-size:38px;color:#20275f}.progressRing small{font-size:11px;color:#7b819d}.legend{display:grid;gap:9px;font-size:11px;color:#68708e}.legend>div{display:flex;align-items:center;gap:8px}.legend i{width:10px;height:10px;border-radius:50%;display:inline-block}.legend .green{background:#27b477}.legend .purple{background:#7048c8}.legend .gray{background:#c6ccdb}.legend b{margin-left:auto;color:#303867}.total{border-top:1px solid #ececf3;margin-top:14px;padding-top:11px;font-size:11px;color:#737a98}.total b{float:right;color:#303867}.plannerCard{padding:18px 20px}.sectionHead{display:flex;align-items:center;justify-content:space-between;gap:10px}.sectionHead h2 span{color:#6737c8}.sectionHead a{color:#7048ce;text-decoration:none;font-size:11px;font-weight:800}.sectionHead small{color:#777d9a}.plannerStrip{display:grid;grid-template-columns:repeat(6,1fr);gap:11px;margin-top:15px}.plannerTile{height:145px;border:1px solid #e3e2ef;border-radius:12px;background:#f8f7fc;padding:14px;display:flex;flex-direction:column}.plannerTile b{font-size:21px;color:#273067}.plannerTile strong{font-size:13px;line-height:1.35;margin-top:9px;color:#303867}.plannerTile small{margin-top:auto;font-size:10px;color:#8a90aa;font-weight:800}.plannerTile.done{background:#f1f9f5;border-color:#d9eee3}.plannerTile.done small{color:#27a96f}.plannerTile.active{background:#fff6f1;border-color:#ff7046}.plannerTile.active small{color:#f2653c}.bottomGrid{display:grid;grid-template-columns:1.45fr 1fr;gap:16px}.projectsCard,.materialsCard,.eventsCard{padding:20px}.projectBody{display:flex;align-items:center;gap:15px;margin-top:15px}.projectImage{width:132px;height:122px;border-radius:12px;flex:0 0 auto;background:linear-gradient(145deg,#8db5a3,#4d6e7c 45%,#24385d);position:relative;overflow:hidden}.projectImage:before{content:"";position:absolute;left:13px;right:13px;bottom:16px;height:66px;background:linear-gradient(140deg,#6c9b75,#e7d39e);clip-path:polygon(0 100%,20% 40%,38% 65%,57% 10%,73% 55%,100% 20%,100% 100%)}.projectText{min-width:0}.projectText h3{margin:0;color:#20275f;font-size:16px}.projectText p{margin:8px 0 12px;color:#69718f;font-size:12px;line-height:1.4}.tags{display:flex;gap:5px;flex-wrap:wrap}.tags em{font-style:normal;background:#eee8ff;color:#5e38b5;padding:5px 8px;border-radius:10px;font-size:9px;font-weight:800}.roundArrow{margin-left:auto;border:0;width:38px;height:38px;border-radius:50%;background:#f0effa;color:#6134c2;font-size:20px}.materialRow{display:grid;grid-template-columns:34px 1fr auto;align-items:center;gap:9px;padding:12px 0;border-bottom:1px solid #eeeef5;font-size:11px;color:#28305f}.materialRow:last-child{border-bottom:0}.materialRow small{color:#7b829d}.materialIcon{width:32px;height:32px;border-radius:9px;display:grid;place-items:center;font-weight:900}.purpleBg{background:#eee8ff;color:#6639c2}.orangeBg{background:#fff0e7;color:#ff6b3e}.event{display:grid;grid-template-columns:40px 1fr 12px;gap:9px;align-items:center;padding:11px 0;border-bottom:1px solid #eeeef5}.event:last-child{border-bottom:0}.event>b{font-size:17px;color:#6034c2;line-height:1}.event>b small{font-size:9px}.event strong,.event small{display:block}.event strong{font-size:11px;color:#303867}.event small{margin-top:4px;color:#7a819d;font-size:10px}.secondaryGrid{display:grid;grid-template-columns:1.45fr 1fr;gap:16px}.submissionCard{padding:16px 20px}.feedbackCard,.quoteCard,.goalsCard{padding:20px}.submissionBody{margin-top:10px}.submissionBody h3{margin:0 0 7px;color:#20275f;font-size:17px}.submissionBody p{margin:0;color:#69718f;font-size:12px;line-height:1.5}.submissionButton{display:inline-block;margin-top:14px;border:0;border-radius:11px;padding:11px 15px;background:#6332c7;color:#fff;text-decoration:none;font:800 12px Inter,Arial,sans-serif;cursor:pointer}.submissionButton:disabled{opacity:.55;cursor:default}.submissionError{margin-top:12px;padding:9px 11px;border-radius:9px;background:#fff1ee;color:#b64b3b;font-size:11px;font-weight:700}.feedback{display:flex;gap:12px;margin-top:15px}.avatar{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#b68c8c,#5e577c);color:#fff;font-weight:900;flex:0 0 auto}.feedback b{font-size:12px;color:#20275f}.feedback p{margin:6px 0 8px;color:#69718f;font-size:11px;line-height:1.45}.feedback a{font-size:11px;color:#6332c7;font-weight:800;text-decoration:none}.quoteCard{background:#fff3eb;border-color:#f4ded1;display:flex;flex-direction:column;justify-content:center}.quoteCard p{font:italic 17px/1.45 Georgia,serif;color:#49384e;margin:0}.quoteCard b{margin-top:13px;text-align:right;color:#6332c7;font-size:11px}.achievement{display:flex;gap:8px;align-items:flex-start;margin-top:12px;color:#5d6685;font-size:10px;line-height:1.35}.achievement:first-of-type{margin-top:16px}.achievement{color:#29ad76;font-weight:900}.achievement span{color:#5d6685;font-weight:500}.achievement.locked{color:#8c93ab}.achievement.locked span{color:#7c839d}@media(max-width:1100px){.topGrid{grid-template-columns:1fr}.progressCard{display:grid;grid-template-columns:1fr 190px;gap:12px}.progressCard h2{grid-column:1/-1}.progressRing{grid-row:2/5}.plannerStrip{grid-template-columns:repeat(3,1fr)}.bottomGrid,.secondaryGrid{grid-template-columns:1fr 1fr}.eventsCard{grid-column:1/-1}}@media(max-width:700px){.hero{height:420px}.heroCopy{left:24px;top:30px}.heroCopy h1{font-size:32px}.heroWords{right:20px;top:26px;font-size:15px}.plannerStrip{grid-template-columns:repeat(2,1fr)}.bottomGrid,.secondaryGrid{grid-template-columns:1fr}.eventsCard{grid-column:auto}.progressCard{display:block}.progressRing{margin:12px auto}.projectBody{align-items:flex-start}.projectImage{width:105px;height:100px}}
  `}</style>
 </CabinetShell>
}
