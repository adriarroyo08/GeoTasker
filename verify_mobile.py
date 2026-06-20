import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Emulate an iPhone or similar mobile device
        context = await browser.new_context(
            viewport={'width': 375, 'height': 667},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True
        )
        page = await context.new_page()
        await page.goto("http://localhost:4173")
        await page.wait_for_load_state("networkidle")
        await page.screenshot(path="verification_mobile.png")
        await browser.close()

asyncio.run(run())
