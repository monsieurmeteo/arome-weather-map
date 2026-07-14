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

        # Dump the entire innerHTML of .social-fb-container
        html = await page.evaluate('''() => {
            let container = document.querySelector('.social-fb-container');
            return container ? container.innerHTML : "No container";
        }''')
        
        # Save to a file in the scratch folder so we can inspect it
        dest_path = r"C:\Users\grego\Documents\METEO_CLIMAT\meteo cnews 2\scratch\social_container.html"
        with open(dest_path, "w", encoding="utf-8") as f:
            f.write(html)
        print("Dumped social-fb-container HTML to:", dest_path)
        
        await browser.close()

asyncio.run(main())
