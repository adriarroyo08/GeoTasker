from playwright.sync_api import sync_playwright

def verify_pwa():
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch()

        # Create a mobile context (iPhone 12 Pro)
        iphone_12 = p.devices['iPhone 12 Pro']
        context = browser.new_context(**iphone_12)

        page = context.new_page()

        try:
            # Navigate to the app
            page.goto("http://localhost:4173/")
            page.wait_for_load_state("networkidle")

            # Verify Title
            print(f"Title: {page.title()}")

            # Verify Meta Tags
            viewport = page.locator('meta[name="viewport"]').get_attribute("content")
            print(f"Viewport: {viewport}")

            capable = page.locator('meta[name="apple-mobile-web-app-capable"]').get_attribute("content")
            print(f"Apple Capable: {capable}")

            status_bar = page.locator('meta[name="apple-mobile-web-app-status-bar-style"]').get_attribute("content")
            print(f"Status Bar: {status_bar}")

            # Verify Manifest Link
            manifest = page.locator('link[rel="manifest"]').get_attribute("href")
            print(f"Manifest: {manifest}")

            # Check for safe area padding classes
            # We can't easily check computed styles for safe-area-inset envs in headless easily without mocking,
            # but we can check if the classes are applied.
            header = page.locator('header')
            header_class = header.get_attribute('class')
            print(f"Header Class: {header_class}")

            nav = page.locator('nav')
            nav_class = nav.get_attribute('class')
            print(f"Nav Class: {nav_class}")

            # Take screenshot
            page.screenshot(path="verification_mobile.png")
            print("Screenshot saved to verification_mobile.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_pwa()
