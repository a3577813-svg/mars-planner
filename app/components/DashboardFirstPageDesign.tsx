"use client";

import {useEffect} from "react";

export default function DashboardFirstPageDesign(){
  useEffect(()=>{
    const apply=()=>{
      const isSenior=location.pathname==="/senior";
      const isJunior=location.pathname==="/student";
      if(!isSenior&&!isJunior)return false;
      const root=document.querySelector<HTMLElement>(isSenior?"main.senior":"main.studentCabinet");
      if(!root)return false;
      const hero=root.querySelector<HTMLElement>(".hero");
      if(!hero)return false;

      root.classList.add("marsDashboardV2");
      const eyebrow=hero.querySelector<HTMLElement>(":scope>div:first-child>p,.eyebrow");
      if(eyebrow)eyebrow.textContent="ЖИВАЯ ПЛАНЁРКА МАРС";
      const description=hero.querySelector<HTMLElement>(isSenior?":scope>div:first-child>span":":scope>div:first-child>p:not(.eyebrow)");
      if(description)description.textContent="Здесь сохраняются твои идеи, решения, фотографии, рисунки и открытия на каждом этапе маршрута.";

      const progress=hero.querySelector<HTMLElement>(".progress");
      if(progress&&!progress.querySelector(".marsHeroProgressLabel")){
        const label=document.createElement("span");
        label.className="marsHeroProgressLabel";
        label.textContent="ТВОЯ ТЕКУЩАЯ ТОЧКА";
        progress.prepend(label);
      }

      const routeTitle=root.querySelector<HTMLElement>(isSenior?".sectionTitle h2":".cardTitle h2");
      if(routeTitle)routeTitle.textContent="Мои развороты";
      return true;
    };

    if(apply())return;
    let attempts=0;
    const timer=window.setInterval(()=>{
      attempts++;
      if(apply()||attempts>20)window.clearInterval(timer);
    },100);
    return()=>window.clearInterval(timer);
  },[]);

  return <style jsx global>{`
    .marsDashboardV2{background:radial-gradient(circle at 9% 5%,#fff4ee 0,transparent 24%),radial-gradient(circle at 92% 8%,#f0e9ff 0,transparent 26%),#f7f5fa!important}
    .marsDashboardV2 header{backdrop-filter:blur(14px);background:#ffffffdc!important}
    .marsDashboardV2 .hero{position:relative;overflow:hidden;background:linear-gradient(135deg,#ffffff 0%,#faf7ff 58%,#fff2eb 100%)!important;color:#342544!important;border:1px solid #e7deef!important;box-shadow:0 22px 60px #3b2a5514!important}
    .marsDashboardV2 .hero:after{content:"";position:absolute;right:-65px;top:-95px;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,#7a45ca24 0,#7a45ca08 45%,transparent 70%);pointer-events:none}
    .marsDashboardV2 .hero>div:first-child{position:relative;z-index:1}
    .marsDashboardV2 .hero .eyebrow,.marsDashboardV2 .hero>div:first-child>p:first-child{color:#7650ad!important}
    .marsDashboardV2 .hero h1{max-width:820px;color:#38204f!important;font-size:clamp(38px,5vw,64px)!important;letter-spacing:-.045em!important}
    .marsDashboardV2 .hero>div:first-child>p:not(.eyebrow),.marsDashboardV2 .hero>div:first-child>span{max-width:720px!important;color:#6f6578!important;font-size:16px!important}
    .marsDashboardV2 .primary{background:#5e2abb!important;box-shadow:0 10px 24px #5e2abb28!important;transition:transform .18s ease,box-shadow .18s ease!important}
    .marsDashboardV2 .primary:hover{transform:translateY(-2px);box-shadow:0 14px 30px #5e2abb35!important}
    .marsDashboardV2 .progress{position:relative;z-index:1;padding:20px;border:1px solid #e9e1ef;border-radius:24px;background:#ffffffc7;box-shadow:0 14px 34px #3b2a550d}
    .marsDashboardV2 .marsHeroProgressLabel{display:block;margin-bottom:10px;font-size:10px;font-weight:900;letter-spacing:.14em;color:#7650ad}
    .marsDashboardV2 .ring{width:142px!important;height:142px!important;box-shadow:inset 0 0 0 14px #efe8f7!important;background:conic-gradient(#ff6547 22%,#efe8f7 0)!important}
    .marsDashboardV2 .ring strong{color:#432172!important}
    .marsDashboardV2 .ring span{color:#756b7e!important}
    .marsDashboardV2 .progress>b{color:#432172!important}
    .marsDashboardV2 .progress small{color:#7c7285!important}
    .marsDashboardV2 .routeCard,.marsDashboardV2 .panel{border-color:#e8e0ef!important;box-shadow:0 16px 42px #3b2a550e!important}
    .marsDashboardV2 .routeCard{background:#ffffffea!important}
    .marsDashboardV2 .cardTitle h2,.marsDashboardV2 .sectionTitle h2{font-size:31px!important;letter-spacing:-.025em}
    .marsDashboardV2 aside{gap:14px!important}
    @media(max-width:900px){.marsDashboardV2 .hero{grid-template-columns:1fr!important}.marsDashboardV2 .progress{margin-top:24px;max-width:280px}}
    @media(max-width:650px){.marsDashboardV2 .hero h1{font-size:38px!important}.marsDashboardV2 .hero{padding:26px!important}.marsDashboardV2 .progress{max-width:none}}
  `}</style>;
}
