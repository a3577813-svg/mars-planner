import {NextRequest,NextResponse} from "next/server";

function plannerRequest(request:NextRequest){
  const path=request.nextUrl.pathname;

  if(
    !path.startsWith("/book") &&
    !path.startsWith("/senior/unique")
  ){
    return null;
  }

  const params=request.nextUrl.searchParams;
  const rawPage=Number(params.get("page")||"1")||1;

  let audience:"middle"|"senior"=
    path.startsWith("/senior/unique")||params.get("senior")==="1"
      ?"senior"
      :"middle";

  let page=rawPage;

  if(
    audience==="senior" &&
    path==="/book-next9"
  ){
    if(rawPage===37)page=44;
    if(rawPage===38)page=45;
  }

  const mode=params.get("mode")||"student";

  return {audience,page,mode};
}

export async function middleware(request:NextRequest){
  const path=request.nextUrl.pathname;

  if(path.startsWith("/admin")){
    try{
      const url=new URL("/api/auth/admin-session",request.url);
      const headers:Record<string,string>={};
      const cookie=request.headers.get("cookie");
      if(cookie)headers.cookie=cookie;

      const response=await fetch(url,{method:"GET",headers,cache:"no-store"});
      const data=await response.json().catch(()=>null);

      if(!response.ok||!data?.ok||data.role!=="admin"){
        return NextResponse.redirect(new URL("/",request.url));
      }

      return NextResponse.next();
    }catch(error){
      console.error("Admin middleware access check failed",error);
      return NextResponse.redirect(new URL("/",request.url));
    }
  }

  if(path.startsWith("/teacher")||path.startsWith("/methodist")){
    try{
      const url=new URL("/api/auth/staff-session",request.url);
      const headers:Record<string,string>={};
      const cookie=request.headers.get("cookie");
      if(cookie)headers.cookie=cookie;

      const response=await fetch(url,{method:"GET",headers,cache:"no-store"});
      const data=await response.json().catch(()=>null);

      if(!response.ok||!data?.ok){
        return NextResponse.redirect(new URL("/",request.url));
      }

      if(path.startsWith("/teacher")&&data.role!=="teacher"){
        return NextResponse.redirect(new URL(data.role==="methodist"?"/methodist":"/",request.url));
      }

      if(path.startsWith("/methodist")&&data.role!=="methodist"){
        return NextResponse.redirect(new URL(data.role==="teacher"?"/teacher":"/",request.url));
      }

      return NextResponse.next();
    }catch(error){
      console.error("Staff middleware access check failed",error);
      return NextResponse.redirect(new URL("/",request.url));
    }
  }

  const access=plannerRequest(request);

  if(!access){
    return NextResponse.next();
  }

  try{
    const url=new URL("http://127.0.0.1:3000/api/planner/access-check");
    url.searchParams.set("audience",access.audience);
    url.searchParams.set("page",String(access.page));
    url.searchParams.set("mode",access.mode);

    const headers:Record<string,string>={};

    const cookie=request.headers.get("cookie");
    if(cookie)headers.cookie=cookie;

    const pdfAccess=request.headers.get("x-mars-pdf-access");
    if(pdfAccess)headers["x-mars-pdf-access"]=pdfAccess;

    const response=await fetch(url,{
      method:"GET",
      headers,
      cache:"no-store"
    });

    const data=await response.json().catch(()=>null);

    if(response.ok&&data?.allowed===true){
      return NextResponse.next();
    }

    if(data?.home){
      return NextResponse.redirect(new URL(data.home,request.url));
    }

    if(access.mode==="teacher"){
      return NextResponse.redirect(new URL("/teacher",request.url));
    }

    if(access.mode==="methodist"){
      return NextResponse.redirect(new URL("/methodist",request.url));
    }

    if(access.mode==="admin-edit"){
      return NextResponse.redirect(new URL("/admin",request.url));
    }

    return NextResponse.redirect(new URL("/",request.url));
  }catch(error){
    console.error("Planner middleware access check failed",error);
    return NextResponse.redirect(new URL("/",request.url));
  }
}

export const config={
  matcher:[
    "/book/:path*",
    "/book-next/:path*",
    "/book-next2/:path*",
    "/book-next3/:path*",
    "/book-next4/:path*",
    "/book-next5/:path*",
    "/book-next6/:path*",
    "/book-next7/:path*",
    "/book-next8/:path*",
    "/book-next9/:path*",
    "/senior/unique/:path*",
    "/senior/unique2/:path*",
    "/senior/unique3/:path*",
    "/senior/unique4/:path*",
    "/senior/unique5/:path*",
    "/teacher/:path*",
    "/methodist/:path*",
    "/admin/:path*"
  ]
};
