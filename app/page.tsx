"use client";

import {FormEvent,useEffect,useMemo,useState} from "react";
import {templates,templateForLevel} from "./plannerData";

type Role="student"|"teacher"|"admin";
type Account={login:string;password:string;name:string;role:Role;level?:number};
type PageData=Record<string,string>;
type PlannerStore=Record<string,Record<number,PageData>>;
type Profile={name:string;level:number;year:string};

const demoAccounts:Account[]=[
 {login:"student7",password:"1234",name:"Алексей Мартынов",role:"student",level:7},
 {login:"student8",password:"1234",name:"Мария Соколова",role:"student",level:8},
 {login:"teacher",password:"1234",name:"Педагог МАРС",role:"teacher"},
 {login:"admin",password:"1234",name:"Администратор МАРС",role:"admin"}
];
const demoProfiles:Record<string,Profile>={student7:{name:"Алексей Мартынов",level:7,year:"2026/27"},student8:{name:"Мария Соколова",level:8,year:"2026/27"}};
const keyFor=(login:string,year:string,level:number)=>`${login}:${year}:L${level}`;
const v=(d:PageData,k:string)=>d[k]??"";

function Field({label,value,readOnly,onChange}:{label:string;value:string;readOnly:boolean;onChange:(x:string)=>void}){return <label className="field"><span>{label}</span><textarea rows={label.length>38?4:3} value={value} readOnly={readOnly} onChange={e=>onChange(e.target.value)}/></label>}
function PlannerPage({page,data,readOnly,set}:{page:number;data:PageData;readOnly:boolean;set:(k:string,x:string)=>void}){const spec=useMemo(()=>page,[page]);return <div className="sheet twoCol">{templates.middle.pages[1]&&Object.values((window as any).__dummy||{}).length===-1?null:null}{currentSections(spec).map((s,si)=><section key={s.title}><h2>{s.title}</h2>{s.fields.map((f,i)=><Field key={f} label={f} value={v(data,`s${si}f${i}`)} readOnly={readOnly} onChange={x=>set(`s${si}f${i}`,x)}/>)}</section>)}</div>}
let activeSections:any[]=[];
const currentSections=(_:number)=>activeSections;

export default function Home(){
 const[account,setAccount]=useState<Account|null>(null),[login,setLogin]=useState(""),[password,setPassword]=useState(""),[error,setError]=useState("");
 const[profiles,setProfiles]=useState<Record<string,Profile>>(demoProfiles),[selectedStudent,setSelectedStudent]=useState("student7"),[page,setPage]=useState(1),[store,setStore]=useState<PlannerStore>({}),[saved,setSaved]=useState(false);
 useEffect(()=>{try{const p=localStorage.getItem("mars-profiles-v1");if(p)setProfiles(JSON.parse(p));const s=localStorage.getItem("mars-planners-v1");if(s)setStore(JSON.parse(s));else{const old=localStorage.getItem("mars-planner-v4");if(old)setStore({[keyFor("student7","2026/27",7)]:JSON.parse(old)})}}catch{}},[]);
 useEffect(()=>{localStorage.setItem("mars-profiles-v1",JSON.stringify(profiles))},[profiles]);
 useEffect(()=>{if(!account)return;const t=setTimeout(()=>{localStorage.setItem("mars-planners-v1",JSON.stringify(store));setSaved(true);setTimeout(()=>setSaved(false),900)},450);return()=>clearTimeout(t)},[store,account]);
 function enter(e:FormEvent){e.preventDefault();const found=demoAccounts.find(a=>a.login===login&&a.password===password);if(!found){setError("Проверьте логин и пароль");return}setError("");setAccount(found);if(found.role==="student")setSelectedStudent(found.login);setPage(1)}
 function choose(x:string){setLogin(x);setPassword("1234");setError("")}
 function logout(){setAccount(null);setLogin("");setPassword("");setPage(1)}
 if(!account)return <main className="loginScreen"><div className="orbit orbitOne"/><div className="orbit orbitTwo"/><div className="planet planetOrange"/><div className="planet planetPurple"/><section className="loginIntro"><img className="marsLogo" src="/mars-logo.svg" alt="МАРС"/><p className="loginEyebrow">ЦИФРОВАЯ ОБРАЗОВАТЕЛЬНАЯ СРЕДА</p><h1>Живая планёрка МАРС</h1><p className="loginTagline">Уровень и планёрка назначаются администратором.</p></section><section className="loginCard"><p className="loginWelcome">Добро пожаловать</p><h2>Вход в планёрку</h2><div className="roleSwitch"><button type="button" className={login==="student7"?"selected":""} onClick={()=>choose("student7")}>Ученик 7</button><button type="button" className={login==="student8"?"selected":""} onClick={()=>choose("student8")}>Ученик 8</button><button type="button" className={login==="teacher"?"selected":""} onClick={()=>choose("teacher")}>Педагог</button><button type="button" className={login==="admin"?"selected":""} onClick={()=>choose("admin")}>Администратор</button></div><form onSubmit={enter}><label>Логин<input value={login} onChange={e=>setLogin(e.target.value)}/></label><label>Пароль<input type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<p className="error">{error}</p>}<button className="loginButton">Войти</button></form><p style={{fontSize:12,opacity:.7}}>Демо-пароль: 1234</p></section></main>;

 const studentLogin=account.role==="student"?account.login:selectedStudent;
 const profile=profiles[studentLogin]||demoProfiles.student7;
 const templateId=templateForLevel(profile.level);
 const template=templates[templateId];
 const plannerKey=keyFor(studentLogin,profile.year,profile.level);
 const planner=store[plannerKey]||{};
 const data=planner[page]||{};
 const readOnly=account.role!=="student";
 const pageSpec=template.pages[page]||template.pages[1];activeSections=pageSpec.sections;
 const set=(k:string,x:string)=>setStore(s=>({...s,[plannerKey]:{...(s[plannerKey]||{}),[page]:{...((s[plannerKey]||{})[page]||{}),[k]:x}}}));
 const total=Object.keys(template.pages).length;
 function promote(){const next=Math.min(11,profile.level+1);const yearParts=profile.year.split("/");const start=Number(yearParts[0])+1;const nextYear=`${start}/${String((start+1)%100).padStart(2,"0")}`;setProfiles(p=>({...p,[studentLogin]:{...profile,level:next,year:nextYear}}));setPage(1)}
 const history=Object.entries(store).filter(([k])=>k.startsWith(studentLogin+":")).map(([k])=>{const m=k.match(/:(\d{4}\/\d{2}):L(\d+)/);return m?{key:k,year:m[1],level:Number(m[2])}:null}).filter(Boolean) as {key:string;year:string;level:number}[];

 if(account.role==="admin")return <main className="appShell"><header><div><strong>МАРС</strong><span>Администрирование</span></div><nav><span>{account.name}</span><button onClick={logout}>Выйти</button></nav></header><div className="workspace"><aside><p className="eyebrow">УЧЕНИКИ</p>{Object.entries(profiles).map(([id,p])=><button key={id} className={selectedStudent===id?"active":""} onClick={()=>setSelectedStudent(id)}><span>{p.level}</span>{p.name}</button>)}</aside><section className="plannerPage"><div className="pageTop"><div><p className="eyebrow">УЧЁТНАЯ ЗАПИСЬ</p><h1>{profile.name}</h1></div></div><div className="sheet twoCol"><section><h2>Текущие данные</h2><Field label="Имя ученика" value={profile.name} readOnly={false} onChange={x=>setProfiles(p=>({...p,[studentLogin]:{...profile,name:x}}))}/><label className="field"><span>Уровень</span><select value={profile.level} onChange={e=>setProfiles(p=>({...p,[studentLogin]:{...profile,level:Number(e.target.value)}}))}>{[5,6,7,8,9,10,11].map(n=><option key={n}>{n}</option>)}</select></label><Field label="Учебный год" value={profile.year} readOnly={false} onChange={x=>setProfiles(p=>({...p,[studentLogin]:{...profile,year:x}}))}/><p><b>Шаблон:</b> {template.label}, {template.levels}</p><button className="loginButton" onClick={promote}>Перевести на следующий уровень</button></section><section><h2>История планёрок</h2>{history.length?history.map(h=><p key={h.key}>{h.year} — {h.level} уровень — {templateForLevel(h.level)==="middle"?"средняя школа":"старшая школа"}</p>):<p>История появится после первого заполнения.</p>}<p>При переводе создаётся новый экземпляр планёрки. Старые данные не перезаписываются.</p></section></div></section></div></main>;

 return <main className="appShell"><header><div><strong>МАРС</strong><span>Живая планёрка</span></div><nav>{account.role==="teacher"&&<select value={selectedStudent} onChange={e=>{setSelectedStudent(e.target.value);setPage(1)}}>{Object.entries(profiles).map(([id,p])=><option key={id} value={id}>{p.name}</option>)}</select>}<span>{account.role==="student"?`${profile.name} · ${profile.level} уровень`:account.name}</span><button onClick={logout}>Выйти</button></nav></header><div className="workspace"><aside><p className="eyebrow">{template.label.toUpperCase()}</p><h2>{profile.level} уровень · {profile.year}</h2><p style={{fontSize:12,opacity:.7}}>{template.levels}</p>{Object.entries(template.pages).map(([n,s])=><button className={page===Number(n)?"active":""} key={n} onClick={()=>setPage(Number(n))}><span>{n}</span>{s.title}</button>)}</aside><section className="plannerPage"><div className="pageTop"><div><p className="eyebrow">СТРАНИЦА {page} ИЗ {total} · {profile.year}</p><h1>{pageSpec.title}</h1><p>{template.title} · {profile.level} уровень</p></div><span className={saved?"save saved":"save"}>{saved?"Сохранено":readOnly?"Режим просмотра":"Автосохранение"}</span></div><PlannerPage {...{page,data,readOnly,set}}/><section className="commentBox"><p className="eyebrow">КОММЕНТАРИЙ ПЕДАГОГА</p>{account.role==="teacher"?<textarea value={v(data,"teacherComment")} onChange={e=>set("teacherComment",e.target.value)} placeholder="Поддерживающий комментарий ученику…"/>:<p>{v(data,"teacherComment")||"Педагог пока не оставил комментарий."}</p>}</section></section></div></main>
}