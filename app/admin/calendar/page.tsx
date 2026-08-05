"use client";

import Link from "next/link";
import {useEffect,useMemo,useState} from "react";

type EventItem={id:string;title:string;start:string;end?:string;icon:string};

const defaults:EventItem[]=[
 {id:"holiday-0901",title:"Праздник",start:"2026-09-01",icon:"🎉"},
 {id:"launch-0902",title:"Запускной интенсив",start:"2026-09-02",end:"2026-09-08",icon:"🚀"},
 {id:"bio-0909",title:"Биосмена",start:"2026-09-09",end:"2026-09-20",icon:"🌿"},
 {id:"academic-0909",title:"Академический трек",start:"2026-09-09",end:"2026-10-02",icon:"📚"},
 {id:"marsfest-1005",title:"МАРСФЕСТ",start:"2026-10-05",end:"2026-10-09",icon:"🎭"},
 {id:"break-1012",title:"Каникулы",start:"2026-10-12",end:"2026-10-16",icon:"🍂"},
 {id:"conference-1224",title:"Итоговая проектная конференция",start:"2026-12-24",icon:"🎤"},
 {id:"launch-0111",title:"Запускной интенсив",start:"2027-01-11",end:"2027-01-15",icon:"🚀"},
 {id:"marsfest-0215",title:"МАРСФЕСТ",start:"2027-02-15",end:"2027-02-19",icon:"🎭"},
 {id:"conference-0525",title:"Итоговая проектная конференция",start:"2027-05-25",icon:"🎤"},
 {id:"shifts-0601",title:"Образовательные смены",start:"2027-06-01",end:"2027-06-25",icon:"☀️"}
];

const key="mars-calendar-events";
const blank=():EventItem=>({id:`event-${Date.now()}`,title:"Новое событие",start:"2026-09-01",icon:"📌"});

export default function AdminCalendarPage(){
 const[events,setEvents]=useState<EventItem[]>(defaults);
 const[saved,setSaved]=useState(false);
 const[query,setQuery]=useState("");
 useEffect(()=>{try{const raw=localStorage.getItem(key);if(raw)setEvents(JSON.parse(raw))}catch{}},[]);
 const visible=useMemo(()=>events.filter(e=>e.title.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>a.start.localeCompare(b.start)),[events,query]);
 const update=(id:string,patch:Partial<EventItem>)=>setEvents(list=>list.map(item=>item.id===id?{...item,...patch}:item));
 const remove=(id:string)=>setEvents(list=>list.filter(item=>item.id!==id));
 const save=()=>{localStorage.setItem(key,JSON.stringify(events));window.dispatchEvent(new Event("mars-calendar-updated"));setSaved(true);setTimeout(()=>setSaved(false),1200)};
 const reset=()=>{setEvents(defaults);localStorage.removeItem(key)};
 return <main className="calendarAdmin"><header><div className="brand"><img src="/mars-logo.svg" alt="МАРС"/><div><b>ПРОЕКТИРУЕМ БУДУЩЕЕ</b><span>Календарь планёрки</span></div></div><div className="identity"><Link href="/admin">← Администрирование</Link><Link href="/">Выйти</Link></div></header><section className="calendarWrap"><div className="calendarHero"><div><p>УЧЕБНЫЙ ГОД 2026–2027</p><h1>События МАРС</h1><span>Добавляйте и редактируйте события, которые видят ученики в календаре личного кабинета.</span></div><strong>{events.length}</strong></div><div className="toolbar"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Поиск события"/><button onClick={()=>setEvents(list=>[...list,blank()])}>＋ Добавить событие</button><button className="reset" onClick={reset}>Вернуть исходные</button><button className="save" onClick={save}>{saved?"Сохранено ✓":"Сохранить календарь"}</button></div><section className="eventList"><div className="head"><span>Значок</span><span>Название</span><span>Начало</span><span>Окончание</span><span></span></div>{visible.map(item=><article key={item.id}><input className="icon" value={item.icon} onChange={e=>update(item.id,{icon:e.target.value})}/><input value={item.title} onChange={e=>update(item.id,{title:e.target.value})}/><input type="date" value={item.start} onChange={e=>update(item.id,{start:e.target.value})}/><input type="date" value={item.end||""} onChange={e=>update(item.id,{end:e.target.value||undefined})}/><button onClick={()=>remove(item.id)}>Удалить</button></article>)}</section><p className="note">Сейчас изменения сохраняются в этом браузере. После подключения общей базы календарь станет единым для всех пользователей.</p></section><style jsx global>{`*{box-sizing:border-box}body{margin:0;font-family:Inter,Arial,sans-serif;background:#f7f5fa;color:#33263f}.calendarAdmin{min-height:100vh;background:radial-gradient(circle at 8% 5%,#fff3ed 0,transparent 24%),radial-gradient(circle at 92% 6%,#eee6ff 0,transparent 26%),#f7f5fa}.calendarAdmin header{height:78px;padding:0 34px;display:flex;align-items:center;justify-content:space-between;background:#ffffffdf;border-bottom:1px solid #e9e1ef}.brand{display:flex;align-items:center;gap:14px}.brand img{width:80px}.brand div{display:grid;gap:3px}.brand b{font-size:10px;letter-spacing:.15em;color:#ff5c3b}.brand span{font-weight:800;color:#5530a4}.identity{display:flex;gap:10px}.identity a{padding:9px 13px;border-radius:12px;background:#eee7f8;color:#5b2aac;text-decoration:none;font-weight:800}.calendarWrap{max-width:1220px;margin:auto;padding:40px 28px 70px}.calendarHero{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:32px 36px;border:1px solid #e8e0ef;border-radius:30px;background:linear-gradient(135deg,#fff,#faf7ff 60%,#fff1ea);box-shadow:0 20px 56px #3b2a5510}.calendarHero p{margin:0 0 8px;font-size:11px;letter-spacing:.14em;font-weight:900;color:#7650ad}.calendarHero h1{margin:0 0 10px;font-size:46px;color:#3b2255}.calendarHero span{color:#716778}.calendarHero>strong{width:110px;height:110px;display:grid;place-items:center;border-radius:26px;background:#fff;color:#5e2abb;font-size:38px;border:1px solid #e9e1ef}.toolbar{display:grid;grid-template-columns:minmax(180px,1fr) auto auto auto;gap:10px;margin:22px 0}.toolbar input,.toolbar button,.eventList input,.eventList button{border:1px solid #dfd5e8;border-radius:11px;padding:10px 12px;background:#fff;font:inherit}.toolbar button,.eventList button{font-weight:800;color:#5e2abb;cursor:pointer}.toolbar .save{background:#5e2abb;color:#fff;border-color:#5e2abb}.toolbar .reset{color:#9b553f}.eventList{overflow:hidden;border:1px solid #e8e0ef;border-radius:24px;background:#fff;box-shadow:0 18px 46px #3b2a550d}.head,.eventList article{display:grid;grid-template-columns:80px 1.4fr 150px 150px auto;gap:12px;align-items:center;padding:14px 18px}.head{background:#f7f2fb;color:#796d82;font-size:11px;font-weight:900;letter-spacing:.08em}.eventList article{border-top:1px solid #eee7f3}.eventList .icon{text-align:center;font-size:20px}.eventList article button{color:#b44a37;background:#fff2ee}.note{margin-top:16px;padding:14px 16px;border-radius:14px;background:#fff5ee;color:#765548;font-size:13px}@media(max-width:850px){.toolbar{grid-template-columns:1fr 1fr}.head{display:none}.eventList article{grid-template-columns:80px 1fr 1fr}.eventList article input:nth-child(2){grid-column:2/4}.calendarHero{align-items:flex-start}}@media(max-width:560px){.calendarAdmin header{padding:0 14px}.brand div{display:none}.identity a:first-child{font-size:0}.identity a:first-child:after{content:"←";font-size:18px}.calendarWrap{padding:22px 14px 50px}.calendarHero{padding:24px;flex-direction:column}.calendarHero h1{font-size:34px}.toolbar{grid-template-columns:1fr}.eventList article{grid-template-columns:1fr}.eventList article input:nth-child(2){grid-column:auto}}`}</style></main>;
}
