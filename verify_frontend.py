from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        iphone_12 = p.devices['iPhone 12 Pro']
        context = browser.new_context(**iphone_12)
        page = context.new_page()

        try:
            page.goto("http://localhost:4174/") # Updated port
            page.wait_for_load_state("networkidle")

            # 1. Verify Header Classes for Safe Area
            # Note: We check if the class string contains the updated tailwind class.
            # The class string might be long, so we check for substring.
            header = page.locator('header')
            header_classes = header.get_attribute('class')

            # The class name might be compiled/minified in production build if we were checking specific output css,
            # but since we are checking the class attribute on the element in React, it should still be present
            # unless stripped. Let's check for the substring.
            if "pt-[calc(0.75rem_+_env(safe-area-inset-top))]" in header_classes:
                print("SUCCESS: Header has correct safe-area class.")
            else:
                print(f"FAILURE: Header class is missing or incorrect. Found: {header_classes}")

            # 2. Verify Nav Classes for Safe Area
            nav = page.locator('nav')
            nav_classes = nav.get_attribute('class')
            if "pb-[calc(0.75rem_+_env(safe-area-inset-bottom))]" in nav_classes:
                 print("SUCCESS: Nav has correct safe-area class.")
            else:
                 print(f"FAILURE: Nav class is missing or incorrect. Found: {nav_classes}")

            # 3. Verify Body Styles (Computed)
            # We can check computed style for height.
            body_height = page.evaluate("window.getComputedStyle(document.body).height")
            print(f"Body Height: {body_height}")

            # Check for robots.txt
            # We can use requests or fetch inside page context
            robots_content = page.evaluate("fetch('/robots.txt').then(r => r.text())")
            if "Disallow: /" in robots_content:
                print("SUCCESS: robots.txt content verified.")
            else:
                print(f"FAILURE: robots.txt content incorrect: {robots_content}")

            page.screenshot(path="verification_mobile_fixed.png")
            print("Screenshot saved.")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_frontend()
