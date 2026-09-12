import {Pool} from "pg";

const globalForDb=globalThis as unknown as {marsDb?:Pool};

export const db=globalForDb.marsDb??new Pool({
  connectionString:process.env.DATABASE_URL,
});

if(process.env.NODE_ENV!=="production"){
  globalForDb.marsDb=db;
}
