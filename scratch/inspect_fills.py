import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto("https://minisite-douai.vercel.app/vigilance?period=1", wait_until="networkidle")
        
        try:
            await page.wait_for_selector(".social-fb-container[data-ready='true']", state="attached", timeout=30000)
            print("data-ready=true selector found!")
        except Exception as e:
            print("Timeout waiting for data-ready:", e)
            
        # Get all distinct fills in the SVG
        fills = await page.evaluate('''() => {
            let paths = document.querySelectorAll('svg.fb-svg-map path');
            let colors = new Set();
            paths.forEach(p => {
                let f = p.getAttribute('fill');
                if (f) colors.add(f);
            });
            return Array.from(colors);
        }''')
        print("Distinct fills in SVG after data-ready:", fills)
        
        await browser.close()

asyncio.run(main())
