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

        # Let's inspect all CSS rules targeting fb-svg-map or path on the page
        rules = await page.evaluate('''() => {
            let results = [];
            for (let sheet of document.styleSheets) {
                try {
                    for (let rule of sheet.cssRules) {
                        if (rule.selectorText && (rule.selectorText.includes('fb-svg-map') || rule.selectorText.includes('path'))) {
                            results.push(rule.cssText);
                        }
                    }
                } catch (e) {
                    // Cross-origin stylesheet, can't read directly
                }
            }
            return results;
        }''')
        print("CSS Rules count:", len(rules))
        for r in rules[:10]:
            print("Rule:", r)

        # Let's check computed style of a few paths in the SVG!
        # Specifically, let's find the computed fill of all 96 paths!
        computed_fills = await page.evaluate('''() => {
            let paths = Array.from(document.querySelectorAll('svg.fb-svg-map path'));
            let colors = new Set();
            paths.forEach(p => {
                let computed = window.getComputedStyle(p);
                colors.add(computed.fill);
            });
            return Array.from(colors);
        }''')
        print("Computed fills of SVG paths:", computed_fills)
        
        await browser.close()

asyncio.run(main())
