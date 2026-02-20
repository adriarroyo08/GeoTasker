from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Navigate to the app
        print("Navigating to http://localhost:3000/")
        page.goto("http://localhost:3000/")

        # Wait for the header
        print("Waiting for 'GeoTasker' header...")
        page.get_by_text("GeoTasker").wait_for()

        # Wait for the input placeholder
        print("Waiting for input placeholder...")
        page.get_by_placeholder("Ej: Comprar leche en Walmart...").wait_for()

        # Wait for bottom nav
        print("Waiting for 'Mapa' button...")
        page.get_by_text("Mapa").wait_for()

        # Take screenshot
        print("Taking screenshot...")
        page.screenshot(path="verification/refactor_verification.png")
        print("Screenshot saved to verification/refactor_verification.png")

        browser.close()

if __name__ == "__main__":
    run()
