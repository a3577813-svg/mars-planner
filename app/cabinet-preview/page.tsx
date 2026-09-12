"use client";

import CabinetShell from "../components/cabinet/CabinetShell";

export default function CabinetPreview(){
  return <CabinetShell
    roleLabel="Кабинет ученика"
    title="Мой маршрут"
    activeHref="/cabinet-preview"
    nav={[
      {href:"/cabinet-preview",label:"Обзор",icon:"⌂"},
      {href:"#route",label:"Мой маршрут",icon:"↗"},
      {href:"#planner",label:"Планёрка",icon:"▤"},
      {href:"#feedback",label:"Обратная связь",icon:"◌"},
    ]}
    action={<button className="cabinetSecondary">Выйти</button>}
  >
    <div className="cabinetGrid" style={{gridTemplateColumns:"1.45fr .75fr"}}>
      <section className="cabinetCard pad" style={{minHeight:270}}>
        <p className="cabinetEyebrow">Мой проектный маршрут</p>
        <h2 style={{fontSize:38,lineHeight:1.05,marginBottom:12}}>Продолжаем путь?</h2>
        <p style={{maxWidth:620,marginBottom:26}}>Здесь собраны твои текущие задачи, прогресс и следующий шаг. Не нужно искать, где остановился — маршрут ведёт тебя дальше.</p>
        <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
          <button className="cabinetPrimary">Продолжить маршрут →</button>
          <span style={{fontSize:12,color:"#806b92",fontWeight:800}}>Разворот 14 · в работе</span>
        </div>
      </section>
      <section className="cabinetCard pad" style={{display:"grid",placeItems:"center",textAlign:"center"}}>
        <div style={{width:128,height:128,borderRadius:"50%",display:"grid",placeItems:"center",background:"#f1eafa",border:"10px solid #e1d3f0"}}>
          <div><strong style={{display:"block",fontSize:34,color:"#5c2a9f"}}>58%</strong><span style={{fontSize:11,color:"#806b92",fontWeight:800}}>готово</span></div>
        </div>
      </section>
    </div>

    <div id="route" className="cabinetGrid cols2" style={{marginTop:18}}>
      <section className="cabinetCard pad">
        <p className="cabinetEyebrow">Сейчас</p>
        <h3 style={{fontSize:22,marginBottom:8}}>Разворот 14</h3>
        <p style={{marginTop:0}}>Проект в работе</p>
        <div style={{height:10,borderRadius:99,background:"#eee8f2",overflow:"hidden",margin:"18px 0 12px"}}><div style={{width:"58%",height:"100%",borderRadius:99,background:"#5c2a9f"}}/></div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#806b92",fontWeight:800}}><span>8 завершено</span><span>14 из 38</span></div>
      </section>
      <section id="feedback" className="cabinetCard pad">
        <p className="cabinetEyebrow">Обратная связь</p>
        <h3 style={{fontSize:22,marginBottom:8}}>Комментарий тьютора</h3>
        <p style={{marginBottom:0}}>Посмотри на следующий шаг и попробуй самостоятельно сформулировать, что изменилось в проекте после последнего обсуждения.</p>
      </section>
    </div>

    <section id="planner" className="cabinetCard pad" style={{marginTop:18}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:20,alignItems:"flex-start",flexWrap:"wrap"}}>
        <div><p className="cabinetEyebrow">Моя планёрка</p><h3 style={{fontSize:22}}>Маршрут из 38 разворотов</h3></div>
        <button className="cabinetPrimary">Открыть планёрку →</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(10,1fr)",gap:8,marginTop:22}}>{Array.from({length:20},(_,i)=><div key={i} style={{height:34,borderRadius:9,display:"grid",placeItems:"center",fontSize:11,fontWeight:900,background:i<8?"#e7ddf2":i===13?"#5c2a9f":"#f4f0f6",color:i===13?"#fff":"#665676"}}>{i+1}</div>)}</div>
    </section>
  </CabinetShell>
}
