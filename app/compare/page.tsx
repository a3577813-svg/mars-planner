"use client";

import {useState} from "react";

type Variant="spread"|"workbook"|"cards";

const roles=[
 {icon:"👑",name:"Лидер",text:"Держит общий замысел, помогает команде двигаться к цели."},
 {icon:"🔎",name:"Аналитик",text:"Исследует аудиторию, вопросы и реальные потребности."},
 {icon:"⚙️",name:"Технолог",text:"Превращает идею в работающий прототип."},
 {icon:"📣",name:"Коммуникатор",text:"Объясняет смысл проекта людям и партнёрам."}
];

function Field({title,big=false}:{title:string;big?:boolean}){return <div className={`paperField ${big?"big":""}`}><b>{title}</b><div className="lines"/></div>}

function PrintSpread(){return <article className="sheet spread">
 <header className="sheetHeader"><div><span>ЭТАП 1</span><h1>Моя экспедиция к идее</h1></div><div className="pageMark">01</div></header>
 <div className="introStrip"><b>Зачем этот этап</b><p>Зафиксировать первую версию идеи, увидеть команду и понять, с чего начинается проектный маршрут.</p></div>
 <div className="twoColumns">
  <section className="leftColumn">
   <div className="pair"><div className="note fact"><strong>🚀 ФАКТ</strong><p>Сильный проект начинается не с идеального ответа, а с точного вопроса.</p></div><div className="note tip"><strong>💡 СОВЕТ</strong><p>Сначала объясни идею простыми словами. Термины можно добавить позже.</p></div></div>
   <Field title="Название проекта / идеи"/>
   <Field title="Первая искра идеи" big/>
   <div className="pair"><Field title="Что получилось?"/><Field title="Что пока не получилось?"/></div>
  </section>
  <aside className="rightColumn">
   <h2>Экипаж и роли</h2>
   <div className="roleList">{roles.map(r=><div className="roleRow" key={r.name}><span>{r.icon}</span><div><b>{r.name}</b><p>{r.text}</p></div></div>)}</div>
   <Field title="Моя основная роль"/>
   <Field title="Роль, которую хочу попробовать"/>
  </aside>
 </div>
 <footer className="sheetFooter"><span>ЖИВАЯ ПЛАНЁРКА МАРС</span><span>похожа на печатный разворот</span></footer>
 </article>}

function Workbook(){return <article className="sheet workbook">
 <header className="workbookHeader"><span className="circle">1</span><div><small>ПРОЕКТНЫЙ МАРШРУТ</small><h1>Моя экспедиция к идее</h1></div></header>
 <div className="workGrid">
  <section className="mainWork">
   <div className="handNote">Начни с того, что уже знаешь. Не пытайся сразу сделать идеальную формулировку.</div>
   <div className="fieldGrid"><Field title="Название проекта / идеи"/><Field title="Для кого этот проект?"/></div>
   <Field title="Первая искра идеи" big/>
   <h2>Что произошло на старте?</h2>
   <div className="fieldGrid"><Field title="Что мы сделали?"/><Field title="Что получилось?"/><Field title="Что не получилось?"/><Field title="Что стало неожиданностью?"/></div>
  </section>
  <aside className="marginNotes">
   <div className="sticker orange"><b>🚀 ФАКТ</b><p>Ошибки на старте — это данные для следующего шага.</p></div>
   <div className="sticker purple"><b>КОМАНДА</b>{roles.map(r=><p key={r.name}>{r.icon} {r.name}</p>)}</div>
   <div className="sticker green"><b>МОЙ ВЫБОР</b><p>Основная роль:</p><div className="shortLine"/><p>Хочу попробовать:</p><div className="shortLine"/></div>
  </aside>
 </div>
 <footer className="sheetFooter"><span>Вариант 2 · рабочая тетрадь</span><span>поля и заметки как на бумаге</span></footer>
 </article>}

function CompactCards(){return <article className="sheet cards">
 <header className="cardsHeader"><div><small>ЭТАП 1 ИЗ 45</small><h1>Моя экспедиция к идее</h1><p>Первая фиксация замысла и команды</p></div><div className="badge">01</div></header>
 <div className="mosaic">
  <div className="tile intro"><b>Зачем этот этап</b><p>Собрать первую версию идеи и обозначить свой следующий шаг.</p></div>
  <div className="tile fact"><b>🚀 Факт</b><p>Пилот нужен не для доказательства, а для получения данных.</p></div>
  <div className="tile tip"><b>💡 Совет</b><p>Проверь, может ли другой человек пересказать твою идею.</p></div>
  <div className="tile wide"><Field title="Название проекта / идеи"/></div>
  <div className="tile tall"><Field title="Первая искра идеи" big/></div>
  <div className="tile roles"><h2>Экипаж</h2>{roles.map(r=><span key={r.name}>{r.icon}<small>{r.name}</small></span>)}</div>
  <div className="tile"><Field title="Что получилось?"/></div>
  <div className="tile"><Field title="Что изменить?"/></div>
  <div className="tile wide motivation"><b>✨ Продолжай маршрут</b><p>Замысел становится проектом, когда команда начинает действовать и проверять предположения.</p></div>
 </div>
 <footer className="sheetFooter"><span>Вариант 3 · компактная мозаика</span><span>минимум прокрутки</span></footer>
 </article>}

export default function ComparePage(){
 const[variant,setVariant]=useState<Variant>("spread");
 return <main className="comparePage">
  <section className="compareTop"><div><p>МАРС DESIGN LAB</p><h1>Сравнение компоновки электронной планёрки</h1><span>Один и тот же этап в трёх вариантах. Все варианты сохраняют ощущение печатной страницы.</span></div><a href="/">Вернуться в планёрку</a></section>
  <nav className="variantTabs">
   <button className={variant==="spread"?"active":""} onClick={()=>setVariant("spread")}><b>1. Печатный разворот</b><span>Две колонки, поля и боковая полоса</span></button>
   <button className={variant==="workbook"?"active":""} onClick={()=>setVariant("workbook")}><b>2. Рабочая тетрадь</b><span>Основное поле и заметки на полях</span></button>
   <button className={variant==="cards"?"active":""} onClick={()=>setVariant("cards")}><b>3. Компактная мозаика</b><span>Плотнее и меньше прокрутки</span></button>
  </nav>
  <div className="preview">{variant==="spread"?<PrintSpread/>:variant==="workbook"?<Workbook/>:<CompactCards/>}</div>
  <section className="compareNotes"><h2>Как сравнивать</h2><div><p><b>Похожесть на печатную:</b> насколько страница ощущается как разворот планёрки.</p><p><b>Удобство заполнения:</b> легко ли находить нужное поле и удерживать контекст.</p><p><b>Компактность:</b> сколько содержания видно без длинной прокрутки.</p></div></section>
  <style jsx global>{`
   *{box-sizing:border-box} body{margin:0;background:#eeeaf3;color:#241d2d;font-family:Arial,Helvetica,sans-serif}.comparePage{min-height:100vh;padding:28px}.compareTop{max-width:1400px;margin:0 auto 20px;display:flex;justify-content:space-between;gap:24px;align-items:flex-start}.compareTop p{margin:0 0 8px;color:#7145a6;font-weight:900;letter-spacing:.12em;font-size:12px}.compareTop h1{margin:0 0 8px;font-size:32px}.compareTop span{color:#6d6575}.compareTop a{background:#fff;color:#62408e;text-decoration:none;padding:12px 16px;border-radius:14px;font-weight:700;box-shadow:0 8px 25px #33204712}.variantTabs{max-width:1400px;margin:0 auto 22px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.variantTabs button{border:1px solid #d9d0e3;background:#fff;padding:16px;text-align:left;border-radius:16px;cursor:pointer;color:#30283a}.variantTabs button b,.variantTabs button span{display:block}.variantTabs button span{font-size:12px;color:#777080;margin-top:5px}.variantTabs button.active{border:2px solid #7650aa;background:#f8f3ff;box-shadow:0 10px 30px #7650aa1c}.preview{max-width:1400px;margin:auto;overflow:auto;padding:5px 0 20px}.sheet{width:1180px;min-height:760px;margin:auto;background:#fffdf8;box-shadow:0 20px 55px #2d1b3a24;border-radius:4px;padding:38px 44px;position:relative}.sheet:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,transparent 49.8%,#6c5a7230 50%,transparent 50.2%);opacity:.35}.sheetHeader,.cardsHeader{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #251d2e;padding-bottom:14px;margin-bottom:18px}.sheetHeader span,.cardsHeader small{font-size:12px;letter-spacing:.14em;font-weight:900;color:#7145a6}.sheet h1{font-family:Georgia,serif;font-size:42px;margin:4px 0}.pageMark,.badge{font-family:Georgia,serif;font-size:52px;color:#e55a36;font-weight:700}.introStrip{display:grid;grid-template-columns:180px 1fr;gap:20px;padding:12px 0 16px;border-bottom:1px solid #d9d1c7}.introStrip b{color:#7145a6;text-transform:uppercase;letter-spacing:.08em}.introStrip p{margin:0;line-height:1.45}.twoColumns{display:grid;grid-template-columns:1.28fr .72fr;gap:30px;margin-top:22px}.rightColumn{border-left:1px solid #cfc6ba;padding-left:25px}.rightColumn h2,.mainWork h2,.roles h2{font-family:Georgia,serif;margin:0 0 12px}.pair,.fieldGrid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.note{padding:14px;border:1px solid;border-radius:3px;min-height:105px}.note strong{font-size:12px;letter-spacing:.08em}.note p{margin:8px 0 0;line-height:1.4;font-size:14px}.note.fact{background:#fff2e9;border-color:#efb59e}.note.tip{background:#f3ecff;border-color:#c7afe4}.paperField{border:1px solid #bdb4aa;padding:12px;margin:14px 0;background:#fffefa;min-height:88px}.paperField.big{min-height:145px}.paperField b{font-family:Georgia,serif;font-size:17px}.lines{margin-top:14px;height:45px;background:repeating-linear-gradient(to bottom,transparent 0,transparent 20px,#d8d1c8 21px)}.paperField.big .lines{height:95px}.roleList{display:grid;gap:8px}.roleRow{display:grid;grid-template-columns:38px 1fr;gap:10px;border-bottom:1px solid #ded6cc;padding:8px 0}.roleRow>span{font-size:25px}.roleRow p{margin:3px 0 0;font-size:12px;line-height:1.35;color:#5f5863}.sheetFooter{position:absolute;bottom:18px;left:44px;right:44px;display:flex;justify-content:space-between;border-top:1px solid #bdb4aa;padding-top:9px;font-size:10px;letter-spacing:.1em;color:#6e6570}.workbookHeader{display:flex;gap:15px;align-items:center;border-bottom:2px solid #7650aa;padding-bottom:12px}.circle{display:grid;place-items:center;width:56px;height:56px;background:#7650aa;color:#fff;border-radius:50%;font:700 28px Georgia}.workbookHeader small{letter-spacing:.12em;color:#7650aa;font-weight:800}.workbookHeader h1{margin:2px 0}.workGrid{display:grid;grid-template-columns:1fr 275px;gap:26px;margin-top:20px}.marginNotes{border-left:2px dashed #d4c9dc;padding-left:18px}.handNote{font-family:Georgia,serif;font-style:italic;font-size:18px;line-height:1.5;padding:14px 18px;background:#f6f0e8;transform:rotate(-.4deg);margin-bottom:16px}.sticker{padding:16px;margin-bottom:14px;box-shadow:3px 5px 0 #2b203319;transform:rotate(.5deg)}.sticker p{margin:8px 0;font-size:14px}.sticker.orange{background:#ffe2cc}.sticker.purple{background:#e8daf8}.sticker.green{background:#dff1df}.shortLine{border-bottom:1px solid #766d76;height:16px}.cardsHeader p{margin:4px 0;color:#6d6575}.mosaic{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:minmax(116px,auto);gap:12px}.tile{border:1px solid #cfc7bd;padding:14px;background:#fffefa}.tile p{margin:7px 0 0;line-height:1.4}.tile.intro{grid-column:span 2;background:#f7f0e8}.tile.fact{background:#fff0e7}.tile.tip{background:#f0e8fb}.tile.wide{grid-column:span 2}.tile.tall{grid-row:span 2}.tile.roles{grid-column:span 2;display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.tile.roles h2{grid-column:1/-1}.tile.roles span{text-align:center;font-size:26px}.tile.roles small{display:block;font-size:10px;margin-top:5px}.tile.motivation{background:#eaf5ed}.tile .paperField{margin:0;border:0;padding:0;min-height:82px}.tile .paperField.big{min-height:210px}.compareNotes{max-width:1400px;margin:8px auto 40px;background:#fff;padding:18px 22px;border-radius:16px}.compareNotes h2{margin:0 0 12px}.compareNotes>div{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}.compareNotes p{margin:0;line-height:1.45}@media(max-width:900px){.comparePage{padding:14px}.compareTop{display:block}.compareTop a{display:inline-block;margin-top:14px}.variantTabs{grid-template-columns:1fr}.sheet{transform-origin:top left}.compareNotes>div{grid-template-columns:1fr}.preview{padding-bottom:0}}
  `}</style>
 </main>
}
