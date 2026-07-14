import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto("https://minisite-douai.vercel.app/vigilance?period=1", wait_until="networkidle")
        
        try:
            await page.wait_for_selector(".social-fb-container[data-ready='true']", state="attached", timeout=15000)
            print("data-ready=true found!")
        except Exception as e:
            print("data-ready not found:", e)

        # Print the HTML of the first path in the SVG
        html = await page.evaluate('''() => {
            let svg = document.querySelector('svg.fb-svg-map');
            if (!svg) return "No SVG found";
            let path = svg.querySelector('path');
            return path ? path.outerHTML : "No path found";
        }''')
        print("First path HTML:", html)
        
        # Let's check if there are any style tags inside the SVG or nearby
        styles = await page.evaluate('''() => {
            let styles = Array.from(document.querySelectorAll('style'));
            return styles.map(s => s.innerHTML).filter(t => t.includes('fb-svg-map') || t.includes('path'));
        }''')
        print("Related styles count:", len(styles))
        if styles:
            print("First related style sample:", styles[0][:500])

        await browser.close()

asyncio.run(main())
