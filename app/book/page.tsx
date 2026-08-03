"use client";

import {useEffect,useState} from "react";

type FieldProps={id:string;label:string;rows?:number;className?:string};

function useStored(id:string){
  const[value,setValue]=useState("");
  useEffect(()=>{setValue(localStorage.getItem(`mars-book-${id}`)||"")},[id]);
  useEffect(()=>{const timer=setTimeout(()=>localStorage.setItem(`mars-book-${id}`,value),220);return()=>clearTimeout(timer)},[id,value]);
  return[value,setValue] as const;
}

function LinedField({id,label,rows=3,className=""}:FieldProps){
  const[value,setValue]=useStored(id);
  return <label className={`linedField ${className}`}><strong>{label}</strong><textarea rows={rows} value={value} onChange={e=>setValue(e.target.value)} aria-label={label}/></label>;
}

function Choice({id,items,className=""}:{id:string;items:string[];className?:string}){
  const[value,setValue]=useStored(id);
  return <div className={`choiceGrid ${className}`}>{items.map(item=><label key={item} className={value===item?"selected":""}><input type="radio" name={id} checked={value===item} onChange={()=>setValue(item)}/><span>{item}</span></label>)}</div>;
}

function Scale({id,text}:{id:string;text:string}){
  const[value,setValue]=useStored(id);
  return <div className="scaleRow"><span>{text}</span>{["🤔 Пока нет","🟡 Частично","✅ Да!"].map(x=><label key={x}><input type="radio" name={id} checked={value===x} onChange={()=>setValue(x)}/>{x}</label>)}</div>;
}

const route=[
  ["Замысел идеи","Старт"],
  ["Проектирование решения","Прокладываем курс"],
  ["Пилотирование","Первый запуск двигателя"],
  ["Технологизация","Навигационная система"],
  ["Partners Day","Сигнал во Вселенную"],
  ["Реализация","Выход на орбиту"]
];

const roles=[
  ["👑","Лидер (стратег) — ось проекта"],
  ["🔬","Аналитик (исследователь) — связь с реальностью"],
  ["📋","Маркетинг (внешний мир) — переводчик смысла"],
  ["⚙","Технолог — превращение идеи в работающую штуку"],
  ["✨","Другое: например, «Генератор идей», «Дизайнер»"]
];

function SpreadOne(){return <>
  <article className="page leftPage">
    <div className="pageNumber">01</div><p className="stageLabel">БОРТОВОЙ ЖУРНАЛ — ЗАМЕТКИ С ИНТЕНСИВА</p><h1>Моя экспедиция к идее</h1><div className="titleRule"/>
    <div className="twoFields"><LinedField id="p1-project-a" label="Название твоего проекта/идеи:" rows={2}/><LinedField id="p1-project-b" label="Название твоего проекта/идеи:" rows={2}/></div>
    <LinedField id="p1-spark" label={'✨ Первая мысль/впечатление: «Что стало самой первой “искрой” для этой идеи? Нарисуй или опиши»'} rows={5}/>
    <section className="routeBox"><h2>Этапы</h2><div className="routeGrid">{route.map(([title,sub],i)=><div key={title}><b>{i+1}. {title}</b><span>({sub})</span></div>)}</div></section>
    <aside className="compactNote tip"><b>💡 СОВЕТ:</b><p>Если не можешь объяснить идею просто — значит, не до конца ее понял. Попробуй рассказать ее другу, который не был на интенсиве.</p></aside>
    <aside className="compactNote fact"><b>🚀 ФАКТ:</b><p>Самые успешные команды — не те, кто не ошибается, а те, кто быстро узнает, что не работает, и меняет курс.</p></aside>
  </article>
  <article className="page rightPage">
    <h2>Экипаж и Роли</h2>
    <section className="rolesBox"><p><b>Моя основная роль в этом полете:</b><br/>(отметь галочкой или обведи)</p>{roles.map(([icon,text])=><label className="roleLine" key={text}><input type="checkbox"/><span>{icon}</span><b>{text}</b></label>)}</section>
    <LinedField id="p1-role-feeling" label="Мне в этой роли было: (легко / интересно / сложно) потому что…" rows={3}/>
    <LinedField id="p1-role-next" label="Хочу попробовать себя в роли:" rows={2}/>
    <LinedField id="p1-team" label="Кто еще в твоей команде? Напиши их имена рядом с ролями и суперсилу, которую они привнесли в проект" rows={4}/>
    <div className="threeFields"><LinedField id="p1-did" label="Что мы сделали?" rows={3}/><LinedField id="p1-success" label="Что получилось?" rows={3}/><LinedField id="p1-fail" label="Что не получилось?" rows={3}/></div>
    <aside className="compactNote know"><b>💡 А ЗНАЕШЬ?</b><p>90% стартапов меняют свою идею после первых тестов. Пилотирование — это не про провал, а про сбор данных!</p></aside>
  </article>
</>}

function SpreadTwo(){return <>
  <article className="page leftPage">
    <div className="pageNumber">02</div><p className="stageLabel">БОРТОВОЙ ЖУРНАЛ — ЗАМЕТКИ С ИНТЕНСИВА</p><h1>Сканирование локации:</h1><h2>Как я понимаю, что мы на правильном пути</h2><p className="instruction">Отметь, насколько эти утверждения верны для твоего проекта сейчас:</p>
    <div className="scales"><Scale id="p2-s1" text="У нас есть понятное название и ясная цель"/><Scale id="p2-s2" text="Мы можем объяснить идею за 30 секунд"/><Scale id="p2-s3" text="Каждый в команде знает свою задачу"/><Scale id="p2-s4" text="Мы понимаем, для кого и для чего наш проект"/><Scale id="p2-s5" text="У нас есть первый макет/план/схема"/><Scale id="p2-s6" text="Мы видим следующие 2–3 шага"/></div>
    <LinedField id="p2-success" label="Главный признак успеха для меня лично прямо сейчас:" rows={3}/>
    <section className="initiative"><h2>Опиши свою проектную инициативу</h2><p>«Представь, что ты рассказываешь о своем открытии по рации. Кратко и ясно!»</p><div className="twoFields"><LinedField id="p2-name" label="Как называется твой мир? (Название проекта)"/><LinedField id="p2-essence" label="В чем его суть? (1–2 предложения)"/><LinedField id="p2-audience" label="Для кого он? (Целевая аудитория)"/><LinedField id="p2-feature" label="Какой он на ощупь? (Главная фишка/технология)"/></div></section>
    <aside className="compactNote tip"><p>🧭 Идея становится инициативой, когда ей верит не только автор. Расскажи свою задумку другим — если они откликнутся, это сигнал, что ты на верном пути.</p></aside>
  </article>
  <article className="page rightPage">
    <h2>Зона туманности:</h2><h3>Чего я пока не знаю и чего боюсь</h3>
    <LinedField id="p2-questions" label="Вопросы, на которые у меня пока нет ответа:" rows={5}/>
    <aside className="compactNote important"><p>🛠 Не все сразу ясно. Часто в начале проекта не знают всех ответов. Главное — задать правильные вопросы.</p></aside>
    <LinedField id="p2-experts" label="Какие эксперты или помощь нужны, чтобы развеять этот туман?" rows={4}/>
    <aside className="compactNote fact"><p>🤝 Эксперты нужны не только «потом». Иногда пара советов на старте экономят месяцы работы.</p></aside>
    <div className="twoFields"><LinedField id="p2-risk" label="Главная сложность или риск, который я пока вижу" rows={4}/><LinedField id="p2-notes" label="Заметки" rows={4}/></div>
    <aside className="compactNote motivation"><p>🌱 Большие дела начинаются с маленького шага. У LEGO первые наборы собирались из остатков дерева, а теперь это мировая компания.</p></aside>
  </article>
</>}

function SpreadThree(){return <>
  <article className="page leftPage">
    <div className="pageNumber">03</div><p className="stageLabel">БОРТОВОЙ ЖУРНАЛ — ЗАМЕТКИ С ИНТЕНСИВА</p><h1>Блок связи с землёй: моё состояние и впечатления</h1><div className="titleRule"/>
    <h2>Мое настроение после интенсива: <small>(можно выбрать иконку)</small></h2>
    <Choice id="p3-mood" items={["Вдохновлен 🤩","Доволен 😊","Задумчив 🤔","Устал 😐","Перегружен 😥"]}/>
    <h2>Сегодня я чувствую себя как…</h2>
    <Choice id="p3-like-choice" className="metaphors" items={["👩‍🚀 Исследователь, открывающий новую планету","🧑‍🔧 Инженер, у которого все детали пока не стыкуются","🦸 Капитан, который видит цель и ведет команду","👩 Свой вариант"]}/>
    <LinedField id="p3-like-own" label="Свой вариант:" rows={2}/>
    <aside className="compactNote important"><p>🔄 Неудачи — часть пути. Если что-то не выходит — это не провал, а проверка гипотезы.</p></aside>
    <div className="twoFields"><LinedField id="p3-joy" label="Что меня больше всего радует в нашем замысле?" rows={5}/><LinedField id="p3-worry" label="Что вызывает беспокойство или сомнения?" rows={5}/></div>
  </article>
  <article className="page rightPage">
    <section className="story"><h2>Истории стартапов</h2><p>Смешарики задумывались как игра для конфет и изначально назывались Сластёны. Но эта идея провалилась, и разработчики решили попробовать запустить многосерийный мультфильм с круглыми героями, в котором не было бы отрицательных героев. Дело было в конце девяностых, когда компьютерная анимация только начинала появляться, и первый бизнес-план Смешариков был написан по старинке на миллиметровой бумажке.</p></section>
    <section className="todo"><h2>📑 Список Дел</h2><p>Напиши 3 основных шага, которые тебе нужно предпринять для работы над проектом</p><LinedField id="p3-step1" label="1." rows={3}/><LinedField id="p3-step2" label="2." rows={3}/><LinedField id="p3-step3" label="3." rows={3}/></section>
    <LinedField id="p3-notes" label="Заметки" rows={8}/>
  </article>
</>}

export default function Book(){
  const[page,setPage]=useState(1);
  useEffect(()=>{const raw=new URLSearchParams(location.search).get("page")||localStorage.getItem("mars-book-current-page")||"1";setPage(Math.min(3,Math.max(1,Number(raw)||1)))},[]);
  useEffect(()=>{history.replaceState(null,"",`/book?page=${page}`);localStorage.setItem("mars-book-current-page",String(page));window.scrollTo({top:0,behavior:"smooth"})},[page]);
  return <main className="bookMode"><header className="cabinetBar"><div className="brand"><img src="/mars-logo.svg" alt="МАРС"/><div><b>Живая планёрка</b><span>Личный кабинет ученика</span></div></div><div className="stageMeta"><span>Разворот {page} из 33</span><span className="saved">Сохранено ✓</span></div><a href="/student">← К моему маршруту</a></header><section className="bookFrame"><div className="spread">{page===1?<SpreadOne/>:page===2?<SpreadTwo/>:<SpreadThree/>}</div></section><footer className="bookFooter"><button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>← Предыдущий разворот</button><span>{String(page).padStart(2,"0")} / 33</span><button disabled={page===3} onClick={()=>setPage(p=>Math.min(3,p+1))}>Следующий разворот →</button></footer>
  <style jsx global>{`
  *{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#e8e4ed;color:#282131;font-family:Inter,Arial,sans-serif}.bookMode{min-height:100vh;padding-bottom:24px}.cabinetBar{height:72px;display:flex;align-items:center;gap:24px;padding:0 28px;background:#fff;border-bottom:1px solid #ddd7e4;position:sticky;top:0;z-index:20}.brand{display:flex;align-items:center;gap:14px}.brand img{width:72px}.brand div{display:grid}.brand b{color:#5220a8}.brand span{font-size:12px;color:#887f91}.stageMeta{margin-left:auto;display:flex;gap:10px;font-size:13px;font-weight:800}.stageMeta span{padding:8px 11px;border-radius:999px;background:#f0ebf7;color:#6130b5}.stageMeta .saved{background:#ebf6ee;color:#35734b}.cabinetBar a{color:#5220a8;text-decoration:none;font-weight:800;font-size:13px}.bookFrame{padding:18px 22px 10px}.spread{max-width:1420px;margin:auto;display:grid;grid-template-columns:1fr 1fr;filter:drop-shadow(0 24px 40px #2d203b28)}.page{min-height:850px;background:#fffdf8;padding:28px 32px 24px;position:relative;overflow:hidden}.leftPage{border-radius:18px 0 0 18px;border-right:1px solid #ddd4e2}.rightPage{border-radius:0 18px 18px 0;border-left:1px solid #efe9f2}.leftPage:after,.rightPage:before{content:"";position:absolute;top:0;bottom:0;width:22px;pointer-events:none}.leftPage:after{right:0;background:linear-gradient(90deg,transparent,#3e2b4f12)}.rightPage:before{left:0;background:linear-gradient(90deg,#3e2b4f12,transparent)}.pageNumber{position:absolute;right:32px;top:24px;font:800 42px Georgia,serif;color:#f05b37}.stageLabel{margin:0 0 7px;color:#7444c6;font-size:10px;font-weight:900;letter-spacing:.11em}.page h1{margin:0 0 8px;font:800 38px/1.08 Georgia,serif;max-width:83%}.page h2{margin:12px 0 8px;font:800 23px Georgia,serif}.page h3{margin:0 0 12px;font:700 18px Georgia,serif}.page small{font:500 12px Inter,Arial,sans-serif}.titleRule{height:3px;background:#2b2333;margin:15px 0}.instruction{margin:0 0 10px}.linedField{display:grid;gap:6px;border:1px solid #cfc5bb;padding:10px 11px 8px;margin:9px 0;background:#fffefb}.linedField strong{font:700 16px Georgia,serif}.linedField textarea{width:100%;border:0;outline:0;resize:vertical;font:15px/1.7 Inter,Arial,sans-serif;background:repeating-linear-gradient(to bottom,transparent 0,transparent 25px,#ddd7cf 26px);min-height:52px;color:#2a2233}.twoFields{display:grid;grid-template-columns:1fr 1fr;gap:11px}.threeFields{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.compactNote{padding:8px 10px;border:1px solid;border-radius:6px;margin:9px 0;font-size:12px;line-height:1.35}.compactNote p{margin:3px 0 0}.tip{background:#f6f0ff;border-color:#c8b3ed}.fact{background:#fff3ed;border-color:#edac91}.know{background:#fff9df;border-color:#e9ce6e}.important{background:#eef4ff;border-color:#aac1e8}.motivation{background:#eef8f0;border-color:#9ecdaa}.routeBox{border:1px dashed #bbb0a8;padding:10px;margin:10px 0}.routeBox h2{margin:0 0 8px}.routeGrid{display:grid;grid-template-columns:1fr 1fr;gap:7px 12px}.routeGrid div{display:grid}.routeGrid span{font-size:11px;color:#706874}.rolesBox{border:1px dashed #bbb0a8;padding:9px 11px}.rolesBox>p{margin:0 0 7px}.roleLine{display:grid;grid-template-columns:20px 30px 1fr;align-items:center;gap:6px;padding:7px 0;border-top:1px solid #e1d9d2}.roleLine input{width:17px;height:17px}.roleLine span{font-size:21px}.roleLine b{font-size:13px}.scales{border:1px solid #d6cec6}.scaleRow{display:grid;grid-template-columns:1fr repeat(3,104px);align-items:center;gap:5px;min-height:42px;padding:5px 8px;border-bottom:1px solid #e2dbd4;font-size:12px}.scaleRow:last-child{border-bottom:0}.scaleRow label{display:flex;align-items:center;gap:4px;white-space:nowrap}.initiative{margin-top:10px}.initiative>p{font-style:italic;font-size:13px}.choiceGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:7px;margin:8px 0 12px}.choiceGrid label{border:1px solid #d8d0c9;padding:9px;border-radius:8px;background:#fff;display:flex;gap:6px;align-items:center;font-size:12px}.choiceGrid label.selected{border-color:#7650aa;background:#f4effb}.metaphors{grid-template-columns:1fr 1fr}.story{background:#fff6dc;border:1px solid #ead49a;padding:14px;margin-bottom:14px}.story h2{margin-top:0}.story p{font-size:14px;line-height:1.48;margin-bottom:0}.todo{border:1px dashed #b9aea6;padding:10px 12px}.todo h2{margin-top:0}.todo>p{font-size:13px}.bookFooter{max-width:1420px;margin:12px auto 0;padding:0 22px;display:flex;justify-content:space-between;align-items:center}.bookFooter button{border:0;border-radius:12px;padding:11px 15px;background:#5b27b1;color:#fff;font-weight:800}.bookFooter button:disabled{opacity:.35}.bookFooter span{font-weight:900;color:#5b27b1}@media(max-width:980px){.cabinetBar{padding:0 16px}.brand div,.stageMeta{display:none}.bookFrame{padding:12px}.spread{grid-template-columns:1fr}.page{min-height:auto;border-radius:14px!important;border:0!important}.leftPage:after,.rightPage:before{display:none}.rightPage{margin-top:12px}}@media(max-width:650px){.cabinetBar{height:62px}.cabinetBar a{font-size:0}.cabinetBar a:after{content:"← Маршрут";font-size:13px}.page{padding:22px 16px}.page h1{font-size:31px}.pageNumber{font-size:32px}.twoFields,.threeFields,.metaphors,.routeGrid{grid-template-columns:1fr}.scaleRow{grid-template-columns:1fr;gap:3px;padding:8px}.scaleRow label{display:inline-flex}.bookFooter{padding:0 12px}.bookFooter button{font-size:12px;padding:9px 10px}}
  `}</style></main>;
}
