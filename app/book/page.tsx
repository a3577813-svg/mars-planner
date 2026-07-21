"use client";

import {useEffect,useState} from "react";

type StoredFieldProps={id:string;label:string;rows?:number;className?:string};

function useStored(id:string){
  const[value,setValue]=useState("");
  useEffect(()=>{setValue(localStorage.getItem(`mars-book-${id}`)||"")},[id]);
  useEffect(()=>{const timer=setTimeout(()=>localStorage.setItem(`mars-book-${id}`,value),220);return()=>clearTimeout(timer)},[id,value]);
  return[value,setValue] as const;
}

function LinedField({id,label,rows=3,className=""}:StoredFieldProps){
  const[value,setValue]=useStored(id);
  return <label className={`linedField ${className}`}>
    <strong>{label}</strong>
    <textarea rows={rows} value={value} onChange={e=>setValue(e.target.value)} aria-label={label}/>
  </label>
}

const roles=[
  ["👑","Лидер","Держит общий замысел, помогает команде двигаться к цели."],
  ["🔎","Аналитик","Исследует аудиторию, вопросы и реальные потребности."],
  ["⚙️","Технолог","Превращает идею в работающий прототип."],
  ["📣","Коммуникатор","Объясняет смысл проекта людям и партнёрам."]
];

const steps=[
  "Найти проблему и понять, кому мы можем помочь",
  "Придумать идею решения",
  "Собрать команду и распределить роли",
  "Изучить опыт и существующие решения",
  "Создать прототип и проверить на первых пользователях",
  "Подготовить презентацию и защитить идею партнёрам"
];

export default function Book(){
  const[checked,setChecked]=useState<boolean[]>(()=>Array(steps.length).fill(false));
  useEffect(()=>{const raw=localStorage.getItem("mars-book-steps");if(raw)try{setChecked(JSON.parse(raw))}catch{}},[]);
  useEffect(()=>{localStorage.setItem("mars-book-steps",JSON.stringify(checked))},[checked]);

  return <main className="bookMode">
    <header className="cabinetBar">
      <div className="brand"><img src="/mars-logo.svg" alt="МАРС"/><div><b>Живая планёрка</b><span>Личный кабинет ученика</span></div></div>
      <div className="stageMeta"><span>Этап 1 из 33</span><span className="saved">Сохранено ✓</span></div>
      <a href="/">← К моему маршруту</a>
    </header>

    <section className="bookFrame">
      <div className="spread">
        <article className="page leftPage">
          <div className="pageNumber">01</div>
          <p className="stageLabel">ЭТАП 1</p>
          <h1>Моя экспедиция к идее</h1>
          <div className="titleRule"/>

          <div className="whyRow"><b>ЗАЧЕМ ЭТОТ ЭТАП</b><p>Зафиксировать первую версию идеи, увидеть команду и понять, с чего начинается проектный маршрут.</p></div>

          <div className="infoRow">
            <aside className="miniNote fact"><b>🚀 ФАКТ</b><p>Сильный проект начинается не с идеального ответа, а с точного вопроса.</p></aside>
            <aside className="miniNote tip"><b>💡 СОВЕТ</b><p>Сначала объясни идею простыми словами. Термины можно добавить позже.</p></aside>
            <div className="rocket">🚀</div>
          </div>

          <LinedField id="p1-project" label="Название проекта / идеи" rows={2}/>
          <LinedField id="p1-spark" label="Первая искра идеи" rows={4}/>

          <div className="twoFields">
            <LinedField id="p1-success" label="Что получилось?" rows={3}/>
            <LinedField id="p1-notyet" label="Что пока не получилось?" rows={3}/>
          </div>

          <div className="bottomQuote"><span>✦</span><p>Идея — это только начало.<br/>Дальше мы превращаем её в путешествие.</p></div>
        </article>

        <article className="page rightPage">
          <div className="rightTopGrid">
            <section>
              <h2>Экипаж и роли</h2>
              <div className="roleList">{roles.map(([icon,name,desc])=><div className="role" key={name}><span>{icon}</span><div><b>{name}</b><p>{desc}</p></div></div>)}</div>
            </section>
            <section className="roleFields">
              <LinedField id="p1-role" label="Моя основная роль" rows={4}/>
              <LinedField id="p1-role-next" label="Роль, которую хочу попробовать" rows={4}/>
            </section>
          </div>

          <section className="stepsBox">
            <div className="stepsTitle"><h3>Первые шаги по маршруту</h3><span>(отметь или допиши)</span></div>
            {steps.map((step,i)=><label className="step" key={step}><span className="stepNo">{i+1}</span><span className="stepText">{step}</span><input type="checkbox" checked={checked[i]} onChange={()=>setChecked(list=>list.map((x,j)=>j===i?!x:x))}/></label>)}
          </section>

          <LinedField id="p1-important" label="Что для меня важно в этом проекте?" rows={4} className="importantField"/>
        </article>
      </div>
    </section>

    <footer className="bookFooter"><button disabled>← Предыдущий разворот</button><span>01 / 33</span><button>Следующий разворот →</button></footer>

    <style jsx global>{`
      *{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#e8e4ed;color:#242033;font-family:Inter,Arial,sans-serif}.bookMode{min-height:100vh;padding-bottom:24px}.cabinetBar{height:72px;display:flex;align-items:center;gap:24px;padding:0 28px;background:#fff;border-bottom:1px solid #ddd7e4;position:sticky;top:0;z-index:20}.brand{display:flex;align-items:center;gap:14px}.brand img{width:72px}.brand div{display:grid}.brand b{color:#5220a8}.brand span{font-size:12px;color:#887f91}.stageMeta{margin-left:auto;display:flex;gap:10px;align-items:center;font-size:13px;font-weight:800}.stageMeta span{padding:8px 11px;border-radius:999px;background:#f0ebf7;color:#6130b5}.stageMeta .saved{background:#ebf6ee;color:#35734b}.cabinetBar a{color:#5220a8;text-decoration:none;font-weight:800;font-size:13px}.bookFrame{padding:18px 22px 10px}.spread{max-width:1420px;margin:auto;display:grid;grid-template-columns:1fr 1fr;filter:drop-shadow(0 24px 40px #2d203b28)}.page{min-height:800px;background:#fffdf8;padding:30px 34px 26px;position:relative;overflow:hidden}.leftPage{border-radius:18px 0 0 18px;border-right:1px solid #ddd4e2}.rightPage{border-radius:0 18px 18px 0;border-left:1px solid #efe9f2}.leftPage:after,.rightPage:before{content:"";position:absolute;top:0;bottom:0;width:22px;pointer-events:none}.leftPage:after{right:0;background:linear-gradient(90deg,transparent,#3e2b4f12)}.rightPage:before{left:0;background:linear-gradient(90deg,#3e2b4f12,transparent)}.pageNumber{position:absolute;right:34px;top:28px;font:800 44px Georgia,serif;color:#f05b37}.stageLabel{margin:0 0 8px;color:#7444c6;font-size:12px;font-weight:900;letter-spacing:.12em}.page h1{margin:0;font:800 43px/1.06 Georgia,serif;color:#231b2e;max-width:78%}.titleRule{height:3px;background:#2b2333;margin:20px 0 22px}.whyRow{display:grid;grid-template-columns:185px 1fr;gap:18px;align-items:start;padding:0 0 18px;border-bottom:1px solid #ddd5df}.whyRow b{color:#7243c1;font-size:14px;letter-spacing:.08em}.whyRow p{margin:0;line-height:1.45}.infoRow{display:grid;grid-template-columns:1fr 1fr 90px;gap:14px;align-items:stretch;margin:18px 0 14px}.miniNote{padding:14px;border-radius:4px;border:1px solid}.miniNote b{font-size:12px;letter-spacing:.06em}.miniNote p{margin:8px 0 0;font-size:13px;line-height:1.38}.miniNote.fact{background:#fff5f0;border-color:#f0a98f}.miniNote.tip{background:#f5f0ff;border-color:#bfa9eb}.rocket{display:grid;place-items:center;font-size:54px;transform:rotate(-12deg)}.linedField{display:grid;gap:8px;border:1px solid #cfc5bb;padding:13px 13px 10px;margin:12px 0;background:#fffefb}.linedField strong{font:700 19px Georgia,serif;color:#252032}.linedField textarea{width:100%;border:0;outline:0;resize:vertical;font:16px/1.75 Inter,Arial,sans-serif;background:repeating-linear-gradient(to bottom,transparent 0,transparent 27px,#ddd7cf 28px);min-height:56px;color:#2a2233}.twoFields{display:grid;grid-template-columns:1fr 1fr;gap:14px}.bottomQuote{display:flex;gap:12px;align-items:center;border:1px dashed #77707b;border-radius:10px;padding:10px 14px;margin-top:16px;max-width:72%;font-size:13px}.bottomQuote span{color:#f05b37}.bottomQuote p{margin:0;line-height:1.45}.rightTopGrid{display:grid;grid-template-columns:1.08fr .92fr;gap:24px}.rightPage h2{margin:0 0 14px;font:800 27px Georgia,serif;color:#231b2e}.roleList{border:1px dashed #cfc7c0;padding:6px 12px}.role{display:grid;grid-template-columns:42px 1fr;gap:12px;padding:12px 0;border-bottom:1px solid #ded7d0}.role:last-child{border-bottom:0}.role>span{font-size:28px}.role b{font-size:16px}.role p{margin:4px 0 0;color:#5f5864;font-size:12px;line-height:1.35}.roleFields .linedField{margin:0 0 16px}.stepsBox{border:1px solid #efa98d;padding:12px 14px;margin-top:18px}.stepsTitle{display:flex;align-items:baseline;gap:8px;margin-bottom:6px}.stepsTitle h3{margin:0;font:800 20px Georgia,serif}.stepsTitle span{font-size:12px}.step{display:grid;grid-template-columns:26px 1fr 24px;align-items:center;gap:8px;min-height:34px;border-top:1px dashed #d9d0c8;font-size:13px}.stepNo{font-weight:900}.step input{width:20px;height:20px;accent-color:#f05b37}.importantField{margin-top:18px;background:#f6f0ff;border-color:#cbb7ee}.bookFooter{max-width:1420px;margin:12px auto 0;padding:0 22px;display:flex;justify-content:space-between;align-items:center}.bookFooter button{border:0;border-radius:12px;padding:11px 15px;background:#5b27b1;color:#fff;font-weight:800}.bookFooter button:disabled{opacity:.35}.bookFooter span{font-weight:900;color:#5b27b1}@media(max-width:980px){.cabinetBar{padding:0 16px}.brand div{display:none}.stageMeta{display:none}.bookFrame{padding:12px}.spread{grid-template-columns:1fr}.page{min-height:auto;border-radius:14px!important;border:0!important}.leftPage:after,.rightPage:before{display:none}.rightTopGrid{grid-template-columns:1fr}.rightPage{margin-top:12px}.infoRow{grid-template-columns:1fr 1fr}.rocket{display:none}}@media(max-width:620px){.cabinetBar{height:62px}.cabinetBar a{font-size:0}.cabinetBar a:after{content:"← Маршрут";font-size:13px}.page{padding:22px 18px}.page h1{font-size:34px}.whyRow{grid-template-columns:1fr}.infoRow,.twoFields{grid-template-columns:1fr}.pageNumber{font-size:34px}.bottomQuote{max-width:100%}.bookFooter{padding:0 12px}.bookFooter button{font-size:12px;padding:9px 10px}}
    `}</style>
  </main>
}
