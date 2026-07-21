"use client";

import {useEffect,useState} from "react";

type Values=Record<string,string>;

const pages=[
 {title:"Моя экспедиция к идее",left:<>
  <Field id="p1name1" label="Название твоего проекта/идеи:"/>
  <Field id="p1name2" label="Название твоего проекта/идеи:"/>
  <Box id="p1spark" label={'✨Первая мысль/впечатление:\n«Что стало самой первой \"искрой\" для этой идеи? Нарисуй или опиши»'} tall/>
  <Note kind="tip">СОВЕТ: Если не можешь объяснить идею просто - значит, не до конца ее понял. Попробуй рассказать ее другу, который не был на интенсиве.</Note>
  <h3>Этапы</h3>
  <div className="route"><span>💡 Замысел идеи<br/>(Старт)</span><span>🦸 Проектирование решения<br/>(Прокладываем курс)</span><span>👷 Пилотирование<br/>(Первый запуск двигателя)</span><span>👨‍💻 Технологизация<br/>(Навигационная система)</span><span>👩‍💼 Partners Day<br/>(Сигнал во Вселенную)</span><span>👩‍🚀 Реализация<br/>(Выход на орбиту)</span></div>
  <Note kind="fact">А ЗНАЕШЬ? 90% стартапов меняют свою идею после первых тестов. Пилотирование - это не про провал, а про сбор данных!</Note>
 </>,right:<>
  <h2>Экипаж и Роли</h2>
  <Note kind="fact">ФАКТ: Самые успешные команды - не те, кто не ошибается, а те, кто быстро узнает, что не работает, и меняет курс.</Note>
  <p>Моя основная роль в этом полете: (отметь галочкой или обведи)</p>
  <p>Кто еще в твоей команде? Напиши их имена рядом с ролями и суперсилу, которую они привнесли в проект</p>
  <Role icon="👑" text="Лидер (стратег) — ось проекта"/><Role icon="🔬" text="Аналитик (исследователь) - связь с реальностью"/><Role icon="📋" text="Маркетинг (внешний мир) - переводчик смысла"/><Role icon="⚙" text="Технолог - превращение идеи в работающую штуку"/><Role icon="✨" text={'Другое: (например, "Генератор идей", "Дизайнер")'}/>
  <Field id="p1rolefeel" label="Мне в этой роли было: (легко / интересно / сложно) потому что..."/>
  <Field id="p1newrole" label="Хочу попробовать себя в роли:"/>
  <div className="three"><Field id="p1did" label="Что мы сделали?"/><Field id="p1worked" label="Что получилось?"/><Field id="p1failed" label="Что не получилось?"/></div>
 </>},
 {title:"Сканирование локации",left:<>
  <h2>Как я понимаю, что мы на правильном пути</h2>
  <p>Отметь, насколько эти утверждения верны для твоего проекта сейчас:</p>
  <Scale text="У нас есть понятное название и ясная цель"/><Scale text="Мы можем объяснить идею за 30 секунд"/><Scale text="Каждый в команде знает свою задачу"/><Scale text="Мы понимаем, для кого и для чего наш проект"/><Scale text="У нас есть первый макет/план/схема"/><Scale text="Мы видим следующие 2-3 шага"/>
  <Field id="p2success" label="Главный признак успеха для меня лично прямо сейчас:"/>
  <div className="outlined"><h3>Опиши свою проектную инициативу</h3><p>«Представь, что ты рассказываешь о своем открытии по рации. Кратко и ясно!»</p><Field id="p2world" label="Как называется твой мир? (Название проекта)"/><Field id="p2essence" label="В чем его суть? (1-2 предложения)"/><Field id="p2audience" label="Для кого он? (Целевая аудитория)"/><Field id="p2feature" label="Какой он на ощупь? (Главная фишка/технология)"/></div>
  <Note kind="tip">🧭 Идея становится инициативой, когда ей верит не только автор. Расскажи свою задумку другим - если они откликнутся, это сигнал, что ты на верном пути.</Note>
 </>,right:<>
  <h2>Зона туманности:<br/>Чего я пока не знаю и чего боюсь</h2>
  <Box id="p2questions" label="Вопросы, на которые у меня пока нет ответа:" tall/>
  <Note kind="tip">🛠 Не все сразу ясно. Часто в начале проекта не знают всех ответов. Главное - задать правильные вопросы.</Note>
  <Box id="p2experts" label="Какие эксперты или помощь нужны, чтобы развеять этот туман?"/>
  <Note kind="tip">🤝 Эксперты нужны не только «потом». Иногда пара советов на старте экономят месяцы работы.</Note>
  <Box id="p2risk" label="Главная сложность или риск, который я пока вижу"/>
  <Box id="p2notes" label="Заметки" tall/>
  <Note kind="fact">🌱 Большие дела начинаются с маленького шага. У LEGO первые наборы собирались из остатков дерева, а теперь это мировая компания.</Note>
 </>},
 {title:"Блок связи с землёй: моё состояние и впечатления",left:<>
  <h2>Мое настроение после интенсива: (можно выбрать иконку)</h2>
  <div className="moods"><button>Вдохновлен 🤩</button><button>Доволен 😊</button><button>Задумчив 🤔</button><button>Устал 😐</button><button>Перегружен 😥</button></div>
  <Box id="p3joy" label="Что меня больше всего радует в нашем замысле?"/>
  <Box id="p3worry" label="Что вызывает беспокойство или сомнения?"/>
  <h3>Сегодня я чувствую себя как…</h3>
  <div className="choices"><label><input type="radio" name="state"/> 👩‍🚀 Исследователь, открывающий новую планету</label><label><input type="radio" name="state"/> 🧑‍🔧 Инженер, у которого все детали пока не стыкуются</label><label><input type="radio" name="state"/> 🦸 Капитан, который видит цель и ведет команду</label><label><input type="radio" name="state"/> 👩 Свой вариант:</label></div>
  <Field id="p3state" label="Свой вариант:"/>
  <Note kind="tip">🔄 Неудачи - часть пути. Если что-то не выходит - это не провал, а проверка гипотезы.</Note>
 </>,right:<>
  <h2>Истории стартапов</h2>
  <div className="story">Смешарики задумывались как игра для конфет и изначально назывались Сластёны. Но эта идея провалилась, и разработчики решили попробовать запустить многосерийный мультфильм с круглыми героями, в котором не было бы отрицательных героев. Дело было в конце девяностых, когда компьютерная анимация только начинала появляться, и первый бизнес-план Смешариков был написан по старинке на миллиметровой бумагке.</div>
  <h2>📑 Список Дел</h2><p>Напиши 3 основных шага, которые тебе нужно предпринять для работы над проектом</p>
  <Field id="p3step1" label="1"/><Field id="p3step2" label="2"/><Field id="p3step3" label="3"/>
  <Box id="p3notes" label="Заметки" tall/>
 </>}
];

function Field({id,label}:{id:string;label:string}){const[v,setV]=useStored(id);return <label className="field"><span>{label}</span><textarea rows={2} value={v} onChange={e=>setV(e.target.value)}/></label>}
function Box({id,label,tall=false}:{id:string;label:string;tall?:boolean}){const[v,setV]=useStored(id);return <label className="field"><span>{label}</span><textarea className={tall?"tall":""} value={v} onChange={e=>setV(e.target.value)}/></label>}
function useStored(id:string){const[v,setV]=useState("");useEffect(()=>{setV(localStorage.getItem("mars-book-"+id)||"")},[id]);useEffect(()=>{const t=setTimeout(()=>localStorage.setItem("mars-book-"+id,v),250);return()=>clearTimeout(t)},[id,v]);return[v,setV] as const}
function Note({kind,children}:{kind:"tip"|"fact";children:React.ReactNode}){return <aside className={`note ${kind}`}>{children}</aside>}
function Role({icon,text}:{icon:string;text:string}){return <div className="role"><span>{icon}</span><b>{text}</b><input/></div>}
function Scale({text}:{text:string}){return <div className="scale"><span>{text}</span><label>🤔<input type="radio" name={text}/></label><label>🟡<input type="radio" name={text}/></label><label>✅<input type="radio" name={text}/></label></div>}

export default function Book(){const[page,setPage]=useState(0);const p=pages[page];return <main className="bookApp"><header><img src="/mars-logo.svg" alt="МАРС"/><div><b>БОРТОВОЙ ЖУРНАЛ — ЗАМЕТКИ С ИНТЕНСИВА</b><span>Печатный разворот · этап {page+1} из 3</span></div><a href="/">← В планёрку</a></header><nav>{pages.map((x,i)=><button key={x.title} className={i===page?"active":""} onClick={()=>setPage(i)}>{i+1}. {x.title}</button>)}</nav><section className="spread"><article className="paper left"><h1>{p.title}</h1>{p.left}</article><article className="paper right">{p.right}</article></section><footer><button disabled={page===0} onClick={()=>setPage(x=>x-1)}>← Предыдущий этап</button><span>Все формулировки сохранены из печатной планёрки</span><button disabled={page===pages.length-1} onClick={()=>setPage(x=>x+1)}>Следующий этап →</button></footer><style jsx global>{`
*{box-sizing:border-box}body{margin:0;background:#dedbe2;color:#5820b4;font-family:"Trebuchet MS",Arial,sans-serif}.bookApp{min-height:100vh;padding-bottom:32px;background:radial-gradient(circle at 5% 10%,#f3a58e 0 10%,transparent 10.2%),radial-gradient(circle at 95% 85%,#bdeff0 0 11%,transparent 11.2%),#dedbe2}header{height:76px;background:#fffdf7;display:flex;align-items:center;gap:18px;padding:10px 28px;border-bottom:1px solid #d6d0dd}header img{width:76px}header div{display:grid;gap:3px;flex:1}header b{font-size:15px}header span{font-size:12px;color:#7f7390}header a{color:#5820b4;text-decoration:none;font-weight:800}nav{max-width:1420px;margin:18px auto 12px;padding:0 18px;display:flex;gap:8px;overflow:auto}nav button{border:0;border-radius:999px;padding:10px 14px;background:#fff;color:#6c5a80;font-weight:800;white-space:nowrap;cursor:pointer}nav button.active{background:#5820b4;color:#fff}.spread{max-width:1420px;margin:auto;padding:0 18px;display:grid;grid-template-columns:1fr 1fr;min-height:820px;filter:drop-shadow(0 24px 34px #3b2a4d30)}.paper{background:#fffdf8;padding:28px 30px 36px;position:relative;overflow:hidden}.paper.left{border-radius:18px 0 0 18px;border-right:1px solid #d7cfe0}.paper.right{border-radius:0 18px 18px 0;border-left:1px solid #eee8f1}.paper.left:after,.paper.right:before{content:"";position:absolute;top:0;bottom:0;width:22px;pointer-events:none}.paper.left:after{right:0;background:linear-gradient(90deg,transparent,#6a58791a)}.paper.right:before{left:0;background:linear-gradient(90deg,#6a58791a,transparent)}h1,h2,h3{color:#5920c2}h1{font-size:27px;margin:0 0 18px;text-align:center}h2{font-size:22px;margin:8px 0 14px}h3{font-size:20px}.field{display:grid;gap:5px;margin:12px 0}.field span{font-weight:800;white-space:pre-line}.field textarea{width:100%;border:0;border-bottom:2px solid #c9c4f3;background:repeating-linear-gradient(to bottom,transparent 0,transparent 30px,#dcd8f7 31px);min-height:64px;padding:7px 4px;resize:vertical;outline:none;color:#342445;font:inherit;line-height:31px}.field textarea.tall{min-height:190px;border:2px solid #cbc6f4;border-radius:16px;padding:10px}.note{display:block;border-radius:16px;padding:12px 14px;margin:12px 0;color:#5332a0;font-size:14px;line-height:1.35}.note.tip{background:#d6f5f4}.note.fact{background:#d6f5f4}.role{display:grid;grid-template-columns:34px 1fr minmax(120px,1fr);align-items:center;gap:8px;border-bottom:1px solid #cbc6ee;padding:9px 0}.role input{border:0;border-bottom:1px solid #bdb5e3;background:transparent}.three{display:grid;grid-template-columns:1fr;gap:2px}.route{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:12px;border-radius:18px;background:#f7f4ff}.route span{font-size:13px;line-height:1.3}.outlined{border:2px solid #c7c1f0;border-radius:18px;padding:14px}.scale{display:grid;grid-template-columns:minmax(0,1fr) repeat(3,48px);gap:5px;align-items:center;padding:7px 0;border-bottom:1px solid #e6e1f5}.scale label{text-align:center}.moods{display:flex;flex-wrap:wrap;gap:8px}.moods button{border:1px solid #d2c9ec;background:#fff;border-radius:999px;padding:8px 11px;color:#5a31a3}.choices{display:grid;gap:10px}.story{background:#fff4de;border:2px dashed #e8c875;border-radius:18px;padding:18px;line-height:1.55;color:#55436c}footer{max-width:1420px;margin:14px auto 0;padding:0 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;color:#675a75;font-size:13px}footer button{border:0;border-radius:12px;padding:11px 15px;background:#5820b4;color:#fff;font-weight:800;cursor:pointer}footer button:disabled{opacity:.35}@media(max-width:950px){.spread{grid-template-columns:1fr}.paper.left,.paper.right{border-radius:14px;border:0}.paper.left{border-bottom:1px solid #ded6e6}.paper.left:after,.paper.right:before{display:none}.spread{min-height:auto}.route{grid-template-columns:1fr 1fr}}@media(max-width:620px){header{padding:8px 14px}header div b{font-size:12px}header a{display:none}.paper{padding:22px 17px}.route{grid-template-columns:1fr}.scale{grid-template-columns:minmax(0,1fr) repeat(3,38px)}footer span{display:none}}
`}</style></main>}
