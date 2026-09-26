"use client";

import Link from "next/link";
import {useEffect,useMemo,useState} from "react";

type Student={
 student_id:string;
 planner_type:"middle"|"senior";
 is_active:boolean;
 created_at:string;
 last_activity:string|null;
 entries_count:number;
 submission_status:"generating"|"submitted"|"error"|null;
 submitted_at:string|null;
 pdf_path:string|null;
};

type StaffMember={
 id:number;
 login:string;
 role:"teacher"|"methodist";
 is_active:boolean;
 created_at:string;
 students_count:number;
};

export default function AdminPage(){
 const[students,setStudents]=useState<Student[]>([]);
 const[filter,setFilter]=useState<"all"|"5–7"|"8–11">("all");
 const[submissionFilter,setSubmissionFilter]=useState<"all"|"none"|"generating"|"submitted"|"error">("all");
 const[query,setQuery]=useState("");
 const[loading,setLoading]=useState(true);
 const[showAdd,setShowAdd]=useState(false);
 const[newId,setNewId]=useState("");
 const[newPassword,setNewPassword]=useState("");
 const[showPassword,setShowPassword]=useState(false);
 const[newPlannerType,setNewPlannerType]=useState<"middle"|"senior">("middle");
 const[creating,setCreating]=useState(false);
 const[createError,setCreateError]=useState("");
 const[staff,setStaff]=useState<StaffMember[]>([]);
 const[showStaff,setShowStaff]=useState(false);
 const[newStaffLogin,setNewStaffLogin]=useState("");
 const[newStaffPassword,setNewStaffPassword]=useState("");
 const[newStaffRole,setNewStaffRole]=useState<"teacher"|"methodist">("teacher");
 const[staffCreating,setStaffCreating]=useState(false);
 const[staffError,setStaffError]=useState("");

 useEffect(()=>{
   fetch("/api/admin/students",{credentials:"include",cache:"no-store"})
     .then(async response=>{
       const data=await response.json();
       if(!response.ok||!data.ok)throw new Error(data.error||"Ошибка загрузки");
       setStudents(data.students||[]);
     })
     .catch(error=>console.error("Admin students load error:",error))
     .finally(()=>setLoading(false));
 },[]);

 useEffect(()=>{
   fetch("/api/admin/staff",{credentials:"include",cache:"no-store"})
     .then(async response=>{
       const data=await response.json();
       if(!response.ok||!data.ok)throw new Error(data.error||"Ошибка загрузки сотрудников");
       setStaff(data.staff||[]);
     })
     .catch(error=>console.error("Admin staff load error:",error));
 },[]);

 const visible=useMemo(()=>students.filter(s=>{
   const group=s.planner_type==="middle"?"5–7":"8–11";

   const submissionMatch=
     submissionFilter==="all"
       ?true
       :submissionFilter==="none"
       ?!s.submission_status
       :s.submission_status===submissionFilter;

   return (
     (filter==="all"||group===filter)
     &&submissionMatch
     &&s.student_id.toLowerCase().includes(query.toLowerCase())
   );
 }),[students,filter,submissionFilter,query]);

 const active=students.filter(s=>s.is_active).length;
 const submittedCount=students.filter(s=>s.submission_status==="submitted").length;
 const generatingCount=students.filter(s=>s.submission_status==="generating").length;
 const errorCount=students.filter(s=>s.submission_status==="error").length;
 const notSubmittedCount=students.filter(s=>!s.submission_status).length;

 const createStudent=async()=>{
   setCreateError("");

   if(!newId.trim()||!newPassword){
     setCreateError("Заполни ID и пароль");
     return;
   }

   setCreating(true);

   try{
     const response=await fetch("/api/admin/students",{
       method:"POST",
       credentials:"include",
       headers:{"Content-Type":"application/json"},
       body:JSON.stringify({
         studentId:newId,
         password:newPassword,
         plannerType:newPlannerType
       })
     });

     const data=await response.json();

     if(!response.ok||!data.ok){
       setCreateError(data.error||"Не удалось создать ученика");
       return;
     }

     setStudents(list=>[
       {
         ...data.student,
         last_activity:null,
         entries_count:0,
         submission_status:null,
         submitted_at:null,
         pdf_path:null
       },
       ...list
     ]);

     setNewId("");
     setNewPassword("");
     setNewPlannerType("middle");
     setShowAdd(false);
   }catch{
     setCreateError("Не удалось связаться с сервером");
   }finally{
     setCreating(false);
   }
 };

 const createStaff=async()=>{
   setStaffError("");

   if(!newStaffLogin.trim()||!newStaffPassword){
     setStaffError("Заполни логин и пароль");
     return;
   }

   setStaffCreating(true);

   try{
     const response=await fetch("/api/admin/staff",{
       method:"POST",
       credentials:"include",
       headers:{"Content-Type":"application/json"},
       body:JSON.stringify({
         login:newStaffLogin,
         password:newStaffPassword,
         role:newStaffRole
       })
     });

     const data=await response.json();

     if(!response.ok||!data.ok){
       setStaffError(data.error||"Не удалось создать сотрудника");
       return;
     }

     setStaff(list=>[data.staff,...list]);
     setNewStaffLogin("");
     setNewStaffPassword("");
     setNewStaffRole("teacher");
   }catch{
     setStaffError("Не удалось связаться с сервером");
   }finally{
     setStaffCreating(false);
   }
 };

 const toggleStaff=async(item:StaffMember)=>{
   setStaffError("");

   try{
     const response=await fetch("/api/admin/staff",{
       method:"PATCH",
       credentials:"include",
       headers:{"Content-Type":"application/json"},
       body:JSON.stringify({
         id:item.id,
         isActive:!item.is_active
       })
     });

     const data=await response.json();

     if(!response.ok||!data.ok){
       setStaffError(data.error||"Не удалось изменить статус сотрудника");
       return;
     }

     setStaff(list=>list.map(value=>
       value.id===item.id
         ?{...value,is_active:data.staff.is_active}
         :value
     ));
   }catch{
     setStaffError("Не удалось связаться с сервером");
   }
 };

 return <main className="adminPage">
  <header><div className="brand"><img src="/mars-logo.svg" alt="МАРС"/><div><b>ПРОЕКТИРУЕМ БУДУЩЕЕ</b><span>Администрирование планёрки</span></div></div><div className="identity"><strong>Администратор МАРС</strong><Link href="/">Выйти</Link></div></header>
  <section className="adminWrap">
   <div className="adminHero"><div><p>МОДУЛЬ «ЖИВАЯ ПЛАНЁРКА»</p><h1>Управление участниками</h1><span>Здесь администратор распределяет учеников по версиям планёрки, назначает тьюторов и управляет доступом.</span></div><div className="heroStats submissionStats">
  <article><b>{students.length}</b><small>всего</small></article>
  <article><b>{submittedCount}</b><small>сдано</small></article>
  <article><b>{notSubmittedCount}</b><small>не сдано</small></article>
  <article><b>{generatingCount}</b><small>формируется</small></article>
  <article><b>{errorCount}</b><small>ошибка</small></article>
</div></div>
   <div className="adminToolbar">
  <div className="filterStack">
    <div className="filters">
      <button className={filter==="all"?"active":""} onClick={()=>setFilter("all")}>Все</button>
      <button className={filter==="5–7"?"active":""} onClick={()=>setFilter("5–7")}>5–7</button>
      <button className={filter==="8–11"?"active":""} onClick={()=>setFilter("8–11")}>8–11</button>
    </div>
    <div className="filters submissionFilters">
      <button className={submissionFilter==="all"?"active":""} onClick={()=>setSubmissionFilter("all")}>Все статусы</button>
      <button className={submissionFilter==="none"?"active":""} onClick={()=>setSubmissionFilter("none")}>Не сдано</button>
      <button className={submissionFilter==="generating"?"active":""} onClick={()=>setSubmissionFilter("generating")}>Формируется</button>
      <button className={submissionFilter==="submitted"?"active":""} onClick={()=>setSubmissionFilter("submitted")}>Сдано</button>
      <button className={submissionFilter==="error"?"active":""} onClick={()=>setSubmissionFilter("error")}>Ошибка</button>
    </div>
  </div>
  <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Поиск по ID"/><div className="adminToolbarActions">
  <a
    className="allPdfButton"
    href="/api/admin/all-submissions-pdf"
    target="_blank"
    rel="noreferrer"
  >
    Скачать общий PDF
  </a>
  <button className="addStudentButton" onClick={()=>{setShowAdd(v=>!v);setCreateError("")}}>
    {showAdd?"Закрыть":"+ Добавить ученика"}
  </button>
  <button onClick={()=>{setShowStaff(v=>!v);setStaffError("")}}>
    {showStaff?"Закрыть сотрудников":"Сотрудники"}
  </button>
</div></div>

   {showAdd&&<section className="addStudentPanel">
     <div>
       <p>НОВЫЙ УЧЕНИК</p>
       <h3>Добавить ID в систему</h3>
       <span>Введи тот ID, который будет выдан ребёнку для входа.</span>
     </div>

     <div className="addStudentFields">
       <label>
         <span>ID ученика</span>
         <input value={newId} onChange={e=>setNewId(e.target.value)} placeholder="Например, ID12345678"/>
       </label>

       <label>
         <span>Версия планёрки</span>
         <select value={newPlannerType} onChange={e=>setNewPlannerType(e.target.value as "middle"|"senior")}>
           <option value="middle">5–7 уровни</option>
           <option value="senior">8–11 уровни</option>
         </select>
       </label>

       <label>
         <span>Пароль</span>
         <input type={showPassword?"text":"password"} value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="Не менее 8 символов"/>
         <button type="button" onClick={()=>setShowPassword(v=>!v)}>{showPassword?"Скрыть пароль":"Показать пароль"}</button>
       </label>

       <button onClick={createStudent} disabled={creating}>
         {creating?"Создаём…":"Создать ученика"}
       </button>
     </div>

     {createError&&<div className="createError">{createError}</div>}
   </section>}

   {showStaff&&<section className="staffPanel">
     <div className="staffPanelHead">
       <div>
         <p>СОТРУДНИКИ</p>
         <h3>Тьюторы и методисты</h3>
         <span>Создавай аккаунты сотрудников и управляй их доступом.</span>
       </div>
       <b>{staff.length} сотрудников</b>
     </div>

     <div className="staffCreate">
       <label>
         <span>Логин</span>
         <input value={newStaffLogin} onChange={e=>setNewStaffLogin(e.target.value)} placeholder="Например, tutor-anna"/>
       </label>

       <label>
         <span>Роль</span>
         <select value={newStaffRole} onChange={e=>setNewStaffRole(e.target.value as "teacher"|"methodist")}>
           <option value="teacher">Тьютор</option>
           <option value="methodist">Методист</option>
         </select>
       </label>

       <label>
         <span>Пароль</span>
         <input type="password" value={newStaffPassword} onChange={e=>setNewStaffPassword(e.target.value)} placeholder="Не менее 8 символов"/>
       </label>

       <button onClick={createStaff} disabled={staffCreating}>
         {staffCreating?"Создаём…":"Добавить сотрудника"}
       </button>
     </div>

     {staffError&&<div className="createError">{staffError}</div>}

     <div className="staffList">
       <div className="staffHead">
         <span>Сотрудник</span>
         <span>Роль</span>
         <span>Ученики</span>
         <span>Доступ</span>
       </div>

       {staff.map(item=><article key={item.id}>
         <div>
           <b>{item.login}</b>
           <small>ID {item.id}</small>
         </div>
         <span>{item.role==="teacher"?"Тьютор":"Методист"}</span>
         <b>{item.students_count}</b>
         <button className={item.is_active?"activeStaff":"inactiveStaff"} onClick={()=>toggleStaff(item)}>
           {item.is_active?"Активен":"Отключён"}
         </button>
       </article>)}
     </div>
   </section>}

   <section className="adminTable">
  <div className="tableHead">
    <span>ID ученика</span>
    <span>Планёрка</span>
    <span>Заполнено</span>
    <span>Последняя активность</span>
    <span>Сдача</span>
    <span>Дата сдачи</span>
    <span>PDF</span>
    <span>Доступ</span>
    <span></span>
  </div>

  {loading
    ?<div style={{padding:24}}>Загрузка…</div>
    :visible.map(student=>
      <article key={student.student_id}>
        <div className="student">
          <span>{student.planner_type==="middle"?"57":"811"}</span>
          <div>
            <b>{student.student_id}</b>
            <small>Идентификатор ученика</small>
          </div>
        </div>

        <b className="plannerType">
          {student.planner_type==="middle"?"5–7 уровни":"8–11 уровни"}
        </b>

        <b>{student.entries_count}</b>

        <span>
          {student.last_activity
            ?new Date(student.last_activity).toLocaleString("ru-RU")
            :"—"}
        </span>

        <b className={`submissionStatus ${student.submission_status||"none"}`}>
          {student.submission_status==="submitted"
            ?"Сдано ✓"
            :student.submission_status==="generating"
            ?"Формируется…"
            :student.submission_status==="error"
            ?"Ошибка"
            :"Не сдано"}
        </b>

        <span>
          {student.submission_status==="submitted"&&student.submitted_at
            ?new Date(student.submitted_at).toLocaleString("ru-RU")
            :"—"}
        </span>

        <span>
          {student.submission_status==="submitted"&&student.pdf_path
            ?<a
                className="openPdf"
                href={`/api/admin/planner-pdf?studentId=${encodeURIComponent(student.student_id)}`}
                target="_blank"
                rel="noreferrer"
              >
                Открыть PDF
              </a>
            :"—"}
        </span>

        <b>{student.is_active?"Активен":"Отключён"}</b>

        <Link
          className="openStudentData"
          href={`/admin/student?id=${encodeURIComponent(student.student_id)}`}
        >
          Открыть данные
        </Link>
      </article>
    )
  }
</section>
   <section className="adminCards"><article><p>КАЛЕНДАРЬ</p><h3>Учебный год 2026–2027</h3><span>События уже подключены к кабинетам учеников. Редактирование календаря станет следующим шагом.</span></article><article><p>ШАБЛОНЫ</p><h3>Две версии планёрки</h3><span>5–7 уровни — 38 разворотов. 8–11 уровни — 45 разворотов.</span></article><article><p>ДАННЫЕ</p><h3>Тестовый режим</h3><span>Пока настройки сохраняются в браузере. Перед запуском потребуется общая база данных.</span></article></section>
  </section>
  <style jsx global>{`*{box-sizing:border-box}body{margin:0;font-family:Inter,Arial,sans-serif;background:#f7f5fa;color:#33263f}.adminPage{min-height:100vh;background:radial-gradient(circle at 8% 5%,#fff3ed 0,transparent 24%),radial-gradient(circle at 92% 6%,#eee6ff 0,transparent 26%),#f7f5fa}.adminPage header{height:78px;padding:0 34px;display:flex;align-items:center;justify-content:space-between;background:#ffffffdf;border-bottom:1px solid #e9e1ef}.brand{display:flex;align-items:center;gap:14px}.brand img{width:80px}.brand div{display:grid;gap:3px}.brand b{font-size:10px;letter-spacing:.15em;color:#ff5c3b}.brand span{font-weight:800;color:#5530a4}.identity{display:flex;align-items:center;gap:14px}.identity a{padding:9px 13px;border-radius:12px;background:#eee7f8;color:#5b2aac;text-decoration:none;font-weight:800}.adminWrap{max-width:1280px;margin:auto;padding:40px 28px 70px}.adminHero{display:flex;justify-content:space-between;gap:26px;align-items:center;padding:34px 38px;border:1px solid #e8e0ef;border-radius:30px;background:linear-gradient(135deg,#fff,#faf7ff 60%,#fff1ea);box-shadow:0 20px 56px #3b2a5510}.adminHero p,.adminCards p{margin:0 0 8px;font-size:11px;letter-spacing:.14em;font-weight:900;color:#7650ad}.adminHero h1{margin:0 0 12px;font-size:46px;letter-spacing:-.04em;color:#3b2255}.adminHero span,.adminCards span{color:#716778;line-height:1.5}.heroStats{display:grid;grid-template-columns:repeat(5,100px);gap:9px}.heroStats article{padding:16px 10px;border:1px solid #e9e1ef;border-radius:18px;background:#fff;text-align:center}.heroStats b{display:block;font-size:26px;color:#5e2abb}.heroStats small{color:#817688}.adminToolbar{display:grid;grid-template-columns:auto minmax(180px,1fr) auto;gap:12px;margin:22px 0}.filterStack{display:grid;gap:8px}.filters{display:flex;gap:7px;flex-wrap:wrap}.submissionFilters button{font-size:12px}.adminToolbar button,.adminToolbar input{border:1px solid #dfd5e8;border-radius:12px;padding:10px 13px;background:#fff}.adminToolbar button{font-weight:800;color:#5e2abb;cursor:pointer}.adminToolbar button.active,.adminToolbar .save{background:#5e2abb;color:#fff;border-color:#5e2abb}.adminToolbarActions{display:flex;gap:9px;align-items:center}.allPdfButton{display:inline-flex;align-items:center;justify-content:center;padding:10px 13px;border-radius:12px;background:#eee7f8;color:#5b2aac;text-decoration:none;font-weight:850;white-space:nowrap}.addStudentButton{background:#5e2abb!important;color:#fff!important;border-color:#5e2abb!important}.addStudentPanel{display:grid;grid-template-columns:260px 1fr;gap:24px;padding:22px 24px;margin:-8px 0 22px;border:1px solid #e4d8ec;border-radius:22px;background:#fff;box-shadow:0 14px 34px #3b2a550c}.addStudentPanel p{margin:0 0 6px;font-size:10px;letter-spacing:.14em;font-weight:900;color:#7650ad}.addStudentPanel h3{margin:0 0 7px;color:#432172}.addStudentPanel>div>span{font-size:13px;color:#7b7081;line-height:1.4}.addStudentFields{display:grid;grid-template-columns:1.1fr 1fr 1.1fr auto;gap:10px;align-items:end}.addStudentFields label{display:grid;gap:5px}.addStudentFields label>span{font-size:11px;font-weight:900;color:#674388}.addStudentFields input,.addStudentFields select{width:100%;border:1px solid #ddd3e6;border-radius:10px;padding:10px;background:#fff;color:#33263f}.addStudentFields button{border:0;border-radius:10px;padding:11px 14px;background:#5e2abb;color:#fff;font-weight:850;cursor:pointer;white-space:nowrap}.addStudentFields button:disabled{opacity:.55}.createError{grid-column:1/-1;padding:9px 11px;border-radius:10px;background:#fff0ed;color:#b94b38;font-size:13px;font-weight:700}.staffPanel{margin:0 0 22px;padding:22px 24px;border:1px solid #e4d8ec;border-radius:22px;background:#fff;box-shadow:0 14px 34px #3b2a550c}.staffPanelHead{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:18px}.staffPanelHead p{margin:0 0 6px;font-size:10px;letter-spacing:.14em;font-weight:900;color:#7650ad}.staffPanelHead h3{margin:0 0 7px;color:#432172}.staffPanelHead span{font-size:13px;color:#7b7081}.staffPanelHead>b{padding:8px 11px;border-radius:999px;background:#f2ecfa;color:#6b3bc4;font-size:12px}.staffCreate{display:grid;grid-template-columns:1.1fr .8fr 1.1fr auto;gap:10px;align-items:end;margin-bottom:16px}.staffCreate label{display:grid;gap:5px}.staffCreate label>span{font-size:11px;font-weight:900;color:#674388}.staffCreate input,.staffCreate select{width:100%;border:1px solid #ddd3e6;border-radius:10px;padding:10px;background:#fff;color:#33263f}.staffCreate button{border:0;border-radius:10px;padding:11px 14px;background:#5e2abb;color:#fff;font-weight:850;cursor:pointer;white-space:nowrap}.staffCreate button:disabled{opacity:.55}.staffList{overflow:hidden;border:1px solid #ebe4f0;border-radius:16px}.staffHead,.staffList article{display:grid;grid-template-columns:1.4fr .8fr .6fr .8fr;gap:14px;align-items:center;padding:13px 15px}.staffHead{background:#f7f2fb;color:#796d82;font-size:11px;font-weight:900;letter-spacing:.06em}.staffList article{border-top:1px solid #eee7f3}.staffList article>div{display:grid;gap:3px}.staffList article small{color:#8a8191}.staffList button{border:0;border-radius:10px;padding:9px 11px;font-weight:850;cursor:pointer}.activeStaff{background:#e8f6ed;color:#278447}.inactiveStaff{background:#f1edf4;color:#7b7081}.adminTable{overflow:hidden;border:1px solid #e8e0ef;border-radius:24px;background:#fff;box-shadow:0 18px 46px #3b2a550d}.tableHead,.adminTable article{display:grid;grid-template-columns:1.3fr .8fr .55fr 1fr .75fr .9fr .75fr .65fr .9fr;gap:16px;align-items:center;padding:16px 20px}.tableHead{background:#f7f2fb;color:#796d82;font-size:11px;font-weight:900;letter-spacing:.08em}.adminTable article{border-top:1px solid #eee7f3}.student{display:flex;align-items:center;gap:12px}.student>span{width:44px;height:44px;display:grid;place-items:center;border-radius:14px;background:#f0e8fa;color:#5e2abb;font-weight:900}.student div{display:grid;gap:3px}.student small{color:#877d8e}.adminTable select{width:100%;border:1px solid #ddd3e6;border-radius:10px;padding:9px;background:#fff}.plannerType{color:#56327f}.submissionStatus{font-size:12px}.submissionStatus.submitted{color:#278447}.submissionStatus.generating{color:#8a61b5}.submissionStatus.error{color:#c34b3d}.submissionStatus.none{color:#8a818f}.openPdf{display:inline-flex;justify-content:center;padding:8px 10px;border-radius:10px;background:#eee7f8;color:#5b2aac;text-decoration:none;font-weight:850;font-size:12px;white-space:nowrap}.openStudentData{display:inline-flex;justify-content:center;padding:9px 11px;border-radius:10px;background:#5e2abb;color:#fff;text-decoration:none;font-weight:850;font-size:12px}.toggle{display:flex;align-items:center;gap:8px}.toggle input{display:none}.toggle span{width:38px;height:22px;border-radius:999px;background:#d8d0df;position:relative}.toggle span:after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:.2s}.toggle input:checked+span{background:#58a96d}.toggle input:checked+span:after{left:19px}.toggle b{font-size:12px}.adminCards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:20px}.adminCards article{padding:20px;border:1px solid #e8e0ef;border-radius:20px;background:#fff}.adminCards h3{margin:0 0 8px;color:#432172}@media(max-width:900px){.addStudentPanel{grid-template-columns:1fr}.addStudentFields{grid-template-columns:1fr 1fr}.adminHero{align-items:flex-start;flex-direction:column}.adminToolbar{grid-template-columns:1fr}.tableHead{display:none}.adminTable article{grid-template-columns:1fr 1fr}.adminCards{grid-template-columns:1fr}.heroStats{width:100%;grid-template-columns:repeat(3,1fr)}}@media(max-width:560px){.addStudentFields{grid-template-columns:1fr}.adminPage header{padding:0 16px}.brand div,.identity strong{display:none}.adminWrap{padding:22px 14px 50px}.adminHero{padding:25px}.adminHero h1{font-size:34px}.adminTable article{grid-template-columns:1fr}.filters{flex-wrap:wrap}}`}</style>
 </main>;
}
