import {NextResponse} from "next/server";
import {getCurrentStaff} from "../../../lib/staff-session";

export async function GET(){
try{
const staff=await getCurrentStaff();
 if(!staff){return NextResponse.json({ok:false,error:"Не авторизован"},{status:401});}
 return NextResponse.json({ok:true,staff:{id:staff.id,login:staff.login,role:staff.role}});

}catch(error){
console.error("Staff me error:",error);
return NextResponse.json(
{ok:false,error:"Ошибка сервера"},
{status:500}
);
}
}
