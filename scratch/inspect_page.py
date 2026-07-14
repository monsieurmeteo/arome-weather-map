import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto("https://minisite-douai.vercel.app/vigilance?period=1", wait_until="networkidle")
        
        try:
            await page.wait_for_selector(".social-fb-container[data-ready='true']", state="attached", timeout=15000)
            print("data-ready=true selector found!")
        except Exception as e:
            print("Timeout waiting for data-ready:", e)

        # Let's inspect the DOM elements
        results = await page.evaluate('''() => {
            let info = {};
            
            // Check for date elements
            let titleEl = document.querySelector('.bulletin-auto-card h2, .bulletin-auto-card .title, h1, h2, h3, .date');
            if (titleEl) {
                info.titleText = titleEl.innerText;
                info.titleClass = titleEl.className;
                info.titleTag = titleEl.tagName;
            }
            
            // Look for any elements containing the date or bulletin-text-display
            let textDisp = document.querySelector('.bulletin-text-display, .region-hub-bulletin pre');
            if (textDisp) {
                info.textDispText = textDisp.innerText;
                info.textDispClass = textDisp.className;
            }
            
            // Let's find all text in the social-fb-container
            let fbContainer = document.querySelector('.social-fb-container');
            if (fbContainer) {
                info.fbText = fbContainer.innerText;
            }
            
            return info;
        }''')
        print("DOM Info:", results)
        
        await browser.close()

asyncio.run(main())
