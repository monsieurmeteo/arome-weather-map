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

        # Inspect some department path attributes
        # Let's find some paths with non-green fills, or print details of specific department paths
        results = await page.evaluate('''() => {
            let paths = Array.from(document.querySelectorAll('svg.fb-svg-map path'));
            let sample = [];
            paths.forEach((p, idx) => {
                let id = p.getAttribute('id') || p.className || String(idx);
                let fill = p.getAttribute('fill');
                let style = p.getAttribute('style');
                let d = p.getAttribute('d');
                // Let's filter to keep only some paths to show in the output
                if (idx < 5 || (fill && fill !== '#22c55e')) {
                    sample.push({
                        idx,
                        id,
                        fill,
                        style,
                        dLen: d ? d.length : 0
                    });
                }
            });
            return {
                total_paths: paths.length,
                sample: sample
            };
        }''')
        print("Paths Info:", results)
        
        await browser.close()

asyncio.run(main())
