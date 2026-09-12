import {NextResponse} from "next/server";
import {getCurrentAdmin} from "../../../lib/admin-session";

export async function GET(){
  try{
    const admin=await getCurrentAdmin();

    if(!admin){
      return NextResponse.json(
        {ok:false,error:"unauthorized"},
        {status:401}
      );
    }

    return NextResponse.json({
      ok:true,
      id:admin.id,
      login:admin.login,
      role:"admin"
    });
  }catch(error){
    console.error("Admin session check error:",error);
    return NextResponse.json(
      {ok:false,error:"Ошибка сервера"},
      {status:500}
    );
  }
}
