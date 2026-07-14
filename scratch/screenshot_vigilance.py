import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        # Set viewport to 1920x1080
        await page.set_viewport_size({"width": 1920, "height": 1080})
        await page.goto("https://minisite-douai.vercel.app/vigilance?period=1", wait_until="networkidle")
        
        try:
            await page.wait_for_selector(".social-fb-container[data-ready='true']", state="attached", timeout=15000)
            print("data-ready=true found!")
        except Exception as e:
            print("data-ready not found:", e)
            
        # Take a screenshot of the entire page
        dest_path = r"C:\Users\grego\Desktop\cartes_alertes\scratch_vigilance.png"
        await page.screenshot(path=dest_path)
        print("Screenshot saved to:", dest_path)
        
        await browser.close()

asyncio.run(main())
