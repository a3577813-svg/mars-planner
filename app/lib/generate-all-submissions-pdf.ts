import fs from "fs";
import path from "path";
import {PDFDocument,rgb,StandardFonts} from "pdf-lib";
import {db} from "./db";

function formatDate(value:string|Date){
  const d=value instanceof Date?value:new Date(value);
  return new Intl.DateTimeFormat("ru-RU",{
    dateStyle:"short",
    timeStyle:"short",
    timeZone:"Europe/Moscow"
  }).format(d);
}

export async function generateAllSubmissionsPdf(){
  const result=await db.query(
    `SELECT student_id,planner_type,submitted_at,pdf_path
     FROM planner_submissions
     WHERE status='submitted'
       AND pdf_path IS NOT NULL
     ORDER BY submitted_at ASC`
  );

  const submissions=result.rows.filter(row=>{
    const filePath=String(row.pdf_path||"");
    return filePath&&fs.existsSync(filePath);
  });

  const merged=await PDFDocument.create();
  const font=await merged.embedFont(StandardFonts.Helvetica);
  const bold=await merged.embedFont(StandardFonts.HelveticaBold);

  for(const submission of submissions){
    const cover=merged.addPage([595.28,841.89]);

    cover.drawText("MARS PLANNER",{
      x:60,
      y:750,
      size:18,
      font:bold,
      color:rgb(0.35,0.16,0.66)
    });

    cover.drawText(`ID: ${submission.student_id}`,{
      x:60,
      y:650,
      size:24,
      font:bold
    });

    cover.drawText(
      `Planner: ${submission.planner_type==="middle"?"5-7":"8-11"}`,
      {
        x:60,
        y:605,
        size:18,
        font
      }
    );

    cover.drawText(
      `Submitted: ${formatDate(submission.submitted_at)}`,
      {
        x:60,
        y:565,
        size:18,
        font
      }
    );

    const bytes=fs.readFileSync(String(submission.pdf_path));
    const studentPdf=await PDFDocument.load(bytes);
    const copied=await merged.copyPages(
      studentPdf,
      studentPdf.getPageIndices()
    );

    copied.forEach(page=>merged.addPage(page));
  }

  const outDir="/opt/mars-planner/storage/submissions";
  fs.mkdirSync(outDir,{recursive:true});

  const outPath=path.join(outDir,"all-submissions.pdf");
  const bytes=await merged.save();
  fs.writeFileSync(outPath,bytes);

  return {
    outPath,
    count:submissions.length
  };
}
