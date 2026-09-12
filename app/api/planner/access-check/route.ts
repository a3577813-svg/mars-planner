import fs from "fs";
import {NextRequest,NextResponse} from "next/server";
import {db} from "../../../lib/db";
import {getCurrentStudent} from "../../../lib/session";
import {getCurrentStaff} from "../../../lib/staff-session";
import {getCurrentAdmin} from "../../../lib/admin-session";

type Audience="middle"|"senior";

function validAudience(value:string):value is Audience{
  return value==="middle"||value==="senior";
}

function validPage(page:number,audience:Audience){
  const max=audience==="senior"?45:38;
  return Number.isInteger(page)&&page>=1&&page<=max;
}

function validPdfSecret(request:NextRequest){
  try{
    const expected=fs.readFileSync("/root/mars_pdf_access_secret","utf8").trim();
    const received=request.headers.get("x-mars-pdf-access")||"";
    return Boolean(expected)&&received===expected;
  }catch(error){
    console.error("PDF access secret read failed",error);
    return false;
  }
}

export async function GET(request:NextRequest){
  try{
    const {searchParams}=new URL(request.url);
    const audienceRaw=searchParams.get("audience")||"";
    const page=Number(searchParams.get("page")||"0");
    const mode=searchParams.get("mode")||"student";

    if(!validAudience(audienceRaw)||!validPage(page,audienceRaw)){
      return NextResponse.json({ok:false,error:"invalid_request"},{status:400});
    }

    const audience=audienceRaw;

    if(mode==="admin-edit"){
      const admin=await getCurrentAdmin();
      if(!admin){
        return NextResponse.json({ok:false,error:"unauthorized"},{status:401});
      }
      return NextResponse.json({ok:true,allowed:true,role:"admin"});
    }

    if(mode==="teacher"){
      const staff=await getCurrentStaff();
      if(!staff||staff.role!=="teacher"){
        return NextResponse.json({ok:false,error:"unauthorized"},{status:401});
      }
      return NextResponse.json({ok:true,allowed:true,role:"teacher"});
    }

    if(mode==="methodist"){
      const staff=await getCurrentStaff();
      if(!staff||staff.role!=="methodist"){
        return NextResponse.json({ok:false,error:"unauthorized"},{status:401});
      }
      return NextResponse.json({ok:true,allowed:true,role:"methodist"});
    }

    const student=await getCurrentStudent();

    if(!student){
      return NextResponse.json({ok:false,error:"unauthorized"},{status:401});
    }

    if(student.planner_type!==audience){
      return NextResponse.json({
        ok:true,
        allowed:false,
        reason:"wrong_planner_type",
        home:student.planner_type==="senior"?"/senior":"/student"
      },{status:403});
    }

    const accessResult=await db.query(
      `SELECT allowed_pages
       FROM student_planner_access
       WHERE student_id=$1
       LIMIT 1`,
      [student.student_id]
    );

    const maxPage=audience==="senior"?45:38;
    const allowedPages:number[]=accessResult.rows[0]?.allowed_pages
      ??Array.from({length:maxPage},(_,i)=>i+1);

    if(!allowedPages.map(Number).includes(page)){
      return NextResponse.json({
        ok:true,
        allowed:false,
        reason:"page_not_allowed",
        home:audience==="senior"?"/senior":"/student"
      },{status:403});
    }

    const pdfAccess=validPdfSecret(request);

    if(!pdfAccess){
      const assignmentResult=await db.query(
        `SELECT visible
         FROM spread_assignments
         WHERE audience=$1
           AND page_number=$2
         LIMIT 1`,
        [audience,page]
      );

      if(assignmentResult.rows[0]?.visible===false){
        return NextResponse.json({
          ok:true,
          allowed:false,
          reason:"hidden",
          home:audience==="senior"?"/senior":"/student"
        },{status:403});
      }
    }

    return NextResponse.json({
      ok:true,
      allowed:true,
      role:"student",
      pdfAccess
    });
  }catch(error){
    console.error("Planner access-check GET failed",error);
    return NextResponse.json({ok:false,error:"server_error"},{status:500});
  }
}
