import { execSync } from "child_process";
import { readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const files = readdirSync(__dirname)
  .filter((f) => /^\d+_.+\.js$/.test(f))
  .sort();

for (const file of files) {
  console.log(`[${new Date().toISOString()}] Executando migration: ${file}`);
  try {
    execSync(`node ${join(__dirname, file)}`, { stdio: "inherit" });
    console.log(`[${new Date().toISOString()}] ✅ Migration ${file} concluída.`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] ❌ Migration ${file} falhou.`);
    process.exit(1);
  }
}
