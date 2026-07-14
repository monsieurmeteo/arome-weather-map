import fs from 'fs';
import path from 'path';

const OUT_DIR = path.join('c:', 'Users', 'grego', 'Documents', 'minisite-douai', 'public', 'archives_orage');
if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
}

const startDate = new Date(2021, 7, 14); // 14 aout 2021 (month is 0-indexed)
const endDate = new Date(); // today

const formatString = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
};

async function fetchForDate(dateStr) {
    const filePath = path.join(OUT_DIR, `orage_${dateStr}.json`);
    if (fs.existsSync(filePath)) {
        return { success: true, cached: true };
    }
    const url = `https://www.mwattest.fr/ORAGE/orage/ws/wsOragesGMaps.php?date=${dateStr}&heureD=00&heureF=23&pass=jh2kH3,R`;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 10000);
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(id);
            
            if (!res.ok) {
                throw new Error(`HTTP error ${res.status}`);
            }
            const text = await res.text();
            
            // Check if it's valid JSON
            try {
                JSON.parse(text);
            } catch (e) {
                if (attempt === 3) {
                    console.error(`[${dateStr}] Invalid JSON output.`);
                    return { success: false, error: 'Invalid JSON' };
                }
                throw new Error('Invalid JSON');
            }

            fs.writeFileSync(filePath, text, 'utf-8');
            return { success: true, cached: false, size: text.length };
        } catch (err) {
            if (attempt === 3) {
                return { success: false, error: err.message };
            }
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}

async function run() {
    let current = new Date(startDate);
    const dates = [];
    while (current <= endDate) {
        dates.push(formatString(current));
        current.setDate(current.getDate() + 1);
    }
    
    console.log(`Total dates to process: ${dates.length}`);
    let successCount = 0;
    let failCount = 0;
    
    const batchSize = 10;
    for (let i = 0; i < dates.length; i += batchSize) {
        const batch = dates.slice(i, i + batchSize);
        const promises = batch.map(async (d) => {
            const result = await fetchForDate(d);
            if (!result.cached) {
                if (result.success) {
                    console.log(`[${d}] Downloaded ${result.size} bytes`);
                    successCount++;
                } else {
                    console.error(`[${d}] Failed: ${result.error}`);
                    failCount++;
                }
            }
        });
        await Promise.all(promises);
    }
    console.log(`\nAll done! Downloaded: ${successCount}, Failed: ${failCount}`);
}

run();
