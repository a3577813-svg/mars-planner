import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import {db} from "../../../lib/db";
import {getCurrentStudent} from "../../../lib/session";
import {generatePlannerPdf} from "../../../lib/generate-planner-pdf";
import {generateAllSubmissionsPdf} from "../../../lib/generate-all-submissions-pdf";

export const runtime="nodejs";

export async function POST(){
  try{
    const student=await getCurrentStudent();

    if(!student){
      return NextResponse.json(
        {ok:false,error:"Необходима авторизация"},
        {status:401}
      );
    }

    const sessionToken=cookies().get("mars_session")?.value;

    if(!sessionToken){
      return NextResponse.json(
        {ok:false,error:"Сессия ученика не найдена"},
        {status:401}
      );
    }

    const initial=await db.query(
      `INSERT INTO planner_submissions
       (student_id,planner_type,status,submitted_at,updated_at,pdf_path)
       VALUES ($1,$2,'generating',NOW(),NOW(),NULL)
       ON CONFLICT (student_id,planner_type)
       DO UPDATE SET
         status='generating',
         updated_at=NOW(),
         pdf_path=NULL
       RETURNING status,submitted_at,pdf_path`,
      [student.student_id,student.planner_type]
    );

    const studentId=student.student_id;
    const plannerType=student.planner_type;

    void generatePlannerPdf({
      studentId,
      plannerType,
      sessionToken
    })
      .then(async pdf=>{
        await db.query(
          `UPDATE planner_submissions
           SET status='submitted',
               submitted_at=NOW(),
               updated_at=NOW(),
               pdf_path=$1
           WHERE student_id=$2
             AND planner_type=$3`,
          [pdf.finalPath,studentId,plannerType]
        );

        console.log(
          "Planner PDF ready:",
          studentId,
          plannerType,
          pdf.finalPath
        );

        try{
          const allPdf=await generateAllSubmissionsPdf();

          console.log(
            "All submissions PDF rebuilt:",
            allPdf.count,
            allPdf.outPath
          );
        }catch(allPdfError){
          console.error(
            "All submissions PDF rebuild error:",
            allPdfError
          );
        }
      })
      .catch(async error=>{
        console.error(
          "Planner async PDF error:",
          studentId,
          plannerType,
          error
        );

        try{
          await db.query(
            `UPDATE planner_submissions
             SET status='error',
                 updated_at=NOW(),
                 pdf_path=NULL
             WHERE student_id=$1
               AND planner_type=$2`,
            [studentId,plannerType]
          );
        }catch(dbError){
          console.error("Planner PDF error status update failed:",dbError);
        }
      });

    return NextResponse.json(
      {
        ok:true,
        studentId,
        plannerType,
        submission:initial.rows[0]
      },
      {status:202}
    );
  }catch(error){
    console.error("Planner submit POST error:",error);

    return NextResponse.json(
      {ok:false,error:"Не удалось запустить формирование PDF"},
      {status:500}
    );
  }
}

export async function GET(){
  try{
    const student=await getCurrentStudent();

    if(!student){
      return NextResponse.json(
        {ok:false,error:"Необходима авторизация"},
        {status:401}
      );
    }

    const result=await db.query(
      `SELECT status,submitted_at,pdf_path
       FROM planner_submissions
       WHERE student_id=$1
         AND planner_type=$2
       LIMIT 1`,
      [student.student_id,student.planner_type]
    );

    return NextResponse.json({
      ok:true,
      submission:result.rows[0]||null
    });
  }catch(error){
    console.error("Planner submit GET error:",error);

    return NextResponse.json(
      {ok:false,error:"Ошибка сервера"},
      {status:500}
    );
  }
}
