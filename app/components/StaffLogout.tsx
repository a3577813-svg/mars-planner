"use client";

export default function StaffLogout(){
const logout=async()=>{
try{
await fetch("/api/auth/staff-logout",{method:"POST",credentials:"include"});
}finally{
localStorage.removeItem("mars-active-account");
location.assign("/");
}
};

return <button type="button" onClick={logout} className="staffLogout">Выйти</button>;
}
