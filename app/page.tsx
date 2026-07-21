"use client";

import { FormEvent, useEffect, useState } from "react";

type Role = "student" | "teacher";

type PlannerData = {
  mood: number;
  liked: string;
  difficult: string;
  checked: boolean;
  teacherComment: string;
};

const emptyData: PlannerData = {
  mood: 7,
  liked: "",
  difficult: "",
  checked: false,
  teacherComment: ""
};

export default function Home() {
  const [role, setRole] = useState<Role | null>(null);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [data, setData] = useState<PlannerData>(emptyData);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("mars-planner-page-5");
    if (stored) setData(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (!role) return;
    const timer = window.setTimeout(() => {
      localStorage.setItem("mars-planner-page-5", JSON.stringify(data));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1200);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [data, role]);

  function enter(event: FormEvent) {
    event.preventDefault();
    if (login === "student" && password === "1234") setRole("student");
    else if (login === "teacher" && password === "1234") setRole("teacher");
    else setError("Проверьте логин и пароль");
  }

  if (!role) {
    return (
      <main className="loginScreen">
        <section className="loginCard">
          <div className="logo">МАРС</div>
          <p className="eyebrow">ЦИФРОВАЯ ОБРАЗОВАТЕЛЬНАЯ СРЕДА</p>
          <h1>Живая планёрка</h1>
          <p className="lead">Первый рабочий прототип цифровой планёрки ученика.</p>
          <form onSubmit={enter}>
            <label>Логин<input value={login} onChange={(e) => setLogin(e.target.value)} placeholder="student или teacher" /></label>
            <label>Пароль<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="1234" /></label>
            {error && <p className="error">{error}</p>}
            <button type="submit">Войти</button>
          </form>
          <div className="demo">Ученик: student / 1234<br />Педагог: teacher / 1234</div>
        </section>
      </main>
    );
  }

  const readOnly = role === "teacher";

  return (
    <main className="appShell">
      <header>
        <div><strong>МАРС</strong><span>Живая планёрка</span></div>
        <nav><span>{role === "student" ? "Ученик" : "Педагог"}</span><button onClick={() => setRole(null)}>Выйти</button></nav>
      </header>

      <div className="workspace">
        <aside>
          <p className="eyebrow">СОДЕРЖАНИЕ</p>
          <h2>Моя планёрка</h2>
          {[1, 2, 3, 4, 5, 6].map((page) => (
            <button className={page === 5 ? "active" : ""} key={page} disabled={page !== 5}>
              <span>{page}</span>{page === 5 ? "Рефлексия экспедиции" : "Страница планёрки"}
            </button>
          ))}
        </aside>

        <section className="plannerPage">
          <div className="pageTop">
            <div><p className="eyebrow">СТРАНИЦА 5</p><h1>Рефлексия экспедиции</h1></div>
            <span className={saved ? "save saved" : "save"}>{saved ? "Сохранено" : "Автосохранение"}</span>
          </div>

          <div className="paper">
            <p className="date">Экспедиция «Никола-Ленивец»</p>
            <h2>Как я чувствовал(а) себя во время экспедиции?</h2>
            <div className="scaleLabels"><span>сложно</span><strong>{data.mood}/10</strong><span>отлично</span></div>
            <input aria-label="Самочувствие" type="range" min="1" max="10" value={data.mood} disabled={readOnly} onChange={(e) => setData({ ...data, mood: Number(e.target.value) })} />

            <label className="question">Что мне особенно понравилось?</label>
            <textarea value={data.liked} readOnly={readOnly} onChange={(e) => setData({ ...data, liked: e.target.value })} placeholder="Напиши несколько предложений…" />

            <label className="question">Что было трудным или неожиданным?</label>
            <textarea value={data.difficult} readOnly={readOnly} onChange={(e) => setData({ ...data, difficult: e.target.value })} placeholder="Зафиксируй свои наблюдения…" />

            <label className="checkRow">
              <input type="checkbox" checked={data.checked} disabled={readOnly} onChange={(e) => setData({ ...data, checked: e.target.checked })} />
              Я обсудил(а) впечатления с командой
            </label>
          </div>

          <section className="commentBox">
            <p className="eyebrow">КОММЕНТАРИЙ ПЕДАГОГА</p>
            {role === "teacher" ? (
              <textarea value={data.teacherComment} onChange={(e) => setData({ ...data, teacherComment: e.target.value })} placeholder="Оставьте поддерживающий комментарий ученику…" />
            ) : (
              <p>{data.teacherComment || "Педагог пока не оставил комментарий."}</p>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
