import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not set in .env");
}

const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client);
const testConnection = async () => {
    try {
        await client`SELECT 1`
        console.log("✅ เชื่อม PostgreSQL สำเร็จ!")
    } catch (error) {
        console.error("❌ เชื่อมไม่ได้:", error)
    }
}

testConnection()