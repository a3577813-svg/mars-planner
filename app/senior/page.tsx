"use client";

import Link from "next/link";
import {useEffect,useState} from "react";

type Item={n:number;title:string;kind:"shared"|"ready";source?:number};
const titles:Record<number,string>={1:"Моя экспедиция к идее",2:"Сканирование локации",3:"Моё состояние и впечатления",4:"Путевой лист экспедиции: Никола-Ленивец",5:"Рефлексия экспедиции «Никола-Ленивец»",6:"Штаб-квартира проекта",7:"Карта знаний и дефицитов",8:"От Ленивца до Абхазии",9:"План действий в поезде",10:"План пилотирования на МАРСфесте",11:"Разбор полётов. Абхазия",12:"Самые яркие открытия Абхазии",13:"Финальный план: МАРСфест завтра",14:"Проект в работе",15:"От МАРСфеста до Partners Day",16:"Подготовка к Partners Day",17:"Ответы на вопросы партнёров",18:"Экспедиционный отчёт: от идеи к презентации",19:"Командная динамика",20:"Моя экспедиция после Partners Day",21:"Сканирование локации после Partners Day",22:"Состояние и впечатления после проектного цикла",23:"Дорожная карта миссии",24:"Карта экспертов и партнёров",25:"Лист договорённостей с Partners Day",26:"Бюджет миссии и ресурсы",27:"Блок рисков и барьеров",28:"Мои заметки и расчёты",29:"Мои проекты: карта влияния",30:"Реализация и эффект",31:"Мотивационное письмо: конструктор",32:"Компетенции и доказательства",33:"Motivational Letter Guide",34:"Competencies and Evidence",35:"Cover Letter",36:"Cover Letter in English",37:"1,5 минуты авторства",38:"Самопрезентация: трудность и вывод",39:"My 90-Second Story",40:"Анализ цитаты и личная позиция",41:"Личная история как доказательство позиции",42:"My Quote. My Voice",43:"My Quote. My 3-Minute Video",44:"Моё путешествие в Великий Новгород",45:"Игра «Уездный город N»"};
const items:Item[]=Array.from({length:45},(_,i)=>{const n=i+1;if(n<=28)return{n,title:titles[n],kind:"shared",source:n};if(n===44)return{n,title:titles[n],kind:"shared",source:37};if(n===45)return{n,title:titles[n],kind:"shared",source:38};return{n,title:titles[n],kind:"ready"}});
function sharedHref(source:number){if(source<=12)return`/book?page=${source}&mode=student&senior=1`;if(source<=15)return`/book-next?page=${source}&mode=student&senior=1`;if(source<=18)return`/book-next2?page=${source}&mode=student&senior=1`;if(source<=21)return`/book-next3?page=${source}&mode=student&senior=1`;if(source<=24)return`/book-next4?page=${source}&mode=student&senior=1`;if(source<=27)return`/book-next5?page=${source}&mode=student&senior=1`;if(source<=30)return`/book-next6?page=${source}&mode=student&senior=1`;if(source<=33)return`/book-next7?page=${source}&mode=student&senior=1`;if(source<=36)return`/book-next8?page=${source}&mode=student&senior=1`;return`/book-next9?page=${source}&mode=student&senior=1`}
function href(item:Item){if(item.kind==="shared")return sharedHref(item.source!);if(item.n<=31)return`/senior/unique?page=${item.n}`;if(item.n<=34)return`/senior/unique2?page=${item.n}`;if(item.n<=37)return`/senior/unique3?page=${item.n}`;if(item.n<=40)return`/senior/unique4?page=${item.n}`;return`/senior/unique5?page=${item.n}`}
export default function SeniorDashboard(){
 const[current,setCurrent]=useState(1);
 const[allowedPages,setAllowedPages]=useState<number[]|null>(null);
 const[submission,setSubmission]=useState<any>(null);
 const[tutorComment,setTutorComment]=useState("");
 const[submitLoading,setSubmitLoading]=useState(false);
 const[submitError,setSubmitError]=useState("");

 useEffect(()=>{fetch("/api/student/comment",{credentials:"include",cache:"no-store"}).then(r=>r.json()).then(data=>{if(data?.ok)setTutorComment(data.comment||"");}).catch(()=>{});},[]);
 useEffect(()=>{
   const refresh=()=>{
     const n=Number(localStorage.getItem("mars-senior-current-page")||"1");
     setCurrent(Math.min(45,Math.max(1,n||1)));
   };

   refresh();
   window.addEventListener("focus",refresh);

   fetch("/api/planner/submit",{
     credentials:"include",
     cache:"no-store"
   })
     .then(r=>r.json())
     .then(data=>{
       if(data?.ok)setSubmission(data.submission||null);
     })
     .catch(()=>{});

   fetch("/api/student/access",{
     credentials:"include",
     cache:"no-store"
   })
     .then(r=>r.json())
     .then(data=>{
       if(data?.ok&&Array.isArray(data.allowedPages)){
         const pages=data.allowedPages
           .map(Number)
           .filter((n:number)=>Number.isInteger(n)&&n>=1&&n<=45);
         setAllowedPages(pages);
       }else{
         setAllowedPages([]);
       }
     })
     .catch(()=>setAllowedPages([]));

   return()=>window.removeEventListener("focus",refresh);
 },[]);

 const visibleItems=allowedPages===null
   ?[]
   :items.filter(item=>allowedPages.includes(item.n));

 const currentItem=
   visibleItems.find(item=>item.n===current)
   ||visibleItems[0]
   ||items[0];

 const hasAccess=visibleItems.length>0;

 const submitPlanner=async()=>{
   setSubmitError("");
   setSubmitLoading(true);

   try{
     const response=await fetch("/api/planner/submit",{
       method:"POST",
       credentials:"include"
     });

     const data=await response.json();

     if(!response.ok||!data.ok){
       throw new Error(data.error||"Не удалось завершить планёрку");
     }

     setSubmission(data.submission);
   }catch(error:any){
     setSubmitError(error?.message||"Ошибка завершения планёрки");
   }finally{
     setSubmitLoading(false);
   }
 };return <main className="senior"><header><div className="brand"><img src="/mars-logo.svg" alt="МАРС"/><div><b>ПРОЕКТИРУЕМ БУДУЩЕЕ</b><span>Личный кабинет ученика</span></div></div><div className="identity"><strong>8–11 уровни</strong><Link href="/">Выйти</Link></div></header><section className="hero"><div><p>ТВОЙ ЛИЧНЫЙ МАРШРУТ</p><h1>Продолжим проектное путешествие?</h1><span>Планёрка сохраняет твои идеи, решения и открытия на каждом этапе.</span>{hasAccess?<Link className="primary" href={href(currentItem)} onClick={()=>localStorage.setItem("mars-senior-current-page",String(currentItem.n))}>Продолжить планёрку →</Link>:<span className="noAccess">Пока нет назначенных разворотов</span>}</div><div className="progress"><div className="ring"><strong>{currentItem.n}</strong><span>из 45</span></div><b>Текущий разворот</b><small>{currentItem.title}</small></div></section><section className="content"><div className="sectionTitle"><div><p>ПЛАНЁРКА</p><h2>Мой маршрут</h2></div><span>Доступно {visibleItems.length} разворотов</span></div><div className="dashboardGrid"><section className="routeCard"><div className="list">{visibleItems.map(item=>{const status=item.n===current?"current":item.n<current?"done":"next";return <Link key={item.n} href={href(item)} onClick={()=>localStorage.setItem("mars-senior-current-page",String(item.n))} className={status}><b>{String(item.n).padStart(2,"0")}</b><div><strong>{item.title}</strong><small>{status==="current"?"Открыт сейчас":status==="done"?"Уже доступен":"Доступен"}</small></div><span>→</span></Link>})}</div></section><aside><section className="panel accent"><p>СЕЙЧАС В ФОКУСЕ</p><h3>Разворот {String(currentItem.n).padStart(2,"0")}</h3><div>{currentItem.title}</div>{hasAccess&&<Link href={href(currentItem)} onClick={()=>localStorage.setItem("mars-senior-current-page",String(currentItem.n))}>Открыть разворот</Link>}</section><section className="panel submitPanel">
  <p>ЗАВЕРШЕНИЕ ПЛАНЁРКИ</p>
  {submission?.status==="submitted"
    ?<>
      <h3>Планёрка сдана ✓</h3>
      <div>
        {submission.submitted_at
          ?`Дата сдачи: ${new Date(submission.submitted_at).toLocaleString("ru-RU")}`
          :"Сдача зафиксирована"}
      </div>
      {submission.pdf_path&&
        <a href="/api/planner/pdf" target="_blank" rel="noreferrer">
          Скачать итоговый PDF
        </a>
      }
    </>
    :submission?.status==="generating"
    ?<>
      <h3>Формируем итоговый PDF…</h3>
      <div>Планёрка принята. Итоговый файл сейчас собирается.</div>
    </>
    :submission?.status==="error"
    ?<>
      <h3>Не удалось сформировать PDF</h3>
      <div>Попробуй завершить планёрку ещё раз.</div>
      <button onClick={submitPlanner} disabled={submitLoading}>
        {submitLoading?"Запускаем повторно…":"Повторить завершение"}
      </button>
    </>
    :<>
      <h3>Готов(а) завершить?</h3>
      <div>После нажатия администратор увидит, что планёрка сдана.</div>
      <button onClick={submitPlanner} disabled={submitLoading}>
        {submitLoading?"Сохраняем…":"Завершить планёрку"}
      </button>
    </>
  }
  {submitError&&<div className="submitError">{submitError}</div>}
</section>

<section className="panel"><p>КОММЕНТАРИЙ ТЬЮТОРА</p>{tutorComment?<><h3>Комментарий тьютора</h3><div>{tutorComment}</div></>:<><h3>Пока нет новых комментариев</h3><div>Когда тьютор оставит заметку, она появится здесь.</div></>}</section></aside></div></section><style jsx global>{`*{box-sizing:border-box}html,body{margin:0;font-family:Inter,Arial,sans-serif;background:#f7f4fb;color:#30243c}.senior{min-height:100vh;background:radial-gradient(circle at 8% 8%,#fff0e8 0,transparent 26%),radial-gradient(circle at 94% 10%,#ece3ff 0,transparent 28%),#f8f6fb}.senior header{height:78px;padding:0 34px;background:#ffffffdf;border-bottom:1px solid #e9e2ef;display:flex;align-items:center;justify-content:space-between}.brand{display:flex;align-items:center;gap:15px}.brand img{width:80px}.brand div{display:grid;gap:3px}.brand b{font-size:10px;letter-spacing:.15em;color:#ff5c3b}.brand span{font-size:14px;font-weight:800;color:#5530a4}.identity{display:flex;align-items:center;gap:16px}.identity strong{color:#442573}.identity a{padding:9px 13px;border-radius:13px;background:#f0e9fa;color:#5b2cb8;text-decoration:none;font-weight:800}.hero{max-width:1256px;margin:42px auto 24px;padding:38px 44px;border-radius:34px;background:linear-gradient(125deg,#4e20a7,#6d2ed0 65%,#7d38dc);color:#fff;display:grid;grid-template-columns:1fr 250px;align-items:center;box-shadow:0 28px 70px #4b229326}.hero>div>p,.sectionTitle p,.panel>p{margin:0 0 8px;font-size:11px;font-weight:900;letter-spacing:.14em}.hero>div>p{color:#ffb39b}.hero h1{margin:0 0 14px;font-size:clamp(34px,5vw,58px);line-height:1.02;letter-spacing:-.04em}.hero>div>span{display:block;max-width:650px;color:#ece3ff;line-height:1.5}.primary{display:inline-flex;margin-top:12px;padding:14px 18px;border-radius:15px;background:#ff5b3c;color:#fff;text-decoration:none;font-weight:900}.progress{text-align:center}.ring{width:160px;height:160px;border-radius:50%;margin:0 auto 12px;display:grid;place-content:center;background:conic-gradient(#ff6547 22%,#ffffff2d 0);box-shadow:inset 0 0 0 18px #5c25b8}.ring strong{font-size:42px}.ring span{font-size:12px;color:#dcd0f4}.progress b,.progress small{display:block}.progress small{margin-top:4px;color:#ded2f4}.content{max-width:1320px;margin:auto;padding:0 32px 70px}.sectionTitle{display:flex;justify-content:space-between;align-items:end;margin:24px 0 14px}.sectionTitle p{color:#7140bd}.sectionTitle h2{margin:0;color:#432172;font-size:29px}.sectionTitle>span{padding:8px 12px;border-radius:999px;background:#f2ecfa;color:#6b3bc4;font-size:12px;font-weight:800}.dashboardGrid{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:24px;align-items:start}.routeCard,.panel{background:#fff;border:1px solid #ece5f2;border-radius:27px;box-shadow:0 18px 48px #3b2a5510}.routeCard{padding:27px}.list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.list>a{display:flex;align-items:center;gap:13px;min-width:0;padding:14px;border:1px solid #eee7f3;border-radius:18px;text-decoration:none;color:#4e4657;background:#fcfbfd}.list>a:hover{border-color:#bca6da;transform:translateY(-1px)}.list>a.current{background:#fff4ef;border-color:#ffd3c5}.list>a.done{background:#f3faf5;border-color:#d7eadb}.list>a.next{opacity:.82}.list>a>b{width:42px;height:42px;flex:0 0 42px;border-radius:13px;background:#f0e9fa;color:#6633bf;display:grid;place-items:center;font-weight:900}.list>a.current>b{background:#ffdfd5;color:#d84a2e}.list div{display:grid;gap:3px;min-width:0;flex:1}.list strong{line-height:1.25}.list small{color:#8b8294}.list>a>span{font-weight:900;color:#ff5a39}aside{display:grid;gap:16px;align-content:start;position:sticky;top:96px}.panel{padding:23px}.panel>p{color:#7954bd}.panel h3{margin:4px 0 8px;color:#442172;font-size:22px}.panel>div{line-height:1.45;color:#756d7d}.panel a{display:inline-block;margin-top:14px;padding:10px 13px;border-radius:12px;background:#5e2abb;color:#fff;text-decoration:none;font-weight:800}.submitPanel button{margin-top:14px;border:0;border-radius:12px;padding:11px 14px;background:#ff5b3c;color:#fff;font-weight:900;cursor:pointer}.submitPanel button:disabled{opacity:.55}.submitPanel small{display:block;margin-top:9px;color:#8a8191;line-height:1.4}.submitError{margin-top:10px;color:#b94b38;font-weight:700;font-size:13px}.accent{background:linear-gradient(145deg,#fff3ed,#fff);border-color:#ffd7ca}@media(max-width:1120px){.list{grid-template-columns:1fr}}@media(max-width:900px){.dashboardGrid{grid-template-columns:1fr}.hero{grid-template-columns:1fr 210px}aside{position:static}.list{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:650px){.senior header{padding:0 16px}.brand div,.identity strong{display:none}.hero{margin:22px 14px 24px;grid-template-columns:1fr;padding:28px}.progress{margin-top:28px}.hero h1{font-size:36px}.content{padding:0 14px 50px}.sectionTitle{display:block}.sectionTitle>span{display:inline-block;margin-top:10px}.routeCard{padding:10px}.list{grid-template-columns:1fr}.list>a{align-items:flex-start}.list>a>span{display:none}}
`}</style></main>}
