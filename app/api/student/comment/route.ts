import {NextResponse} from "next/server";
import {db} from "../../../lib/db";
import {getCurrentStudent} from "../../../lib/session";

export async function GET(){
try{
const student=await getCurrentStudent();

if(!student){
  return NextResponse.json(
    {ok:false,error:"Не авторизован"},
    {status:401}
  );
}

const result=await db.query(
  "SELECT comment FROM tutor_comments WHERE student_id=$1 ORDER BY updated_at DESC LIMIT 1",
  [student.student_id]
);

return NextResponse.json({
  ok:true,
  comment:result.rows[0]?.comment||""
});

}catch(error){
console.error("Student comment load error:",error);
return NextResponse.json(
{ok:false,error:"Ошибка сервера"},
{status:500}
);
}
}
