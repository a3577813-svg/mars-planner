"use client";

import {FormEvent,useEffect,useState} from "react";
import {templates,templateForLevel,Section} from "./plannerData";

type Role="student"|"teacher"|"admin";
type Account={login:string;password:string;name:string;role:Role;level?:number};
type PageData=Record<string,string>;
type PlannerStore=Record<string,Record<number,PageData>>;
type Profile={name:string;level:number;year:string};
type StudentView="dashboard"|"planner";
type StageStatus="empty"|"progress"|"done";

const accounts:Account[]=[
 {login:"student7",password:"1234",name:"5–7 уровни",role:"student",level:7},
 {login:"student8",password:"1234",name:"8–11 уровни",role:"student",level:8},
 {login:"teacher",password:"1234",name:"Педагог МАРС",role:"teacher"},
 {login:"admin",password:"1234",name:"Администратор МАРС",role:"admin"}
];
const initialProfiles:Record<string,Profile>={
 student7:{name:"5–7 уровни",level:7,year:"2026/27"},
 student8:{name:"8–11 уровни",level:8,year:"2026/27"}
};
const plannerKey=(login:string,year:string,level:number)=>`${login}:${year}:L${level}`;
const value=(d:PageData,k:string)=>d[k]??"";

function Field({label,value:val,readOnly,onChange}:{label:string;value:string;readOnly:boolean;onChange:(x:string)=>void}){
 return <label className="field questionCard"><span>{label}</span><textarea rows={label.length>38?4:3} value={val} readOnly={readOnly} onChange={e=>onChange(e.target.value)} placeholder={readOnly?"":"Запиши свои мысли…"}/></label>
}

function FormPage({sections,data,readOnly,set}:{sections:Section[];data:PageData;readOnly:boolean;set:(k:string,x:string)=>void}){
 return <div className="formSections">{sections.map((s,si)=><section className="sectionCard" key={s.title}><div className="sectionTitle"><span>{String(si+1).padStart(2,"0")}</span><h2>{s.title}</h2></div>{s.fields.map((f,i)=><Field key={f} label={f} value={value(data,`s${si}f${i}`)} readOnly={readOnly} onChange={x=>set(`s${si}f${i}`,x)}/>)}</section>)}</div>
}

export default function Home(){
 const[account,setAccount]=useState<Account|null>(null);
 const[login,setLogin]=useState("");
 const[password,setPassword]=useState("");
 const[error,setError]=useState("");
 const[profiles,setProfiles]=useState<Record<string,Profile>>(initialProfiles);
 const[selectedStudent,setSelectedStudent]=useState("student7");
 const[page,setPage]=useState(1);
 const[store,setStore]=useState<PlannerStore>({});
 const[saved,setSaved]=useState(false);
 const[studentView,setStudentView]=useState<StudentView>("dashboard");

 useEffect(()=>{try{const p=localStorage.getItem("mars-profiles-v1");if(p)setProfiles(JSON.parse(p));const s=localStorage.getItem("mars-planners-v1");if(s)setStore(JSON.parse(s));else{const old=localStorage.getItem("mars-planner-v4");if(old)setStore({[plannerKey("student7","2026/27",7)]:JSON.parse(old)})}}catch{}},[]);
 useEffect(()=>{localStorage.setItem("mars-profiles-v1",JSON.stringify(profiles))},[profiles]);
 useEffect(()=>{if(!account)return;const t=setTimeout(()=>{localStorage.setItem("mars-planners-v1",JSON.stringify(store));setSaved(true);setTimeout(()=>setSaved(false),900)},450);return()=>clearTimeout(t)},[store,account]);

 function enter(e:FormEvent){e.preventDefault();const a=accounts.find(x=>x.login===login&&x.password===password);if(!a){setError("Проверьте логин и пароль");return}setAccount(a);setError("");if(a.role==="student")setSelectedStudent(a.login);setPage(1);setStudentView("dashboard")}
 function choose(x:string){setLogin(x);setPassword("1234");setError("")}
 function logout(){setAccount(null);setLogin("");setPassword("");setPage(1);setStudentView("dashboard")}

 if(!account)return <main className="loginScreen"><div className="orbit orbitOne"/><div className="orbit orbitTwo"/><div className="planet planetOrange"/><div className="planet planetPurple"/><section className="loginIntro"><img className="marsLogo" src="/mars-logo.svg" alt="МАРС"/><p className="loginEyebrow">ПРОЕКТИРУЕМ БУДУЩЕЕ</p><h1>Живая планёрка МАРС</h1><p className="loginTagline">Твой маршрут. Твои открытия. Твоё будущее.</p></section><section className="loginCard"><p className="loginWelcome">Добро пожаловать</p><h2>Вход в планёрку</h2><div className="roleSwitch"><button type="button" className={login==="student7"?"selected":""} onClick={()=>choose("student7")}>5–7 уровни</button><button type="button" className={login==="student8"?"selected":""} onClick={()=>choose("student8")}>8–11 уровни</button><button type="button" className={login==="teacher"?"selected":""} onClick={()=>choose("teacher")}>Педагог</button><button type="button" className={login==="admin"?"selected":""} onClick={()=>choose("admin")}>Администратор</button></div><form onSubmit={enter}><label>Логин<input value={login} onChange={e=>setLogin(e.target.value)}/></label><label>Пароль<input type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<p className="error">{error}</p>}<button className="loginButton">Войти</button></form><p style={{fontSize:12,opacity:.7}}>Демо-пароль: 1234</p></section></main>;

 const studentLogin=account.role==="student"?account.login:selectedStudent;
 const profile=profiles[studentLogin]||initialProfiles.student7;
 const template=templates[templateForLevel(profile.level)];
 const key=plannerKey(studentLogin,profile.year,profile.level);
 const planner=store[key]||{};
 const data=planner[page]||{};
 const readOnly=account.role!=="student";
 const spec=template.pages[page]||template.pages[1];
 const pageEntries=Object.entries(template.pages);
 const total=pageEntries.length;
 const set=(k:string,x:string)=>setStore(s=>({...s,[key]:{...(s[key]||{}),[page]:{...((s[key]||{})[page]||{}),[k]:x}}}));
 const history=Object.keys(store).filter(k=>k.startsWith(studentLogin+":")).map(k=>{const m=k.match(/:(\d{4}\/\d{2}):L(\d+)/);return m?{year:m[1],level:Number(m[2])}:null}).filter(Boolean) as {year:string;level:number}[];
 function promote(){const level=Math.min(11,profile.level+1),start=Number(profile.year.slice(0,4))+1,year=`${start}/${String((start+1)%100).padStart(2,"0")}`;setProfiles(p=>({...p,[studentLogin]:{...profile,level,year}}));setPage(1)}
 function stageStatus(num:number):StageStatus{const stage=template.pages[num];const stageData=planner[num]||{};const keys=stage.sections.flatMap((section,si)=>section.fields.map((_,fi)=>`s${si}f${fi}`));const completed=keys.filter(k=>value(stageData,k).trim().length>0).length;if(completed===0)return"empty";if(completed===keys.length)return"done";return"progress"}
 const statuses=pageEntries.map(([n])=>({num:Number(n),status:stageStatus(Number(n))}));
 const startedPages=statuses.filter(x=>x.status!=="empty").length;
 const completedPages=statuses.filter(x=>x.status==="done").length;
 const inProgressPages=statuses.filter(x=>x.status==="progress").length;
 const progress=Math.round((completedPages/Math.max(total,1))*100);
 const focusPage=statuses.find(x=>x.status!=="done")?.num||total;
 const focusSpec=template.pages[focusPage]||spec;
 let lastMentorComment="";
 for(let i=total;i>=1;i--){const comment=value(planner[i]||{},"teacherComment").trim();if(comment){lastMentorComment=comment;break}}
 const routeIcons=["🚀","🪞","🎯","📚","💡","🤝","⭐","🌍","🏁","🧭","✨","🪐"];
 const statusLabel=(status:StageStatus)=>status==="done"?"Завершён":status==="progress"?"В работе":"Не начат";

 if(account.role==="admin")return <main className="appShell"><header><div><strong>МАРС</strong><span>Администрирование</span></div><nav><span>{account.name}</span><button onClick={logout}>Выйти</button></nav></header><div className="workspace"><aside><p className="eyebrow">УЧЕНИКИ</p>{Object.entries(profiles).map(([id,p])=><button key={id} className={selectedStudent===id?"active":""} onClick={()=>setSelectedStudent(id)}><span>{p.level}</span>{p.name}</button>)}</aside><section className="plannerPage"><div className="pageTop"><div><p className="eyebrow">УЧЁТНАЯ ЗАПИСЬ</p><h1>{profile.name}</h1></div></div><div className="sheet twoCol"><section><h2>Текущие данные</h2><Field label="Имя ученика" value={profile.name} readOnly={false} onChange={x=>setProfiles(p=>({...p,[studentLogin]:{...profile,name:x}}))}/><label className="field"><span>Уровень</span><select value={profile.level} onChange={e=>setProfiles(p=>({...p,[studentLogin]:{...profile,level:Number(e.target.value)}}))}>{[5,6,7,8,9,10,11].map(n=><option key={n}>{n}</option>)}</select></label><Field label="Учебный год" value={profile.year} readOnly={false} onChange={x=>setProfiles(p=>({...p,[studentLogin]:{...profile,year:x}}))}/><p><b>Шаблон:</b> {template.label}, {template.levels}</p><button className="loginButton" onClick={promote}>Перевести на следующий уровень</button></section><section><h2>История планёрок</h2>{history.length?history.map((h,i)=><p key={i}>{h.year} — {h.level} уровень — {templateForLevel(h.level)==="middle"?"планёрка 5–7 уровней":"планёрка 8–11 уровней"}</p>):<p>История появится после первого заполнения.</p>}<p>При переводе создаётся новый экземпляр. Старые записи не перезаписываются.</p></section></div></section></div></main>;

 if(account.role==="student"&&studentView==="dashboard")return <main className="studentShell"><header className="studentHeader"><div className="brandBlock"><img src="/mars-logo.svg" alt="МАРС"/><div><b>ПРОЕКТИРУЕМ БУДУЩЕЕ</b><span>Живая планёрка</span></div></div><div className="studentIdentity"><div><strong>{profile.name}</strong><span>{profile.level} уровень · {profile.year}</span></div><button onClick={logout}>Выйти</button></div></header><div className="studentOrbit orbitA"/><div className="studentOrbit orbitB"/><section className="studentDashboard"><div className="welcomePanel"><div><p className="eyebrow purple">ТВОЙ ЛИЧНЫЙ МАРШРУТ</p><h1>Привет! Готов двигаться дальше?</h1><p>Здесь собраны твои цели, открытия и следующие шаги.</p><button className="primaryAction" onClick={()=>{setPage(focusPage);setStudentView("planner")}}>Продолжить маршрут <span>→</span></button></div><div className="progressPlanet"><div className="progressRing" style={{background:`conic-gradient(#ff5b3d ${progress*3.6}deg,#eee8f8 0)`}}><div><strong>{progress}%</strong><span>завершено</span></div></div><p>{completedPages} из {total} этапов завершено</p></div></div><div className="dashboardGrid"><section className="routeCard"><div className="cardHeading"><div><p className="eyebrow purple">МОЙ МАРШРУТ</p><h2>Этапы развития</h2></div><span>{progress}% завершено</span></div><div className="routeList">{pageEntries.map(([n,s],i)=>{const num=Number(n),status=stageStatus(num),isCurrent=num===focusPage;return <button key={n} className={`${status==="done"?"done":""} ${status==="progress"?"current":""} ${isCurrent?"current":""}`} onClick={()=>{setPage(num);setStudentView("planner")}}><span className="routeIcon">{routeIcons[i%routeIcons.length]}</span><span className="routeText"><b>Этап {n}</b><small>{s.title}</small><small>{statusLabel(status)}</small></span><span className="routeStatus">{status==="done"?"✓":status==="progress"?"…":"→"}</span></button>})}</div></section><aside className="studentSide"><section className="miniCard accentOrange"><p className="eyebrow">СЕЙЧАС В ФОКУСЕ</p><h3>{focusSpec.title}</h3><p>{stageStatus(focusPage)==="progress"?"Продолжи с того места, где остановился.":"Начни следующий этап своего маршрута."}</p><button onClick={()=>{setPage(focusPage);setStudentView("planner")}}>Открыть этап</button></section><section className="miniCard"><p className="eyebrow purple">ПРОГРЕСС</p><div className="stats"><div><strong>{completedPages}</strong><span>завершено</span></div><div><strong>{inProgressPages}</strong><span>в работе</span></div><div><strong>{total-startedPages}</strong><span>не начато</span></div></div></section><section className="miniCard mentorCard"><p className="eyebrow purple">💬 НАСТАВНИК</p><p>{lastMentorComment||"Комментарий появится здесь, когда наставник поделится обратной связью."}</p></section></aside></div></section></main>;

 return <main className={account.role==="student"?"studentPlannerShell":"appShell"}><header className={account.role==="student"?"studentHeader":""}><div className={account.role==="student"?"brandBlock":""}>{account.role==="student"?<><img src="/mars-logo.svg" alt="МАРС"/><div><b>ПРОЕКТИРУЕМ БУДУЩЕЕ</b><span>Живая планёрка</span></div></>:<><strong>МАРС</strong><span>Живая планёрка</span></>}</div><nav>{account.role==="teacher"&&<select value={selectedStudent} onChange={e=>{setSelectedStudent(e.target.value);setPage(1)}}>{Object.entries(profiles).map(([id,p])=><option key={id} value={id}>{p.name}</option>)}</select>}{account.role==="student"&&<button className="backDashboard" onClick={()=>setStudentView("dashboard")}>← В кабинет</button>}<span>{account.role==="student"?`${profile.name} · ${profile.level} уровень`:account.name}</span><button onClick={logout}>Выйти</button></nav></header><div className="workspace"><aside className={account.role==="student"?"routeSidebar":""}><p className="eyebrow">{account.role==="student"?"МОЙ МАРШРУТ":template.label.toUpperCase()}</p><h2>{profile.level} уровень · {profile.year}</h2><p style={{fontSize:12,opacity:.7}}>{template.levels}</p>{pageEntries.map(([n,s],i)=>{const status=stageStatus(Number(n));return <button className={page===Number(n)?"active":""} key={n} onClick={()=>setPage(Number(n))}><span>{account.role==="student"?routeIcons[i%routeIcons.length]:n}</span><span>{s.title}{account.role==="student"&&<small style={{display:"block",opacity:.7}}>{statusLabel(status)}</small>}</span></button>})}</aside><section className="plannerPage"><div className="pageTop"><div><p className="eyebrow">ЭТАП {page} ИЗ {total} · {profile.year}</p><h1>{spec.title}</h1><p>{template.title} · {profile.level} уровень</p></div><span className={saved?"save saved":"save"}>{saved?"Сохранено ✓":readOnly?"Режим просмотра":"Автосохранение"}</span></div>{account.role==="student"&&<div className="plannerProgress"><div style={{width:`${progress}%`}}/><span>{progress}% маршрута завершено</span></div>}<div className={account.role==="student"?"plannerContent":""}><FormPage sections={spec.sections} {...{data,readOnly,set}}/><section className="commentBox"><p className="eyebrow">💬 КОММЕНТАРИЙ НАСТАВНИКА</p>{account.role==="teacher"?<textarea value={value(data,"teacherComment")} onChange={e=>set("teacherComment",e.target.value)} placeholder="Поддерживающий комментарий ученику…"/>:<p>{value(data,"teacherComment")||"Наставник пока не оставил комментарий."}</p>}</section></div><div className="pageNav"><button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>← Предыдущий этап</button><button disabled={page===total} onClick={()=>setPage(p=>Math.min(total,p+1))}>Следующий этап →</button></div></section></div></main>;
}
