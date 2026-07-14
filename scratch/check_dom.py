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

        # Query the text elements
        res = await page.evaluate('''() => {
            let el1 = document.querySelector('.bulletin-auto-card .bulletin-text-display');
            let el2 = document.querySelector('.region-hub-bulletin pre');
            let container = document.querySelector('.social-fb-container');
            return {
                el1_exists: !!el1,
                el1_text: el1 ? el1.innerText : '',
                el2_exists: !!el2,
                el2_text: el2 ? el2.innerText : '',
                container_exists: !!container,
                container_html_snippet: container ? container.outerHTML.substring(0, 1000) : ''
            };
        }''')
        print("DOM Check results:", res)
        
        await browser.close()

asyncio.run(main())
