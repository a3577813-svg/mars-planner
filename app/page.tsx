"use client";

import { ChangeEvent, FormEvent, PointerEvent, useEffect, useRef, useState } from "react";

type Role = "student" | "teacher";

type PlannerData = {
  mood: number;
  liked: string;
  difficult: string;
  checked: boolean;
  teacherComment: string;
  photo: string;
  drawing: string;
};

const emptyData: PlannerData = {
  mood: 7,
  liked: "",
  difficult: "",
  checked: false,
  teacherComment: "",
  photo: "",
  drawing: ""
};

const pages = Array.from({ length: 38 }, (_, index) => index + 1);

export default function Home() {
  const [role, setRole] = useState<Role | null>(null);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [data, setData] = useState<PlannerData>(emptyData);
  const [saved, setSaved] = useState(false);
  const [activePage, setActivePage] = useState(5);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem("mars-planner-page-5");
    if (stored) setData({ ...emptyData, ...JSON.parse(stored) });
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.lineWidth = 3;
    context.lineCap = "round";
    context.strokeStyle = "#173c31";
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (data.drawing) {
      const image = new Image();
      image.onload = () => context.drawImage(image, 0, 0, canvas.width, canvas.height);
      image.src = data.drawing;
    }
  }, [data.drawing, activePage]);

  function enter(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (login === "student" && password === "1234") setRole("student");
    else if (login === "teacher" && password === "1234") setRole("teacher");
    else setError("Проверьте логин и пароль");
  }

  function uploadPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 4_000_000) {
      setError("Фотография слишком большая. Выберите файл до 4 МБ.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setData((current) => ({ ...current, photo: String(reader.result) }));
    reader.readAsDataURL(file);
  }

  function canvasPoint(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function startDrawing(event: PointerEvent<HTMLCanvasElement>) {
    if (role === "teacher") return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    drawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    const point = canvasPoint(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
  }

  function draw(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current || role === "teacher") return;
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;
    const point = canvasPoint(event);
    context.lineTo(point.x, point.y);
    context.stroke();
  }

  function stopDrawing() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const drawing = canvasRef.current?.toDataURL("image/png") || "";
    setData((current) => ({ ...current, drawing }));
  }

  function clearDrawing() {
    const context = canvasRef.current?.getContext("2d");
    const canvas = canvasRef.current;
    if (context && canvas) context.clearRect(0, 0, canvas.width, canvas.height);
    setData((current) => ({ ...current, drawing: "" }));
  }

  if (!role) {
    return (
      <main className="loginScreen">
        <section className="loginCard">
          <div className="logo">МАРС</div>
          <p className="eyebrow">ЦИФРОВАЯ ОБРАЗОВАТЕЛЬНАЯ СРЕДА</p>
          <h1>Живая планёрка</h1>
          <p className="lead">Рабочий прототип цифровой планёрки ученика.</p>
          <form onSubmit={enter}>
            <label>Логин<input value={login} onChange={(e) => setLogin(e.target.value)} placeholder="student или teacher" autoCapitalize="none" /></label>
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
          <div className="pageList">
            {pages.map((page) => (
              <button className={page === activePage ? "active" : ""} key={page} onClick={() => setActivePage(page)}>
                <span>{page}</span>{page === 5 ? "Рефлексия экспедиции" : "Страница планёрки"}
              </button>
            ))}
          </div>
        </aside>

        <section className="plannerPage">
          <div className="mobilePagePicker">
            <label>Страница
              <select value={activePage} onChange={(e) => setActivePage(Number(e.target.value))}>
                {pages.map((page) => <option key={page} value={page}>{page}</option>)}
              </select>
            </label>
          </div>

          {activePage !== 5 ? (
            <section className="emptyPage">
              <p className="eyebrow">СТРАНИЦА {activePage}</p>
              <h1>Страница готовится</h1>
              <p>Каркас всех 38 страниц уже добавлен. Сейчас полностью работает страница 5 — на ней мы проверяем все основные функции редактора.</p>
              <button onClick={() => setActivePage(5)}>Открыть рабочую страницу 5</button>
            </section>
          ) : (
            <>
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

                <div className="mediaGrid">
                  <section className="mediaCard">
                    <div className="mediaTitle"><strong>Фотография</strong>{data.photo && !readOnly && <button onClick={() => setData({ ...data, photo: "" })}>Удалить</button>}</div>
                    {data.photo ? <img src={data.photo} alt="Фотография ученика" /> : <div className="photoPlaceholder">Здесь появится фотография</div>}
                    {!readOnly && <label className="uploadButton">Добавить фото<input type="file" accept="image/*" onChange={uploadPhoto} /></label>}
                  </section>

                  <section className="mediaCard">
                    <div className="mediaTitle"><strong>Рисунок или схема</strong>{!readOnly && <button onClick={clearDrawing}>Очистить</button>}</div>
                    <canvas ref={canvasRef} width={900} height={520} onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={stopDrawing} onPointerCancel={stopDrawing} />
                    <small>{readOnly ? "Рисунок ученика" : "Рисуй пальцем, стилусом или мышью"}</small>
                  </section>
                </div>
              </div>

              <section className="commentBox">
                <p className="eyebrow">КОММЕНТАРИЙ ПЕДАГОГА</p>
                {role === "teacher" ? (
                  <textarea value={data.teacherComment} onChange={(e) => setData({ ...data, teacherComment: e.target.value })} placeholder="Оставьте поддерживающий комментарий ученику…" />
                ) : (
                  <p>{data.teacherComment || "Педагог пока не оставил комментарий."}</p>
                )}
              </section>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
