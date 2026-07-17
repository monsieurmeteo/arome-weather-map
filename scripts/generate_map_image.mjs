import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function captureMap() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error("❌ Usage: node generate_map_image.mjs <input_html_path> <output_png_path>");
        process.exit(1);
    }

    const inputHtml = path.resolve(args[0]);
    const outputPng = path.resolve(args[1]);

    console.log(`🚀 Démarrage de Puppeteer pour capturer : ${inputHtml}...`);
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        
        // Configuration de la taille de l'image (Format 16:9 HD standard pour rapports et emails)
        await page.setViewport({ width: 1200, height: 750 });

        // Charger le fichier HTML local
        await page.goto(`file://${inputHtml}`, {
            waitUntil: 'networkidle2',
            timeout: 15000
        });

        // Laisser 1.5 seconde de plus pour s'assurer que Leaflet a fini de dessiner tous les marqueurs
        console.log("⏱️ Attente du rendu graphique...");
        await new Promise(r => setTimeout(r, 1500));

        // Prendre la capture d'écran de l'élément carte ou de la page entière
        await page.screenshot({
            path: outputPng,
            type: 'png'
        });

        console.log(`✅ Capture réussie et enregistrée dans : ${outputPng}`);
    } catch (error) {
        console.error("❌ Échec lors de la capture d'écran :", error);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

captureMap();
