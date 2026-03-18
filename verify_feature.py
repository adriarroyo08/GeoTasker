from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        # Emulate mobile with location permission enabled
        context = browser.new_context(
            **p.devices['iPhone 12'],
            geolocation={"latitude": 40.4168, "longitude": -3.7038},
            permissions=["geolocation"]
        )
        page = context.new_page()

        # Go to app
        page.goto('http://localhost:4173')

        # Wait a bit
        page.wait_for_timeout(1000)

        # Click on map tab
        page.get_by_role("button", name="Mapa").click()

        # Wait for map to load
        page.wait_for_selector('.leaflet-container', timeout=10000)

        # Wait a bit more for map tiles
        page.wait_for_timeout(3000)

        # Take a screenshot
        page.screenshot(path='/tmp/verification_map.png')

        browser.close()

if __name__ == '__main__':
    verify_frontend()
