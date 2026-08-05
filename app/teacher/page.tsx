"use client";

import Link from "next/link";
import {useEffect,useMemo,useState} from "react";

type Student={id:"student7"|"student8";name:string;level:string;total:number;currentKey:string;prefixes:string[]};
type Summary={started:number;done:number;progress:number;current:number;attachments:number};

const students:Student[]=[
 {id:"student7",name:"Ученик 5–7 уровней",level:"5–7 уровни",total:38,currentKey:"mars-book-current-page",prefixes:["mars-book-p","mars-planner-attachment:middle-"]},
 {id:"student8",name:"Ученик 8–11 уровней",level:"8–11 уровни",total:45,currentKey:"mars-senior-current-page",prefixes:["mars-senior-shared-p","mars-senior-p","mars-planner-attachment:senior-"]}
];

function summarize(student:Student):Summary{
 const perPage=new Map<number,{count:number;substantial:number}>();
 let attachments=0;
 for(let i=0;i<localStorage.length;i++){
  const key=localStorage.key(i)||"";
  const value=(localStorage.getItem(key)||"").trim();
  if(!value)continue;
  if(key.startsWith("mars-planner-attachment:")){
   if(key.includes(student.id==="student7"?"middle-":"senior-")&&key.endsWith(":image"))attachments++;
   continue;
  }
  let page=0;
  if(student.id==="student7")page=Number(key.match(/^mars-book-p(\d+)-/)?.[1]||0);
  else page=Number(key.match(/^mars-senior-(?:shared-)?p(\d+)-/)?.[1]||0);
  if(!page)continue;
  const item=perPage.get(page)||{count:0,substantial:0};
  item.count++;
  if(value.length>=18)item.substantial++;
  perPage.set(page,item);
 }
 let started=0,done=0;
 perPage.forEach(item=>{started++;if(item.count>=3||item.substantial>=2)done++});
 const current=Math.min(student.total,Math.max(1,Number(localStorage.getItem(student.currentKey)||1)||1));
 return{started,done,current,attachments,progress:Math.round(done/student.total*100)};
}

export default function TeacherPage(){
 const[summaries,setSummaries]=useState<Record<string,Summary>>({});
 const[filter,setFilter]=useState<"all"|"middle"|"senior">("all");
 const refresh=()=>setSummaries(Object.fromEntries(students.map(s=>[s.id,summarize(s)])));
 useEffect(()=>{refresh();window.addEventListener("focus",refresh);window.addEventListener("storage",refresh);return()=>{window.removeEventListener("focus",refresh);window.removeEventListener("storage",refresh)}},[]);
 const visible=useMemo(()=>students.filter(s=>filter==="all"||(filter==="middle"?s.id==="student7":s.id==="student8")),[filter]);
 const average=visible.length?Math.round(visible.reduce((sum,s)=>sum+(summaries[s.id]?.progress||0),0)/visible.length):0;
 return <main className="teacherPage">
  <header><div className="brand"><img src="/mars-logo.svg" alt="МАРС"/><div><b>ПРОЕКТИРУЕМ БУДУЩЕЕ</b><span>Кабинет тьютора</span></div></div><div className="identity"><strong>Педагог МАРС</strong><Link href="/">Выйти</Link></div></header>
  <section className="teacherWrap">
   <div className="teacherHero"><div><p>МОДУЛЬ «ЖИВАЯ ПЛАНЁРКА»</p><h1>Маршруты учеников</h1><span>Здесь видно, кто начал работу, где нужна поддержка и к какому развороту ученик возвращался последним.</span></div><div className="teacherMetric"><strong>{average}%</strong><span>среднее заполнение</span></div></div>
   <div className="teacherToolbar"><div><button className={filter==="all"?"active":""} onClick={()=>setFilter("all")}>Все</button><button className={filter==="middle"?"active":""} onClick={()=>setFilter("middle")}>5–7</button><button className={filter==="senior"?"active":""} onClick={()=>setFilter("senior")}>8–11</button></div><button onClick={refresh}>Обновить данные</button></div>
   <section className="studentTable">
    <div className="tableHead"><span>Ученик</span><span>Прогресс</span><span>Развороты</span><span>Вложения</span><span></span></div>
    {visible.map(student=>{const s=summaries[student.id]||{started:0,done:0,progress:0,current:1,attachments:0};return <article key={student.id}>
     <div className="studentName"><span>{student.id==="student7"?"57":"811"}</span><div><b>{student.name}</b><small>{student.level}</small></div></div>
     <div className="progressCell"><div><span style={{width:`${s.progress}%`}}/></div><b>{s.progress}%</b></div>
     <div className="statCell"><b>{s.done}</b><small>заполнено · {s.started-s.done} в процессе</small></div>
     <div className="statCell"><b>{s.attachments}</b><small>фото и рисунки</small></div>
     <Link href={`/teacher/student?student=${student.id}`}>Открыть →</Link>
    </article>})}
   </section>
   <p className="teacherNote">Сейчас кабинет показывает данные демо-учеников, сохранённые в этом браузере. Подключение общей базы данных станет отдельным техническим этапом перед реальным запуском.</p>
  </section>
  <style jsx global>{`
   *{box-sizing:border-box}body{margin:0;font-family:Inter,Arial,sans-serif;background:#f7f5fa;color:#33263f}.teacherPage{min-height:100vh;background:radial-gradient(circle at 8% 5%,#fff3ed 0,transparent 24%),radial-gradient(circle at 92% 6%,#eee6ff 0,transparent 26%),#f7f5fa}.teacherPage header{height:78px;padding:0 34px;display:flex;align-items:center;justify-content:space-between;background:#ffffffdf;border-bottom:1px solid #e9e1ef}.brand{display:flex;align-items:center;gap:14px}.brand img{width:80px}.brand div{display:grid;gap:3px}.brand b{font-size:10px;letter-spacing:.15em;color:#ff5c3b}.brand span{font-weight:800;color:#5530a4}.identity{display:flex;align-items:center;gap:14px}.identity a{padding:9px 13px;border-radius:12px;background:#eee7f8;color:#5b2aac;text-decoration:none;font-weight:800}.teacherWrap{max-width:1280px;margin:auto;padding:40px 28px 70px}.teacherHero{display:grid;grid-template-columns:1fr 220px;gap:24px;align-items:center;padding:34px 38px;border:1px solid #e8e0ef;border-radius:30px;background:linear-gradient(135deg,#fff,#faf7ff 60%,#fff1ea);box-shadow:0 20px 56px #3b2a5510}.teacherHero p{margin:0 0 8px;font-size:11px;letter-spacing:.14em;font-weight:900;color:#7650ad}.teacherHero h1{margin:0 0 12px;font-size:48px;letter-spacing:-.04em;color:#3b2255}.teacherHero span{color:#716778;line-height:1.5}.teacherMetric{padding:22px;border-radius:22px;background:#fff;border:1px solid #e9e1ef;text-align:center}.teacherMetric strong{display:block;font-size:42px;color:#5e2abb}.teacherMetric span{font-size:12px}.teacherToolbar{display:flex;justify-content:space-between;gap:16px;margin:22px 0}.teacherToolbar>div{display:flex;gap:8px}.teacherToolbar button{border:1px solid #e0d6ea;border-radius:12px;padding:10px 14px;background:#fff;color:#5b2aac;font-weight:800;cursor:pointer}.teacherToolbar button.active{background:#5e2abb;color:#fff;border-color:#5e2abb}.studentTable{overflow:hidden;border:1px solid #e8e0ef;border-radius:24px;background:#fff;box-shadow:0 18px 46px #3b2a550d}.tableHead,.studentTable article{display:grid;grid-template-columns:1.5fr 1.2fr 1fr .8fr auto;gap:18px;align-items:center;padding:16px 20px}.tableHead{background:#f7f2fb;color:#796d82;font-size:11px;font-weight:900;letter-spacing:.08em}.studentTable article{border-top:1px solid #eee7f3}.studentName{display:flex;align-items:center;gap:12px}.studentName>span{width:44px;height:44px;display:grid;place-items:center;border-radius:14px;background:#f0e8fa;color:#5e2abb;font-weight:900}.studentName div,.statCell{display:grid;gap:3px}.studentName small,.statCell small{color:#877d8e}.progressCell{display:flex;align-items:center;gap:10px}.progressCell>div{flex:1;height:9px;border-radius:999px;background:#eee8f2;overflow:hidden}.progressCell span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#5e2abb,#ff6547)}.studentTable article>a{padding:10px 13px;border-radius:12px;background:#5e2abb;color:#fff;text-decoration:none;font-weight:800}.teacherNote{margin-top:16px;padding:14px 16px;border-radius:14px;background:#fff5ee;color:#765548;font-size:13px}@media(max-width:850px){.teacherHero{grid-template-columns:1fr}.tableHead{display:none}.studentTable article{grid-template-columns:1fr 1fr}.studentTable article>a{justify-self:start}.teacherMetric{max-width:220px}}@media(max-width:560px){.teacherPage header{padding:0 16px}.brand div,.identity strong{display:none}.teacherWrap{padding:22px 14px 50px}.teacherHero{padding:26px}.teacherHero h1{font-size:36px}.teacherToolbar{align-items:flex-start;flex-direction:column}.studentTable article{grid-template-columns:1fr}.progressCell{max-width:280px}}
  `}</style>
 </main>;
}
