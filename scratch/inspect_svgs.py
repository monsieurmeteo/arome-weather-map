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

        # Let's find all SVG elements and print their details
        results = await page.evaluate('''() => {
            let svgs = Array.from(document.querySelectorAll('svg'));
            return svgs.map((s, idx) => {
                let paths = Array.from(s.querySelectorAll('path'));
                let fills = new Set();
                paths.forEach(p => {
                    let f = p.getAttribute('fill');
                    if (f) fills.add(f);
                });
                return {
                    idx,
                    className: s.className ? s.className.baseVal : '',
                    id: s.getAttribute('id'),
                    paths_count: paths.length,
                    distinct_fills: Array.from(fills)
                };
            });
        }''')
        print("SVGs Info:", results)
        
        await browser.close()

asyncio.run(main())
