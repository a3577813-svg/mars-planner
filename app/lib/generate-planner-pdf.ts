import fs from "fs";
import path from "path";
import {execFile} from "child_process";
import {promisify} from "util";
import puppeteer from "puppeteer-core";
import {PDFDocument} from "pdf-lib";
import {db} from "./db";

const execFileAsync=promisify(execFile);

type PlannerType="middle"|"senior";

function pageUrl(plannerType:PlannerType,page:number){
  if(plannerType==="senior"){
    if(page<=28){
      if(page<=12)return `/book?page=${page}&mode=student&senior=1&pdf=1`;
      if(page<=15)return `/book-next?page=${page}&mode=student&senior=1&pdf=1`;
      if(page<=18)return `/book-next2?page=${page}&mode=student&senior=1&pdf=1`;
      if(page<=21)return `/book-next3?page=${page}&mode=student&senior=1&pdf=1`;
      if(page<=24)return `/book-next4?page=${page}&mode=student&senior=1&pdf=1`;
      if(page<=27)return `/book-next5?page=${page}&mode=student&senior=1&pdf=1`;
      return `/book-next6?page=${page}&mode=student&senior=1&pdf=1`;
    }

    if(page<=31)return `/senior/unique?page=${page}&pdf=1`;
    if(page<=34)return `/senior/unique2?page=${page}&pdf=1`;
    if(page<=37)return `/senior/unique3?page=${page}&pdf=1`;
    if(page<=40)return `/senior/unique4?page=${page}&pdf=1`;
    if(page<=43)return `/senior/unique5?page=${page}&pdf=1`;

    if(page===44)return `/book-next9?page=37&mode=student&senior=1&pdf=1`;
    if(page===45)return `/book-next9?page=38&mode=student&senior=1&pdf=1`;
  }

  if(page<=12)return `/book?page=${page}&mode=student&pdf=1`;
  if(page<=15)return `/book-next?page=${page}&mode=student&pdf=1`;
  if(page<=18)return `/book-next2?page=${page}&mode=student&pdf=1`;
  if(page<=21)return `/book-next3?page=${page}&mode=student&pdf=1`;
  if(page<=24)return `/book-next4?page=${page}&mode=student&pdf=1`;
  if(page<=27)return `/book-next5?page=${page}&mode=student&pdf=1`;
  if(page<=30)return `/book-next6?page=${page}&mode=student&pdf=1`;
  if(page<=33)return `/book-next7?page=${page}&mode=student&pdf=1`;
  if(page<=36)return `/book-next8?page=${page}&mode=student&pdf=1`;
  return `/book-next9?page=${page}&mode=student&pdf=1`;
}

export async function generatePlannerPdf({
  studentId,
  plannerType,
  password,
  sessionToken
}:{
  studentId:string;
  plannerType:PlannerType;
  password?:string;
  sessionToken?:string;
}){
  const accessResult=await db.query(
    `SELECT allowed_pages
     FROM student_planner_access
     WHERE student_id=$1
     LIMIT 1`,
    [studentId]
  );

  const maxPage=plannerType==="senior"?45:38;

  const allowedPages:number[]=accessResult.rows[0]?.allowed_pages
    ??Array.from({length:maxPage},(_,i)=>i+1);

  const outDir="/opt/mars-planner/storage/submissions";
  fs.mkdirSync(outDir,{recursive:true});

  const finalName=`${studentId}-${plannerType}-final.pdf`;
  const finalPath=path.join(outDir,finalName);

  const tempDir=path.join(outDir,`${studentId}-${plannerType}-parts`);
  fs.rmSync(tempDir,{recursive:true,force:true});
  fs.mkdirSync(tempDir,{recursive:true});

  const browser=await puppeteer.launch({
    executablePath:"/usr/bin/chromium-browser",
    headless:true,
    args:[
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage"
    ]
  });

  try{
    const page=await browser.newPage();

    const pdfAccessSecret=fs.readFileSync(
      "/root/mars_pdf_access_secret",
      "utf8"
    ).trim();

    await page.setExtraHTTPHeaders({
      "x-mars-pdf-access":pdfAccessSecret
    });

    await page.setViewport({
      width:1440,
      height:1000,
      deviceScaleFactor:1
    });

    await page.goto(
      "https://planner.nastianet.ru",
      {waitUntil:"networkidle0"}
    );

    if(sessionToken){
      await page.setCookie({
        name:"mars_session",
        value:sessionToken,
        domain:"planner.nastianet.ru",
        path:"/",
        httpOnly:true,
        secure:true,
        sameSite:"Lax"
      });
    }else{
      if(!password){
        throw new Error("Для генерации PDF нужен password или sessionToken");
      }

      const loginResult=await page.evaluate(async({studentId,password})=>{
        const response=await fetch("/api/auth/login",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          credentials:"include",
          body:JSON.stringify({studentId,password})
        });

        return {
          ok:response.ok,
          text:await response.text()
        };
      },{studentId,password});

      if(!loginResult.ok){
        throw new Error(`PDF login failed: ${loginResult.text}`);
      }
    }

    await page.evaluate(({studentId,plannerType})=>{
      localStorage.setItem(
        "mars-active-account",
        plannerType==="senior"?"student8":"student7"
      );
      localStorage.setItem("mars-student-id",studentId);
    },{studentId,plannerType});

    for(const n of allowedPages){
      const url=`https://planner.nastianet.ru${pageUrl(plannerType,n)}`;

      await page.goto(url,{waitUntil:"networkidle0"});
      await page.emulateMediaType("print");

      const current=page.url();

      if(!current.includes(new URL(url).pathname)){
        throw new Error(`Не удалось открыть разворот ${n}: ${current}`);
      }

      const partPath=path.join(
        tempDir,
        `${String(n).padStart(2,"0")}.pdf`
      );

      await page.pdf({
        path:partPath,
        format:"A4",landscape:true,
        printBackground:true,
        margin:{
          top:"8mm",
          right:"8mm",
          bottom:"8mm",
          left:"8mm"
        }
      });
    }
  }finally{
    await browser.close();
  }

  const merged=await PDFDocument.create();

  for(const n of allowedPages){
    const partPath=path.join(
      tempDir,
      `${String(n).padStart(2,"0")}.pdf`
    );

    const bytes=fs.readFileSync(partPath);
    const part=await PDFDocument.load(bytes);
    const copied=await merged.copyPages(
      part,
      part.getPageIndices()
    );

    copied.forEach(page=>merged.addPage(page));
  }

  const mergedBytes=await merged.save();

  const uncompressedPath=path.join(
    outDir,
    `${studentId}-${plannerType}-uncompressed.pdf`
  );

  fs.writeFileSync(uncompressedPath,mergedBytes);

  await execFileAsync("gs",[
    "-sDEVICE=pdfwrite",
    "-dCompatibilityLevel=1.7",
    "-dPDFSETTINGS=/ebook",
    "-dNOPAUSE",
    "-dQUIET",
    "-dBATCH",
    `-sOutputFile=${finalPath}`,
    uncompressedPath
  ]);

  fs.rmSync(uncompressedPath,{force:true});

  return {
    finalPath,
    finalName,
    tempDir,
    allowedPages
  };
}
