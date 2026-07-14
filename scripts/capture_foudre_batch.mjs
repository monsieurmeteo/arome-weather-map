/**
 * 📸 CAPTURE EN MASSE - Plusieurs jours en arrière-plan
 * 
 * Usage: node scripts/capture_foudre_batch.mjs [nombre_jours]
 * Exemple: node scripts/capture_foudre_batch.mjs 7
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARCHIVES_DIR = path.join(__dirname, '..', 'archives', 'foudre-daily');

const supabase = createClient(
    'https://ubdevaemtwbzxksjlhjg.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZGV2YWVtdHdienhrc2psaGpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc2NTA2OCwiZXhwIjoyMDg0MzQxMDY4fQ.RC_D6wljCTi1WEf0aG3QoEf1ZH_sJkP9TiVXXAovMzI'
);

const CONFIG = {
    baseUrl: 'http://localhost:5174',
    viewport: { width: 1920, height: 1080 },
    waitTime: 10000,
    storageBucket: 'foudre-bilans'
};

async function captureMultipleDays(days = 7) {
    console.log(`\n📸 CAPTURE EN MASSE - ${days} derniers jours\n`);
    console.log('⏳ Lancement du navigateur...\n');

    if (!fs.existsSync(ARCHIVES_DIR)) {
        fs.mkdirSync(ARCHIVES_DIR, { recursive: true });
    }

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    await page.setViewport(CONFIG.viewport);

    // Charger la page une seule fois
    console.log('🌐 Chargement de la page...');
    await page.goto(`${CONFIG.baseUrl}/foudre`, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 3000));

    const results = [];

    for (let i = 1; i <= days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const targetDate = date.toISOString().split('T')[0];
        const displayDate = date.toLocaleDateString('fr-FR');

        try {
            // Vérifier si déjà capturé
            const { data: existing } = await supabase
                .from('foudre_bilans')
                .select('date')
                .eq('date', targetDate)
                .single();

            if (existing) {
                console.log(`${displayDate}: ⏭️ Déjà capturé, skip`);
                results.push({ date: targetDate, status: 'skipped' });
                continue;
            }

            // Changer la date
            await page.evaluate((d) => {
                const input = document.querySelector('input[type="date"]');
                if (input) {
                    input.value = d;
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }, targetDate);

            await new Promise(r => setTimeout(r, CONFIG.waitTime));

            // Capturer le nombre d'impacts
            const impactCount = await page.evaluate(() => {
                const el = document.querySelector('[style*="fontSize: 1.5rem"]');
                return el ? el.textContent.trim().replace(/\s/g, '') : '0';
            });

            // Screenshot de la carte
            const mapElement = await page.$('.leaflet-container');
            const fileName = `bilan-foudre-${targetDate}.png`;
            const filePath = path.join(ARCHIVES_DIR, fileName);

            if (mapElement) {
                await mapElement.screenshot({ path: filePath, type: 'png' });
            } else {
                await page.screenshot({ path: filePath, fullPage: false, type: 'png' });
            }

            // Upload vers Supabase
            const fileBuffer = fs.readFileSync(filePath);
            await supabase.storage
                .from(CONFIG.storageBucket)
                .upload(fileName, fileBuffer, { contentType: 'image/png', upsert: true });

            const { data: urlData } = supabase.storage
                .from(CONFIG.storageBucket)
                .getPublicUrl(fileName);

            // Enregistrer en DB
            await supabase.from('foudre_bilans').upsert({
                date: targetDate,
                image_url: urlData?.publicUrl,
                impact_count: parseInt(impactCount) || 0,
                captured_at: new Date().toISOString()
            }, { onConflict: 'date' });

            const sizeKB = (fs.statSync(filePath).size / 1024).toFixed(0);
            console.log(`${displayDate}: ✅ ${impactCount.padStart(5)} impacts (${sizeKB} KB)`);
            results.push({ date: targetDate, status: 'success', impacts: impactCount });

        } catch (error) {
            console.log(`${displayDate}: ❌ Erreur - ${error.message}`);
            results.push({ date: targetDate, status: 'error', error: error.message });
        }
    }

    await browser.close();

    const success = results.filter(r => r.status === 'success').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    const errors = results.filter(r => r.status === 'error').length;

    console.log(`\n📊 RÉSUMÉ:`);
    console.log(`   ✅ Capturés: ${success}`);
    console.log(`   ⏭️ Déjà existants: ${skipped}`);
    console.log(`   ❌ Erreurs: ${errors}`);
    console.log(`\n🎉 Terminé!\n`);
}

const days = parseInt(process.argv[2]) || 7;
captureMultipleDays(days);
