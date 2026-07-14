/**
 * 📸 CAPTURE + UPLOAD AUTOMATIQUE BILAN FOUDRE 24H
 * 
 * Ce script:
 * 1. Capture un screenshot de la carte foudre
 * 2. L'upload vers Supabase Storage
 * 3. L'image sera accessible via le calendrier dans l'interface
 * 
 * Usage: node scripts/capture_foudre_daily.mjs [date]
 * Exemple: node scripts/capture_foudre_daily.mjs 2026-02-08
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARCHIVES_DIR = path.join(__dirname, '..', 'archives', 'foudre-daily');

// Supabase config
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ubdevaemtwbzxksjlhjg.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZGV2YWVtdHdienhrc2psaGpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc2NTA2OCwiZXhwIjoyMDg0MzQxMDY4fQ.RC_D6wljCTi1WEf0aG3QoEf1ZH_sJkP9TiVXXAovMzI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Configuration
const CONFIG = {
    baseUrl: 'http://localhost:5174',
    prodUrl: 'https://minisite-douai.vercel.app',
    viewport: { width: 1920, height: 1080 },
    waitTime: 8000,
    storageBucket: 'foudre-bilans' // Bucket Supabase Storage
};

async function captureAndUpload(dateStr = null) {
    // Si pas de date fournie, utiliser hier (pour avoir les 24h complètes)
    const targetDate = dateStr || (() => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split('T')[0];
    })();

    console.log(`\n📸 CAPTURE BILAN FOUDRE - ${targetDate}\n`);

    // Créer le dossier d'archives local s'il n'existe pas
    if (!fs.existsSync(ARCHIVES_DIR)) {
        fs.mkdirSync(ARCHIVES_DIR, { recursive: true });
    }

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    try {
        const page = await browser.newPage();
        await page.setViewport(CONFIG.viewport);

        // Essayer d'abord localhost, sinon prod
        let baseUrl = CONFIG.baseUrl;
        try {
            await page.goto(baseUrl, { timeout: 5000 });
        } catch {
            console.log('⚠️ Localhost non disponible, tentative sur prod...');
            baseUrl = CONFIG.prodUrl;
        }

        // Construire l'URL avec la date
        const foudreUrl = `${baseUrl}/foudre`;
        console.log(`🌐 Chargement: ${foudreUrl}`);

        await page.goto(foudreUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(r => setTimeout(r, 2000));

        // Changer la date dans le sélecteur
        console.log(`📅 Sélection de la date: ${targetDate}`);
        await page.evaluate((date) => {
            const dateInput = document.querySelector('input[type="date"]');
            if (dateInput) {
                dateInput.value = date;
                dateInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }, targetDate);

        // Attendre le chargement des nouvelles données
        console.log(`⏳ Attente du chargement (${CONFIG.waitTime / 1000}s)...`);
        await new Promise(r => setTimeout(r, CONFIG.waitTime));

        // Capturer le nombre d'impacts
        const impactCount = await page.evaluate(() => {
            const el = document.querySelector('[style*="fontSize: 1.5rem"]');
            return el ? el.textContent.trim() : '0';
        });

        // Fichier local
        const fileName = `bilan-foudre-${targetDate}.png`;
        const filePath = path.join(ARCHIVES_DIR, fileName);

        // Screenshot de LA CARTE uniquement (pas toute la page)
        console.log(`📷 Capture de la carte en cours...`);

        // Trouver le conteneur de la carte Leaflet
        const mapElement = await page.$('.leaflet-container');

        if (mapElement) {
            await mapElement.screenshot({ path: filePath, type: 'png' });
            console.log('✅ Carte capturée avec succès');
        } else {
            // Fallback: capturer toute la page si la carte n'est pas trouvée
            console.warn('⚠️ Carte non trouvée, capture de la page entière');
            await page.screenshot({ path: filePath, fullPage: false, type: 'png' });
        }

        // Upload vers Supabase Storage
        console.log(`☁️ Upload vers Supabase Storage...`);
        const fileBuffer = fs.readFileSync(filePath);

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(CONFIG.storageBucket)
            .upload(fileName, fileBuffer, {
                contentType: 'image/png',
                upsert: true // Remplacer si existe déjà
            });

        if (uploadError) {
            // Si le bucket n'existe pas, on le crée
            if (uploadError.message.includes('not found')) {
                console.log(`📦 Création du bucket "${CONFIG.storageBucket}"...`);
                await supabase.storage.createBucket(CONFIG.storageBucket, { public: true });

                // Réessayer l'upload
                const { error: retryError } = await supabase.storage
                    .from(CONFIG.storageBucket)
                    .upload(fileName, fileBuffer, { contentType: 'image/png', upsert: true });

                if (retryError) throw retryError;
            } else {
                throw uploadError;
            }
        }

        // Obtenir l'URL publique
        const { data: urlData } = supabase.storage
            .from(CONFIG.storageBucket)
            .getPublicUrl(fileName);

        const publicUrl = urlData?.publicUrl;

        // Enregistrer les métadonnées dans une table
        const { error: dbError } = await supabase
            .from('foudre_bilans')
            .upsert({
                date: targetDate,
                image_url: publicUrl,
                impact_count: parseInt(impactCount.replace(/\s/g, '')) || 0,
                captured_at: new Date().toISOString()
            }, { onConflict: 'date' });

        if (dbError && !dbError.message.includes('does not exist')) {
            console.warn('⚠️ Erreur DB (non critique):', dbError.message);
        }

        const stats = fs.statSync(filePath);
        const sizeKB = (stats.size / 1024).toFixed(1);

        console.log(`\n✅ CAPTURE ET UPLOAD RÉUSSIS!`);
        console.log(`   📅 Date: ${targetDate}`);
        console.log(`   ⚡ Impacts: ${impactCount}`);
        console.log(`   💾 Taille: ${sizeKB} KB`);
        console.log(`   🔗 URL: ${publicUrl}\n`);

        return { success: true, url: publicUrl, date: targetDate, impacts: impactCount };

    } catch (error) {
        console.error(`❌ Erreur:`, error.message);
        return { success: false, error: error.message };
    } finally {
        await browser.close();
    }
}

// Exécution
const dateArg = process.argv[2];
captureAndUpload(dateArg);
