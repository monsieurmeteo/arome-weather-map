import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');

try {
    console.log(`[${new Date().toISOString()}] ⚡ Lancement de la tâche Cron Foudre...`);
    
    // 1. Exécuter le script de synchro
    execSync('node scripts/sync_foudre_static.mjs', { cwd: ROOT_DIR, stdio: 'inherit' });

    // 2. Vérifier s'il y a des modifs git
    const status = execSync('git status --porcelain public/archives_orage/', { cwd: ROOT_DIR }).toString().trim();

    if (status) {
        console.log("📝 Nouveaux fichiers d'archive détectés. Commit et push vers GitHub...");
        execSync('git add public/archives_orage/', { cwd: ROOT_DIR, stdio: 'inherit' });
        execSync('git commit -m "chore(foudre): archivage automatique statique foudre [skip ci] [skip vercel]"', { cwd: ROOT_DIR, stdio: 'inherit' });
        execSync('git push origin master', { cwd: ROOT_DIR, stdio: 'inherit' });
        console.log("✅ Synchronisation et push réussis !");
    } else {
        console.log("⚫ Aucun nouvel impact de foudre à committer.");
    }
} catch (error) {
    console.error("❌ Erreur pendant l'exécution de la tâche cron :", error.message);
}
