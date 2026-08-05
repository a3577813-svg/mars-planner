"use client";

import Link from "next/link";
import {useEffect,useMemo,useState} from "react";

type Summary={group:string;total:number;done:number;started:number;attachments:number;progress:number};

function scan(group:"middle"|"senior",total:number):Summary{
  const perPage=new Map<number,{count:number;substantial:number}>();
  let attachments=0;
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i)||"";
    const value=(localStorage.getItem(key)||"").trim();
    if(!value)continue;
    if(key.startsWith("mars-planner-attachment:")){
      if(key.includes(group==="middle"?"middle-":"senior-")&&key.endsWith(":image"))attachments++;
      continue;
    }
    const match=group==="middle"?key.match(/^mars-book-p(\d+)-/):key.match(/^mars-senior-(?:shared-)?p(\d+)-/);
    const page=Number(match?.[1]||0);
    if(!page||page>total)continue;
    const item=perPage.get(page)||{count:0,substantial:0};
    item.count++;
    if(value.length>=18)item.substantial++;
    perPage.set(page,item);
  }
  let started=0,done=0;
  perPage.forEach(item=>{started++;if(item.count>=3||item.substantial>=2)done++});
  return{group:group==="middle"?"5–7 уровни":"8–11 уровни",total,done,started,attachments,progress:Math.round(done/total*100)};
}

const permissions=[
  {role:"Ученик",see:"Только свою планёрку",do:"Заполнять, загружать фото и рисунки, скачивать PDF"},
  {role:"Тьютор",see:"Только закреплённых учеников",do:"Смотреть развороты, комментировать, ставить статус проверки"},
  {role:"Методист",see:"Все группы и обезличенную аналитику",do:"Смотреть содержание и качество заполнения, анализировать шаблоны и календарь"},
  {role:"Администратор",see:"Всех пользователей и настройки",do:"Управлять доступами, ролями, назначениями, календарём и шаблонами"}
];

export default function MethodistPage(){
  const[data,setData]=useState<Summary[]>([]);
  const refresh=()=>setData([scan("middle",38),scan("senior",45)]);
  useEffect(()=>{refresh();window.addEventListener("focus",refresh);window.addEventListener("storage",refresh);return()=>{window.removeEventListener("focus",refresh);window.removeEventListener("storage",refresh)}},[]);
  const average=useMemo(()=>data.length?Math.round(data.reduce((s,x)=>s+x.progress,0)/data.length):0,[data]);
  return <main className="methodistPage">
    <header><div className="brand"><img src="/mars-logo.svg" alt="МАРС"/><div><b>ПРОЕКТИРУЕМ БУДУЩЕЕ</b><span>Кабинет методиста</span></div></div><div className="identity"><strong>Методист МАРС</strong><Link href="/">Выйти</Link></div></header>
    <section className="methodistWrap">
      <div className="hero"><div><p>МОДУЛЬ «ЖИВАЯ ПЛАНЁРКА»</p><h1>Методический обзор</h1><span>Здесь видна общая картина по двум версиям планёрки без изменения ученических ответов и без управления доступами.</span></div><div className="metric"><b>{average}%</b><small>среднее заполнение</small></div></div>
      <section className="groupCards">{data.map(item=><article key={item.group}><div><p>ВЕРСИЯ ПЛАНЁРКИ</p><h2>{item.group}</h2></div><div className="numbers"><span><b>{item.progress}%</b><small>заполнено</small></span><span><b>{item.done}</b><small>готово</small></span><span><b>{item.started-item.done}</b><small>в процессе</small></span><span><b>{item.attachments}</b><small>вложений</small></span></div><div className="track"><span style={{width:`${item.progress}%`}}/></div><small>{item.done} из {item.total} разворотов определены как заполненные</small></article>)}</section>
      <div className="methodGrid"><section className="panel"><p>МЕТОДИЧЕСКИЕ ЗАДАЧИ</p><h2>Что доступно методисту</h2><div className="taskList"><article><b>Сравнение версий</b><span>Проверять логику, последовательность и нагрузку планёрок 5–7 и 8–11.</span></article><article><b>Анализ заполнения</b><span>Видеть, на каких разворотах ученики чаще останавливаются или оставляют мало данных.</span></article><article><b>Контроль календаря</b><span>Сверять развороты с событиями учебного года и готовить предложения администратору.</span></article><article><b>Рекомендации</b><span>Формулировать изменения шаблонов, не редактируя ответы детей и назначения тьюторов.</span></article></div></section>
      <section className="panel"><p>СИСТЕМА ДОСТУПОВ</p><h2>Роли и права</h2><div className="roleTable">{permissions.map(item=><article key={item.role}><b>{item.role}</b><span>{item.see}</span><small>{item.do}</small></article>)}</div></section></div>
      <p className="note">Сейчас данные хранятся локально в браузере. Роли уже разделены на уровне интерфейса, но для реального запуска потребуется серверная авторизация и проверка прав на стороне базы данных.</p>
    </section>
    <style jsx global>{`*{box-sizing:border-box}body{margin:0;font-family:Inter,Arial,sans-serif;background:#f7f5fa;color:#33263f}.methodistPage{min-height:100vh;background:radial-gradient(circle at 8% 5%,#fff3ed 0,transparent 24%),radial-gradient(circle at 92% 6%,#eee6ff 0,transparent 26%),#f7f5fa}.methodistPage header{height:78px;padding:0 34px;display:flex;align-items:center;justify-content:space-between;background:#ffffffdf;border-bottom:1px solid #e9e1ef}.brand{display:flex;align-items:center;gap:14px}.brand img{width:80px}.brand div{display:grid;gap:3px}.brand b{font-size:10px;letter-spacing:.15em;color:#ff5c3b}.brand span{font-weight:800;color:#5530a4}.identity{display:flex;align-items:center;gap:14px}.identity a{padding:9px 13px;border-radius:12px;background:#eee7f8;color:#5b2aac;text-decoration:none;font-weight:800}.methodistWrap{max-width:1280px;margin:auto;padding:40px 28px 70px}.hero{display:grid;grid-template-columns:1fr 210px;gap:24px;align-items:center;padding:34px 38px;border:1px solid #e8e0ef;border-radius:30px;background:linear-gradient(135deg,#fff,#faf7ff 60%,#fff1ea);box-shadow:0 20px 56px #3b2a5510}.hero p,.panel>p,.groupCards p{margin:0 0 8px;font-size:11px;letter-spacing:.14em;font-weight:900;color:#7650ad}.hero h1{margin:0 0 12px;font-size:46px;letter-spacing:-.04em;color:#3b2255}.hero span{color:#716778;line-height:1.5}.metric{padding:22px;border:1px solid #e9e1ef;border-radius:22px;background:#fff;text-align:center}.metric b{display:block;font-size:42px;color:#5e2abb}.metric small{color:#817688}.groupCards{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:22px}.groupCards>article,.panel{padding:22px;border:1px solid #e8e0ef;border-radius:23px;background:#fff;box-shadow:0 16px 42px #3b2a550d}.groupCards h2,.panel h2{margin:0 0 14px;color:#432172}.numbers{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.numbers span{padding:12px;border-radius:14px;background:#faf7fd}.numbers b,.numbers small{display:block}.numbers b{font-size:22px;color:#5e2abb}.numbers small{font-size:10px;color:#817688}.track{height:9px;margin:14px 0 8px;border-radius:999px;background:#eee8f2;overflow:hidden}.track span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#5e2abb,#ff6547)}.groupCards>article>small{color:#817688}.methodGrid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px}.taskList,.roleTable{display:grid;gap:9px}.taskList article,.roleTable article{padding:13px;border-radius:15px;background:#faf8fc}.taskList b,.taskList span,.roleTable b,.roleTable span,.roleTable small{display:block}.taskList span,.roleTable span{margin-top:4px;color:#6f6578;line-height:1.4}.roleTable small{margin-top:3px;color:#8a8090}.note{margin-top:16px;padding:14px 16px;border-radius:14px;background:#fff5ee;color:#765548;font-size:13px}@media(max-width:850px){.hero{grid-template-columns:1fr}.groupCards,.methodGrid{grid-template-columns:1fr}.metric{max-width:220px}}@media(max-width:560px){.methodistPage header{padding:0 16px}.brand div,.identity strong{display:none}.methodistWrap{padding:22px 14px 50px}.hero{padding:25px}.hero h1{font-size:34px}.numbers{grid-template-columns:repeat(2,1fr)}}`}</style>
  </main>;
}
