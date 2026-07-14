import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        # Test Landscape
        page1 = await browser.new_page()
        await page1.set_viewport_size({"width": 1920, "height": 1080})
        await page1.goto("https://minisite-douai.vercel.app/vigilance?period=1", wait_until="networkidle")
        try:
            await page1.wait_for_selector(".social-fb-container[data-ready='true']", state="attached", timeout=15000)
        except:
            pass
            
        res1 = await page1.evaluate('''() => {
            let el = document.querySelector('.bulletin-auto-card .bulletin-text-display') || document.querySelector('.region-hub-bulletin pre');
            let rawText = el ? el.innerText : "";
            
            // Also let's search if there's any other element containing the text
            let bodyText = document.body.innerText;
            let containsRouge = bodyText.includes('🔴');
            let containsOrange = bodyText.includes('🟠');
            
            return {
                rawText: rawText,
                rawText_len: rawText.length,
                containsRouge,
                containsOrange,
                bodyText_sample: bodyText.substring(0, 1000)
            };
        }''')
        print("Landscape run evaluation:", res1)
        await page1.close()
        
        # Test Portrait
        page2 = await browser.new_page()
        await page2.set_viewport_size({"width": 1080, "height": 1920})
        await page2.goto("https://minisite-douai.vercel.app/vigilance?period=1", wait_until="networkidle")
        try:
            await page2.wait_for_selector(".social-fb-container[data-ready='true']", state="attached", timeout=15000)
        except:
            pass
            
        res2 = await page2.evaluate('''() => {
            let el = document.querySelector('.bulletin-auto-card .bulletin-text-display') || document.querySelector('.region-hub-bulletin pre');
            let rawText = el ? el.innerText : "";
            
            let bodyText = document.body.innerText;
            let containsRouge = bodyText.includes('🔴');
            let containsOrange = bodyText.includes('🟠');
            
            return {
                rawText: rawText,
                rawText_len: rawText.length,
                containsRouge,
                containsOrange,
                bodyText_sample: bodyText.substring(0, 1000)
            };
        }''')
        print("Portrait run evaluation:", res2)
        await page2.close()
        
        await browser.close()

asyncio.run(main())
