"use client";

import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {plannerFieldLabels} from "../../lib/planner-field-labels";

type Entry={
  field_key:string;
  value:string;
  updated_at:string;
};

type StaffMember={id:number;login:string;role:"teacher"|"methodist";assigned:boolean};

type Student={
  student_id:string;
  planner_type:"middle"|"senior";
  is_active:boolean;
  created_at:string;
};

const middlePageTitles:Record<number,string>={
  1:"Моя экспедиция к идее",
  2:"Сканирование локации",
  3:"Моё состояние и впечатления",
  4:"Путевой лист экспедиции: Никола-Ленивец",
  5:"Рефлексия экспедиции «Никола-Ленивец»",
  6:"Штаб-квартира проекта",
  7:"Карта знаний и дефицитов",
  8:"От Ленивца до Абхазии",
  9:"План действий в поезде",
  10:"План пилотирования на МАРСфесте",
  11:"Разбор полётов. Абхазия",
  12:"Самые яркие открытия Абхазии",
  13:"Финальный план: МАРСфест завтра",
  14:"Проект в работе",
  15:"От МАРСфеста до Partners Day",
  16:"Моя экспедиция после Partners Day",
  17:"Лист договорённостей с Partners Day",
  18:"Командная динамика и открытия",
  19:"Экспедиционный отчёт: от идеи к презентации",
  20:"Сканирование локации после Partners Day",
  21:"Моя проектная вселенная",
  22:"Моё видео и цитата: выбор и смысл",
  23:"Моя позиция и личная история",
  24:"Сценарий трёхминутного видео",
  25:"Моя точка силы",
  26:"Моя точка роста",
  27:"Моя минута силы",
  28:"Мои заметки и расчёты",
  29:"Проекты, которые зажигают меня",
  30:"Где про мой проект говорили?",
  31:"Дорожная карта миссии",
  32:"Карта экспертов и партнёров",
  33:"Блок рисков и барьеров",
  34:"Лист договорённостей с Partners Day",
  35:"Бюджет миссии и ресурсы",
  36:"Свободное пространство: заметки и расчёты",
  37:"Моё путешествие в Великий Новгород",
  38:"Игра «Уездный город N»: образ и стратегия"
};

const seniorPageTitles:Record<number,string>={
  1:"Моя экспедиция к идее",
  2:"Сканирование локации",
  3:"Моё состояние и впечатления",
  4:"Путевой лист экспедиции: Никола-Ленивец",
  5:"Рефлексия экспедиции «Никола-Ленивец»",
  6:"Штаб-квартира проекта",
  7:"Карта знаний и дефицитов",
  8:"От Ленивца до Абхазии",
  9:"План действий в поезде",
  10:"План пилотирования на МАРСфесте",
  11:"Разбор полётов. Абхазия",
  12:"Самые яркие открытия Абхазии",
  13:"Финальный план: МАРСфест завтра",
  14:"Проект в работе",
  15:"От МАРСфеста до Partners Day",
  16:"Подготовка к Partners Day",
  17:"Ответы на вопросы партнёров",
  18:"Экспедиционный отчёт: от идеи к презентации",
  19:"Командная динамика",
  20:"Моя экспедиция после Partners Day",
  21:"Сканирование локации после Partners Day",
  22:"Состояние и впечатления после проектного цикла",
  23:"Дорожная карта миссии",
  24:"Карта экспертов и партнёров",
  25:"Лист договорённостей с Partners Day",
  26:"Бюджет миссии и ресурсы",
  27:"Блок рисков и барьеров",
  28:"Мои заметки и расчёты",
  29:"Мои проекты: карта влияния",
  30:"Реализация и эффект",
  31:"Мотивационное письмо: конструктор",
  32:"Компетенции и доказательства",
  33:"Motivational Letter Guide",
  34:"Competencies and Evidence",
  35:"Cover Letter",
  36:"Cover Letter in English",
  37:"1,5 минуты авторства",
  38:"Самопрезентация: трудность и вывод",
  39:"My 90-Second Story",
  40:"Анализ цитаты и личная позиция",
  41:"Личная история как доказательство позиции",
  42:"My Quote. My Voice",
  43:"My Quote. My 3-Minute Video",
  44:"Моё путешествие в Великий Новгород",
  45:"Игра «Уездный город N»"
};

export default function AdminStudentPage(){
  const[student,setStudent]=useState<Student|null>(null);
  const[entries,setEntries]=useState<Entry[]>([]);
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState("");
  const[allowedPages,setAllowedPages]=useState<number[]>([]);
  const[accessLoading,setAccessLoading]=useState(true);
  const[accessSaving,setAccessSaving]=useState(false);
  const[accessSaved,setAccessSaved]=useState(false);
  const[accessError,setAccessError]=useState("");
  const[newPassword,setNewPassword]=useState("");
  const[showPassword,setShowPassword]=useState(false);
  const[passwordSaving,setPasswordSaving]=useState(false);
  const[passwordSaved,setPasswordSaved]=useState(false);
  const[passwordError,setPasswordError]=useState("");
  const[staff,setStaff]=useState<StaffMember[]>([]);
  const[staffLoading,setStaffLoading]=useState(true);
  const[staffSaving,setStaffSaving]=useState(false);
  const[staffSaved,setStaffSaved]=useState(false);
  const[staffError,setStaffError]=useState("");

  useEffect(()=>{
    const id=new URLSearchParams(location.search).get("id")||"";

    fetch(`/api/admin/student?id=${encodeURIComponent(id)}`,{
      credentials:"include",
      cache:"no-store"
    })
      .then(async response=>{
        const data=await response.json();
        if(!response.ok||!data.ok)throw new Error(data.error||"Ошибка загрузки");
        setStudent(data.student);
        setEntries(data.entries||[]);
      })
      .catch(error=>setError(error.message||"Ошибка загрузки"))
      .finally(()=>setLoading(false));

    fetch(`/api/admin/student-staff?id=${encodeURIComponent(id)}`,{
      credentials:"include",
      cache:"no-store"
    })
      .then(async response=>{
        const data=await response.json();
        if(!response.ok||!data.ok)throw new Error(data.error||"Ошибка загрузки сотрудников");
        setStaff(data.staff||[]);
      })
      .catch(error=>setStaffError(error.message||"Ошибка загрузки сотрудников"))
      .finally(()=>setStaffLoading(false));

    fetch(`/api/admin/student-access?id=${encodeURIComponent(id)}`,{
      credentials:"include",
      cache:"no-store"
    })
      .then(async response=>{
        const data=await response.json();
        if(!response.ok||!data.ok)throw new Error(data.error||"Ошибка загрузки доступа");

        const max=data.plannerType==="senior"?45:38;
        const pages=Array.isArray(data.allowedPages)
          ?data.allowedPages.map(Number).filter((n:number)=>Number.isInteger(n)&&n>=1&&n<=max)
          :Array.from({length:max},(_,i)=>i+1);

        setAllowedPages(pages);
      })
      .catch(error=>setAccessError(error.message||"Ошибка загрузки доступа"))
      .finally(()=>setAccessLoading(false));
  },[]);

  const filled=useMemo(
    ()=>entries.filter(entry=>entry.value.trim()!==""),
    [entries]
  );

  const maxPage=student?.planner_type==="senior"?45:38;
  const allPages=useMemo(()=>Array.from({length:maxPage},(_,i)=>i+1),[maxPage]);

  const togglePage=(n:number)=>{
    setAccessSaved(false);
    setAllowedPages(list=>
      list.includes(n)
        ?list.filter(x=>x!==n)
        :[...list,n].sort((a,b)=>a-b)
    );
  };

  const changePassword=async()=>{
    if(!student)return;

    setPasswordError("");
    setPasswordSaved(false);

    if(newPassword.length<8){
      setPasswordError("Пароль должен содержать не менее 8 символов");
      return;
    }

    setPasswordSaving(true);

    try{
      const response=await fetch("/api/admin/student-password",{
        method:"PUT",
        credentials:"include",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          studentId:student.student_id,
          password:newPassword
        })
      });

      const data=await response.json();

      if(!response.ok||!data.ok){
        throw new Error(data.error||"Не удалось сменить пароль");
      }

      setNewPassword("");
      setPasswordSaved(true);
      setTimeout(()=>setPasswordSaved(false),1500);
    }catch(error:any){
      setPasswordError(error?.message||"Ошибка смены пароля");
    }finally{
      setPasswordSaving(false);
    }
  };

  const saveStaff=async()=>{
    if(!student)return;

    setStaffSaving(true);
    setStaffSaved(false);
    setStaffError("");

    try{
      const response=await fetch("/api/admin/student-staff",{
        method:"PUT",
        credentials:"include",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          studentId:student.student_id,
          staffIds:staff.filter(item=>item.assigned).map(item=>item.id)
        })
      });

      const data=await response.json();

      if(!response.ok||!data.ok){
        throw new Error(data.error||"Не удалось сохранить сотрудников");
      }

      setStaffSaved(true);
      setTimeout(()=>setStaffSaved(false),1500);
    }catch(error:any){
      setStaffError(error?.message||"Ошибка сохранения сотрудников");
    }finally{
      setStaffSaving(false);
    }
  };

  const saveAccess=async()=>{
    if(!student)return;

    setAccessSaving(true);
    setAccessSaved(false);
    setAccessError("");

    try{
      const response=await fetch("/api/admin/student-access",{
        method:"PUT",
        credentials:"include",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          studentId:student.student_id,
          allowedPages
        })
      });

      const data=await response.json();

      if(!response.ok||!data.ok){
        throw new Error(data.error||"Не удалось сохранить доступ");
      }

      setAllowedPages(data.allowedPages||[]);
      setAccessSaved(true);
      setTimeout(()=>setAccessSaved(false),1500);
    }catch(error:any){
      setAccessError(error?.message||"Ошибка сохранения");
    }finally{
      setAccessSaving(false);
    }
  };

  return <main className="studentDataPage">
    <header>
      <div className="brand">
        <img src="/mars-logo.svg" alt="МАРС"/>
        <div>
          <b>ПРОЕКТИРУЕМ БУДУЩЕЕ</b>
          <span>Данные ученика</span>
        </div>
      </div>
      <Link href="/admin">← К списку учеников</Link>
    </header>

    <section className="studentDataWrap">
      {loading&&<div className="state">Загрузка…</div>}

      {!loading&&error&&<div className="state error">{error}</div>}

      {!loading&&!error&&student&&<>
        <section className="studentHero">
          <div>
            <p>ID УЧЕНИКА</p>
            <h1>{student.student_id}</h1>
            <span>
              {student.planner_type==="middle"
                ?"Планёрка 5–7 уровней"
                :"Планёрка 8–11 уровней"}
            </span>
          </div>

          <div className="studentStats">
            <article>
              <b>{filled.length}</b>
              <small>заполнено полей</small>
            </article>
            <article>
              <b>{entries.length}</b>
              <small>всего сохранено</small>
            </article>
            <article>
              <b>{student.is_active?"Да":"Нет"}</b>
              <small>доступ активен</small>
            </article>
          </div>
        </section>

        <section className="passwordPanel">
          <div>
            <p>ПАРОЛЬ ДОСТУПА</p>
            <h2>Сменить пароль ученика</h2>
            <span>Старый пароль не отображается. Здесь можно задать новый пароль для входа.</span>
          </div>

          <div className="passwordForm">
            <input
              type={showPassword?"text":"password"}
              value={newPassword}
              onChange={e=>setNewPassword(e.target.value)}
              placeholder="Новый пароль — не менее 8 символов"
            />
            <button type="button" onClick={()=>setShowPassword(v=>!v)}>{showPassword?"Скрыть пароль":"Показать пароль"}</button>
            <button onClick={changePassword} disabled={passwordSaving}>
              {passwordSaving
                ?"Сохраняем…"
                :passwordSaved
                  ?"Пароль изменён ✓"
                  :"Сменить пароль"}
            </button>
          </div>

          {passwordError&&<div className="passwordError">{passwordError}</div>}
        </section>

        <section className="staffPanel">
          <div className="staffHead">
            <div>
              <p>СОПРОВОЖДЕНИЕ УЧЕНИКА</p>
              <h2>Тьюторы и методисты</h2>
              <span>Отмеченные сотрудники увидят этого ученика в своём кабинете.</span>
            </div>

            <button onClick={saveStaff} disabled={staffSaving}>
              {staffSaving?"Сохраняем…":staffSaved?"Сохранено ✓":"Сохранить назначения"}
            </button>
          </div>

          {staffLoading
            ?<div className="staffState">Загрузка сотрудников…</div>
            :staff.length===0
              ?<div className="staffState">Нет активных сотрудников.</div>
              :<div className="staffGrid">
                {staff.map(item=><label key={item.id} className={item.assigned?"staffToggle active":"staffToggle"}>
                  <input
                    type="checkbox"
                    checked={item.assigned}
                    onChange={()=>{
                      setStaffSaved(false);
                      setStaff(list=>list.map(x=>x.id===item.id?{...x,assigned:!x.assigned}:x));
                    }}
                  />
                  <span>
                    <b>{item.role==="teacher"?"Тьютор":"Методист"}</b>
                    <small>{item.login}</small>
                  </span>
                </label>)}
              </div>
          }

          {staffError&&<div className="staffError">{staffError}</div>}
        </section>

        <section className="accessPanel">
          <div className="accessHead">
            <div>
              <p>ДОСТУП К ПЛАНЁРКЕ</p>
              <h2>Назначенные развороты</h2>
              <span>Ученик увидит только отмеченные листы. Снятие доступа не удаляет его ответы.</span>
            </div>
            <div className="accessActions">
              <button onClick={()=>setAllowedPages(allPages)}>Открыть все</button>
              <button onClick={()=>setAllowedPages([])}>Закрыть все</button>
              <button className="saveAccess" onClick={saveAccess} disabled={accessSaving}>
                {accessSaving?"Сохраняем…":accessSaved?"Сохранено ✓":"Сохранить доступ"}
              </button>
            </div>
          </div>

          {accessLoading
            ?<div className="accessState">Загрузка доступа…</div>
            :<>
              <div className="pageGrid">
                {allPages.map(n=><label key={n} className={allowedPages.includes(n)?"pageToggle active": "pageToggle"}>
                  <input
                    type="checkbox"
                    checked={allowedPages.includes(n)}
                    onChange={()=>togglePage(n)}
                  />
                  <span>
                      <b>{String(n).padStart(2,"0")}</b>
                      <small>{(student?.planner_type==="senior"?seniorPageTitles:middlePageTitles)[n]}</small>
                    </span>
                </label>)}
              </div>
              <div className="accessFoot">
                <b>Назначено: {allowedPages.length} из {maxPage}</b>
                {accessError&&<span className="accessError">{accessError}</span>}
              </div>
            </>
          }
        </section>

        <section className="answers">
          <div className="answersHead">
            <div>
              <p>ОТВЕТЫ УЧЕНИКА</p>
              <h2>Заполненные поля</h2>
            </div>
            <span>Показаны только непустые ответы</span>
          </div>

          {filled.length===0
            ?<div className="empty">Пока нет заполненных ответов.</div>
            :filled.map(entry=><article key={entry.field_key}>
              <div className="answerMeta">
                <b>{plannerFieldLabels[
                  entry.field_key
                    .replace(/^mars-book-/,"")
                    .replace(/^mars-senior-/,"")
                ] || entry.field_key}</b>
                <small className="fieldKey">{entry.field_key}</small>
                <small>{new Date(entry.updated_at).toLocaleString("ru-RU")}</small>
              </div>
              <div className="answerValue">{entry.value}</div>
            </article>)
          }
        </section>
      </>}
    </section>

    <style jsx global>{`
      *{box-sizing:border-box}
      body{margin:0;font-family:Inter,Arial,sans-serif;background:#f7f5fa;color:#33263f}
      .studentDataPage{min-height:100vh;background:radial-gradient(circle at 8% 5%,#fff3ed 0,transparent 24%),radial-gradient(circle at 92% 6%,#eee6ff 0,transparent 26%),#f7f5fa}
      .studentDataPage header{height:78px;padding:0 34px;display:flex;align-items:center;justify-content:space-between;background:#ffffffdf;border-bottom:1px solid #e9e1ef}
      .studentDataPage header a{padding:9px 13px;border-radius:12px;background:#eee7f8;color:#5b2aac;text-decoration:none;font-weight:800}
      .brand{display:flex;align-items:center;gap:14px}
      .brand img{width:80px}
      .brand div{display:grid;gap:3px}
      .brand b{font-size:10px;letter-spacing:.15em;color:#ff5c3b}
      .brand span{font-weight:800;color:#5530a4}
      .studentDataWrap{max-width:1180px;margin:auto;padding:40px 28px 70px}
      .studentHero{display:flex;justify-content:space-between;gap:24px;align-items:center;padding:32px 36px;border:1px solid #e8e0ef;border-radius:28px;background:linear-gradient(135deg,#fff,#faf7ff 60%,#fff1ea);box-shadow:0 20px 56px #3b2a5510}
      .studentHero p,.answersHead p{margin:0 0 8px;font-size:11px;letter-spacing:.14em;font-weight:900;color:#7650ad}
      .studentHero h1{margin:0 0 8px;font-size:44px;color:#3b2255}
      .studentHero span{color:#716778}
      .studentStats{display:grid;grid-template-columns:repeat(3,120px);gap:9px}
      .studentStats article{padding:16px 10px;border:1px solid #e9e1ef;border-radius:18px;background:#fff;text-align:center}
      .studentStats b{display:block;font-size:25px;color:#5e2abb}
      .studentStats small{color:#817688}
      .passwordPanel{margin-top:22px;padding:22px 24px;border:1px solid #e8e0ef;border-radius:24px;background:#fff;display:grid;grid-template-columns:1fr auto;gap:18px;align-items:end}.passwordPanel p{margin:0 0 7px;font-size:11px;letter-spacing:.14em;font-weight:900;color:#7650ad}.passwordPanel h2{margin:0 0 7px;color:#432172}.passwordPanel>div>span{color:#817688;font-size:13px}.passwordForm{display:flex;gap:8px;align-items:center}.passwordForm input{min-width:260px;border:1px solid #ddd3e6;border-radius:10px;padding:10px 12px;background:#fff;color:#33263f}.passwordForm button{border:0;border-radius:10px;padding:11px 14px;background:#5e2abb;color:#fff;font-weight:850;cursor:pointer;white-space:nowrap}.passwordForm button:disabled{opacity:.55}.passwordError{grid-column:1/-1;padding:9px 11px;border-radius:10px;background:#fff0ed;color:#b94b38;font-size:13px;font-weight:700}.staffPanel{margin-top:22px;padding:22px 24px;border:1px solid #e8e0ef;border-radius:24px;background:#fff}.staffHead{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}.staffHead p{margin:0 0 7px;font-size:11px;letter-spacing:.14em;font-weight:900;color:#7650ad}.staffHead h2{margin:0 0 7px;color:#432172}.staffHead span{color:#817688;font-size:13px}.staffHead button{border:0;border-radius:10px;padding:11px 14px;background:#5e2abb;color:#fff;font-weight:850;cursor:pointer;white-space:nowrap}.staffHead button:disabled{opacity:.55}.staffGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:18px}.staffToggle{cursor:pointer}.staffToggle input{display:none}.staffToggle span{display:grid;gap:4px;padding:14px 16px;border:1px solid #e3d9eb;border-radius:14px;background:#faf8fc}.staffToggle b{color:#5e2abb}.staffToggle small{color:#817688}.staffToggle.active span{background:#f0e9fb;border-color:#8c65c8}.staffState{padding:20px 0;color:#817688}.staffError{margin-top:12px;padding:9px 11px;border-radius:10px;background:#fff0ed;color:#b94b38;font-size:13px;font-weight:700}.accessPanel{margin-top:22px;padding:22px 24px;border:1px solid #e8e0ef;border-radius:24px;background:#fff}.accessHead{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}.accessHead p{margin:0 0 7px;font-size:11px;letter-spacing:.14em;font-weight:900;color:#7650ad}.accessHead h2{margin:0 0 7px;color:#432172}.accessHead span{color:#817688;font-size:13px}.accessActions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.accessActions button{border:1px solid #ded4e7;border-radius:10px;padding:9px 11px;background:#fff;color:#5e2abb;font-weight:800;cursor:pointer}.accessActions .saveAccess{background:#5e2abb;color:#fff;border-color:#5e2abb}.accessActions button:disabled{opacity:.55}.pageGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:18px}.pageToggle{display:grid;place-items:center;cursor:pointer}.pageToggle input{display:none}.pageToggle span{width:100%;min-height:76px;padding:10px 12px;border:1px solid #e3d9eb;border-radius:12px;background:#faf8fc;color:#7f7089;text-align:left;display:grid;grid-template-columns:34px 1fr;gap:8px;align-items:center}.pageToggle span>b{font-size:15px;color:#5e2abb}.pageToggle span>small{font-size:11px;line-height:1.25;font-weight:750}.pageToggle.active span>b{color:#fff}.pageToggle.active span{background:#5e2abb;color:#fff;border-color:#5e2abb}.accessFoot{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-top:14px;color:#5b4a67}.accessError{color:#b94b38;font-size:13px}.accessState{padding:24px;text-align:center;color:#817688}.answers{margin-top:22px;border:1px solid #e8e0ef;border-radius:24px;background:#fff;overflow:hidden}
      .answersHead{display:flex;justify-content:space-between;gap:20px;align-items:end;padding:22px 24px;background:#f7f2fb}
      .answersHead h2{margin:0;color:#432172}
      .answersHead>span{font-size:12px;color:#817688}
      .answers article{display:grid;grid-template-columns:280px 1fr;gap:24px;padding:20px 24px;border-top:1px solid #eee7f3}
      .answerMeta{display:grid;gap:5px;align-content:start}
      .answerMeta b{font-size:13px;color:#5e2abb;word-break:break-word}
      .answerMeta small{color:#8b8190}
      .answerMeta .fieldKey{font-size:10px;color:#aaa0ae;word-break:break-all}
      .answerValue{white-space:pre-wrap;line-height:1.55;color:#33263f}
      .empty,.state{padding:30px;text-align:center;color:#7c7183}
      .state.error{color:#b94b38}
      @media(max-width:800px){
        .passwordPanel{grid-template-columns:1fr}
        .passwordForm{align-items:stretch;flex-direction:column}
        .passwordForm input{min-width:0;width:100%}
        .accessHead{flex-direction:column}
        .accessActions{justify-content:flex-start}
        .pageGrid{grid-template-columns:repeat(2,1fr)}
        .studentHero{align-items:flex-start;flex-direction:column}
        .studentStats{width:100%;grid-template-columns:repeat(3,1fr)}
        .answers article{grid-template-columns:1fr}
        .studentDataPage header{padding:0 16px}
        .studentDataWrap{padding:22px 14px 50px}
      }
    `}</style>
  </main>;
}
