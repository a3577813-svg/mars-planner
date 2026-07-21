"use client";

import Link from "next/link";
import {useEffect,useState} from "react";

const route=[
 {n:1,title:"Моя экспедиция к идее",status:"current"},
 {n:2,title:"Сканирование локации",status:"next"},
 {n:3,title:"Моё состояние и впечатления",status:"next"},
 {n:4,title:"Путевой лист",status:"next"},
 {n:5,title:"Рефлексия экспедиции",status:"next"}
];

const firstSpreadKeys=["p1-project","p1-spark","p1-success","p1-notyet","p1-role","p1-role-next","p1-important"];

export default function StudentDashboard(){
 const[filled,setFilled]=useState(0);
 useEffect(()=>{
  const refresh=()=>setFilled(firstSpreadKeys.filter(key=>(localStorage.getItem(`mars-book-${key}`)||"").trim().length>0).length);
  refresh();window.addEventListener("focus",refresh);return()=>window.removeEventListener("focus",refresh)
 },[]);
 const spreadProgress=Math.round((filled/firstSpreadKeys.length)*100);
 const started=filled>0?1:0;
 const completed=filled===firstSpreadKeys.length?1:0;
 return <main className="studentCabinet">
  <header className="cabinetHeader">
   <div className="brand"><img src="/mars-logo.svg" alt="МАРС"/><div><b>ПРОЕКТИРУЕМ БУДУЩЕЕ</b><span>Личный кабинет ученика</span></div></div>
   <div className="identity"><div><strong>5–7 уровни</strong><span>7 уровень · 2026/27</span></div><Link href="/">Выйти</Link></div>
  </header>

  <section className="cabinetMain">
   <div className="hero">
    <div><p className="eyebrow">ТВОЙ ЛИЧНЫЙ МАРШРУТ</p><h1>Продолжим проектное путешествие?</h1><p>Планёрка сохраняет твои идеи, решения и открытия на каждом этапе.</p><Link className="primary" href="/book">Продолжить планёрку <span>→</span></Link></div>
    <div className="progress"><div className="ring" style={{background:`conic-gradient(#ff6547 ${Math.max(spreadProgress,3)}%,#ffffff2d 0)`}}><strong>1</strong><span>из 33</span></div><b>Текущий разворот</b><small>{spreadProgress}% заполнено</small></div>
   </div>

   <div className="dashboardGrid">
    <section className="routeCard">
     <div className="cardTitle"><div><p className="eyebrow">ПЛАНЁРКА</p><h2>Мой маршрут</h2></div><span>{spreadProgress}% первого разворота</span></div>
     <div className="routeList">{route.map(item=><Link key={item.n} href={item.n===1?"/book":"#"} className={item.status}><span className="num">{String(item.n).padStart(2,"0")}</span><div><b>{item.title}</b><small>{item.status==="current"?(filled?"В работе":"Открыт сейчас"):"Будет доступен дальше"}</small></div><span className="arrow">→</span></Link>)}</div>
    </section>

    <aside className="side">
     <section className="panel accent"><p className="eyebrow">СЕЙЧАС В ФОКУСЕ</p><h3>Разворот 01</h3><p>Зафиксируй первую версию идеи, свою роль и первые шаги команды.</p><Link href="/book">Открыть разворот</Link></section>
     <section className="panel"><p className="eyebrow">КОММЕНТАРИЙ ТЬЮТОРА</p><h3>Пока нет новых комментариев</h3><p>Когда тьютор оставит заметку, она появится здесь и на полях планёрки.</p></section>
     <section className="stats"><div><strong>{started}</strong><span>начат</span></div><div><strong>{completed}</strong><span>завершено</span></div><div><strong>{33-completed}</strong><span>впереди</span></div></section>
    </aside>
   </div>
  </section>

  <style jsx global>{`
   *{box-sizing:border-box}body{margin:0;font-family:Inter,Arial,sans-serif;background:#f7f4fb;color:#2e2440}.studentCabinet{min-height:100vh;background:radial-gradient(circle at 7% 8%,#fff1e9 0,transparent 28%),radial-gradient(circle at 94% 12%,#eee5ff 0,transparent 30%),#f8f6fb}.cabinetHeader{height:78px;padding:0 34px;background:#ffffffdf;backdrop-filter:blur(18px);border-bottom:1px solid #e9e2ef;display:flex;align-items:center;justify-content:space-between}.brand{display:flex;align-items:center;gap:15px}.brand img{width:80px}.brand div,.identity div{display:grid;gap:3px}.brand b{font-size:10px;letter-spacing:.15em;color:#ff5c3b}.brand span{font-size:14px;font-weight:800;color:#5530a4}.identity{display:flex;align-items:center;gap:18px}.identity div{text-align:right}.identity strong{color:#442573}.identity span{font-size:12px;color:#8b8295}.identity a{padding:9px 13px;border-radius:13px;background:#f0e9fa;color:#5b2cb8;text-decoration:none;font-weight:800}.cabinetMain{max-width:1320px;margin:auto;padding:42px 32px 70px}.hero{background:linear-gradient(125deg,#4e20a7,#6d2ed0 65%,#7d38dc);color:#fff;border-radius:34px;padding:38px 44px;display:grid;grid-template-columns:1fr 250px;align-items:center;box-shadow:0 28px 70px #4b229326;overflow:hidden;position:relative}.hero:after{content:"";position:absolute;width:380px;height:380px;border:2px dashed #ffffff24;border-radius:50%;right:-100px;top:-170px}.eyebrow{margin:0 0 8px;font-size:11px;font-weight:900;letter-spacing:.14em;color:#7954bd}.hero .eyebrow{color:#ffb39b}.hero h1{font-size:clamp(34px,5vw,58px);line-height:1.02;letter-spacing:-.04em;margin:0 0 14px}.hero p{max-width:650px;color:#ece3ff;line-height:1.5}.primary{display:inline-flex;align-items:center;gap:16px;margin-top:12px;padding:14px 18px;border-radius:15px;background:#ff5b3c;color:#fff;text-decoration:none;font-weight:900;box-shadow:0 12px 28px #ff593a35}.progress{position:relative;z-index:2;text-align:center}.ring{width:160px;height:160px;border-radius:50%;margin:0 auto 12px;display:grid;place-content:center;box-shadow:inset 0 0 0 18px #5c25b8}.ring strong{font-size:42px}.ring span{font-size:12px;color:#dcd0f4}.progress b,.progress small{display:block}.progress small{margin-top:4px;color:#ded2f4}.dashboardGrid{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:24px;margin-top:24px}.routeCard,.panel,.stats{background:#fff;border:1px solid #ece5f2;border-radius:27px;box-shadow:0 18px 48px #3b2a5510}.routeCard{padding:27px}.cardTitle{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}.cardTitle h2{margin:0;color:#432172;font-size:29px}.cardTitle>span{background:#f2ecfa;color:#6b3bc4;padding:8px 12px;border-radius:999px;font-size:12px;font-weight:800}.routeList{display:grid;gap:9px}.routeList a{display:flex;align-items:center;gap:13px;padding:14px;border:1px solid #eee7f3;border-radius:18px;text-decoration:none;color:#4e4657;background:#fcfbfd}.routeList a.current{background:#fff4ef;border-color:#ffd3c5}.routeList a.next{opacity:.68}.num{width:42px;height:42px;border-radius:13px;background:#f0e9fa;color:#6633bf;display:grid;place-items:center;font-weight:900}.routeList a.current .num{background:#ffdfd5;color:#d84a2e}.routeList div{display:grid;gap:3px;flex:1}.routeList small{color:#8b8294}.arrow{font-weight:900;color:#ff5a39}.side{display:grid;gap:16px;align-content:start}.panel{padding:23px}.panel h3{margin:4px 0 8px;color:#442172;font-size:22px}.panel p{line-height:1.45;color:#756d7d}.panel a{display:inline-block;margin-top:8px;padding:10px 13px;border-radius:12px;background:#5e2abb;color:#fff;text-decoration:none;font-weight:800}.accent{background:linear-gradient(145deg,#fff3ed,#fff);border-color:#ffd7ca}.stats{padding:12px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.stats div{background:#f7f3fb;border-radius:15px;padding:12px 8px;text-align:center}.stats strong{display:block;color:#5c2eb3;font-size:22px}.stats span{font-size:10px;color:#857c8e}@media(max-width:900px){.dashboardGrid{grid-template-columns:1fr}.side{grid-template-columns:1fr 1fr}.stats{grid-column:1/-1}.hero{grid-template-columns:1fr 210px}}@media(max-width:650px){.cabinetHeader{padding:0 16px}.brand div,.identity div{display:none}.cabinetMain{padding:22px 14px 50px}.hero{grid-template-columns:1fr;padding:28px}.progress{margin-top:28px}.side{grid-template-columns:1fr}.stats{grid-column:auto}.hero h1{font-size:36px}}
  `}</style>
 </main>
}