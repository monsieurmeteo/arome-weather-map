import puppeteer from 'puppeteer';
import path from 'path';

const previewHtmlPath = 'file:///C:/Users/grego/.gemini/antigravity/brain/faa06c22-a954-4936-aec4-6ddd9347bb17/scratch/email_preview.html';
const brainDir = 'C:\\Users\\grego\\.gemini\\antigravity\\brain\\faa06c22-a954-4936-aec4-6ddd9347bb17';
const scratchDir = path.join(brainDir, 'scratch');

async function capture() {
    console.log("🚀 Initialisation de Puppeteer pour les captures d'écran depuis le minisite...");
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // 1. Gmail Desktop (largeur de 850px)
        console.log("📸 Capture Gmail Desktop...");
        await page.setViewport({ width: 850, height: 1200, deviceScaleFactor: 2 });
        await page.goto(previewHtmlPath, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 1000));
        
        const desktopPathScratch = path.join(scratchDir, 'preview_desktop.png');
        const desktopPathBrain = path.join(brainDir, 'preview_desktop.png');
        await page.screenshot({ path: desktopPathScratch, fullPage: true });
        await page.screenshot({ path: desktopPathBrain, fullPage: true });
        console.log(`✅ Gmail Desktop sauvegardé : ${desktopPathScratch}`);

        // 2. Gmail Mobile (largeur de 375px)
        console.log("📸 Capture Gmail Mobile (375px)...");
        await page.setViewport({ width: 375, height: 1500, deviceScaleFactor: 2, isMobile: true });
        await page.goto(previewHtmlPath, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 1000));
        
        const mobilePathScratch = path.join(scratchDir, 'preview_mobile.png');
        const mobilePathBrain = path.join(brainDir, 'preview_mobile.png');
        await page.screenshot({ path: mobilePathScratch, fullPage: true });
        await page.screenshot({ path: mobilePathBrain, fullPage: true });
        console.log(`✅ Gmail Mobile sauvegardé : ${mobilePathScratch}`);

        // 3. Outlook Desktop (largeur de 650px)
        console.log("📸 Capture Outlook Desktop (650px)...");
        await page.setViewport({ width: 650, height: 1300, deviceScaleFactor: 2 });
        await page.goto(previewHtmlPath, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 1000));
        
        const outlookPathScratch = path.join(scratchDir, 'preview_outlook.png');
        const outlookPathBrain = path.join(brainDir, 'preview_outlook.png');
        await page.screenshot({ path: outlookPathScratch, fullPage: true });
        await page.screenshot({ path: outlookPathBrain, fullPage: true });
        console.log(`✅ Outlook Desktop sauvegardé : ${outlookPathScratch}`);

        console.log("✨ Toutes les captures d'écran ont été générées avec succès !");
    } catch (e) {
        console.error("❌ Erreur pendant les captures :", e);
    } finally {
        await browser.close();
    }
}

capture();
