import {NextResponse} from "next/server";
import {getCurrentStaff} from "../../../lib/staff-session";

export async function GET(){
  try{
    const staff=await getCurrentStaff();

    if(!staff){
      return NextResponse.json(
        {ok:false,error:"unauthorized"},
        {status:401}
      );
    }

    return NextResponse.json({
      ok:true,
      id:staff.id,
      login:staff.login,
      role:staff.role
    });
  }catch(error){
    console.error("Staff session check error:",error);
    return NextResponse.json(
      {ok:false,error:"Ошибка сервера"},
      {status:500}
    );
  }
}
