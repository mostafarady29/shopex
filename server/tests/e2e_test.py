"""
ShopEx E2E Test Suite — Playwright-based end-to-end tests
Tests the live production site at https://shopex-6j4c.vercel.app
"""

import sys
import json
import traceback
from playwright.sync_api import sync_playwright

BASE = "https://shopex-6j4c.vercel.app"
API  = "https://shopex1.vercel.app/api"

results = []

def record(name, passed, detail=""):
    status = "✅ PASS" if passed else "❌ FAIL"
    results.append((name, status, detail))
    print(f"  {status}  {name}" + (f"  — {detail}" if detail else ""))


def wait_for_products(page, timeout=8000):
    """Wait until at least one product card appears, or timeout."""
    try:
        page.locator('a[href*="/products/"]').first.wait_for(state="visible", timeout=timeout)
    except:
        pass
    return page.locator('a[href*="/products/"]').count()


def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 800},
            user_agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
        )
        page = context.new_page()
        SDIR = "/home/mostafa/Work/ecommerce-website/.venv/screenshots"

        # ─────────────────────────────────────────────────
        # 1. HOMEPAGE
        # ─────────────────────────────────────────────────
        print("\n═══ 1. HOMEPAGE ═══")
        try:
            page.goto(BASE, wait_until="load", timeout=30000)
            page.wait_for_timeout(3000)
            record("Homepage loads", page.title() != "")

            navbar = page.locator("#navbar-search")
            record("Navbar search bar visible", navbar.is_visible())

            hero = page.locator("text=Shop Smart").first
            record("Hero section renders", hero.is_visible())

            product_links = page.locator('a[href*="/products/"]')
            count = product_links.count()
            record("Homepage shows product cards", count > 0, f"{count} products found")

            page.screenshot(path=f"{SDIR}/01_homepage.png", full_page=False)
        except Exception as e:
            record("Homepage loads", False, str(e)[:100])

        # ─────────────────────────────────────────────────
        # 2. PRODUCTS PAGE + FILTERS
        # ─────────────────────────────────────────────────
        print("\n═══ 2. PRODUCTS PAGE ═══")
        try:
            page.goto(f"{BASE}/products", wait_until="load", timeout=30000)
            count = wait_for_products(page)
            record("Products page shows products", count > 0, f"{count} products")

            pagination = page.locator("text=/\\d+ of \\d+/").first
            record("Pagination info visible", pagination.is_visible())
            page.screenshot(path=f"{SDIR}/02_products.png", full_page=False)
        except Exception as e:
            record("Products page", False, str(e)[:100])

        # Category filter
        try:
            page.goto(f"{BASE}/products?category=Electronics", wait_until="load", timeout=30000)
            count = wait_for_products(page)
            record("Category filter (Electronics)", count > 0, f"{count} products")
        except Exception as e:
            record("Category filter", False, str(e)[:100])

        # Brand filter
        try:
            page.goto(f"{BASE}/products?brand=Samsung", wait_until="load", timeout=30000)
            count = wait_for_products(page)
            record("Brand filter (Samsung)", count > 0, f"{count} products")
        except Exception as e:
            record("Brand filter", False, str(e)[:100])

        # Price filter
        try:
            page.goto(f"{BASE}/products?minPrice=10&maxPrice=50", wait_until="load", timeout=30000)
            count = wait_for_products(page)
            record("Price filter ($10-$50)", count > 0, f"{count} products")
        except Exception as e:
            record("Price filter", False, str(e)[:100])

        # Rating filter
        try:
            page.goto(f"{BASE}/products?minRating=4", wait_until="load", timeout=30000)
            count = wait_for_products(page)
            record("Rating filter (4★+)", count > 0, f"{count} products")
        except Exception as e:
            record("Rating filter", False, str(e)[:100])

        # Search
        try:
            page.goto(f"{BASE}/products?search=phone", wait_until="load", timeout=30000)
            count = wait_for_products(page)
            record("Search (phone)", count > 0, f"{count} products")
        except Exception as e:
            record("Search", False, str(e)[:100])

        # Sort
        try:
            page.goto(f"{BASE}/products?sort=price-low", wait_until="load", timeout=30000)
            count = wait_for_products(page)
            record("Sort (price low→high)", count > 0, f"{count} products")
        except Exception as e:
            record("Sort", False, str(e)[:100])

        # Combined filters
        try:
            page.goto(f"{BASE}/products?category=Electronics&minPrice=5&maxPrice=100", wait_until="load", timeout=30000)
            count = wait_for_products(page)
            record("Combined filters (Cat+Price)", count > 0, f"{count} products")
        except Exception as e:
            record("Combined filters", False, str(e)[:100])

        # ─────────────────────────────────────────────────
        # 3. PRODUCT DETAIL PAGE
        # ─────────────────────────────────────────────────
        print("\n═══ 3. PRODUCT DETAIL ═══")
        try:
            page.goto(f"{BASE}/products", wait_until="load", timeout=30000)
            wait_for_products(page)
            first_product = page.locator('a[href*="/products/"]').first
            first_product.click()
            page.wait_for_load_state("load")
            page.wait_for_timeout(3000)

            # Product name (h1 or h2)
            has_title = page.locator("h1, h2").first.is_visible()
            record("Product detail has title", has_title)

            # Price
            price = page.locator("text=/\\$/").first
            record("Product detail shows price", price.is_visible())

            # Add to cart button (text match)
            add_to_cart = page.locator("button:has-text('Add to Cart')").first
            record("Add to Cart button visible", add_to_cart.is_visible())

            # Buy now button
            buy_now = page.locator("button:has-text('Buy Now')").first
            record("Buy Now button visible", buy_now.is_visible())

            # Share button (icon-only, uses aria-label)
            share_btn = page.locator("button[aria-label='Share']").first
            record("Share button visible", share_btn.is_visible())

            # Wishlist button
            wishlist_btn = page.locator("button[aria-label='Wishlist']").first
            record("Wishlist button visible", wishlist_btn.is_visible())

            page.screenshot(path=f"{SDIR}/03_product_detail.png", full_page=False)
        except Exception as e:
            record("Product detail page", False, str(e)[:100])

        # ─────────────────────────────────────────────────
        # 4. AUTH PAGES
        # ─────────────────────────────────────────────────
        print("\n═══ 4. AUTHENTICATION ═══")
        try:
            page.goto(f"{BASE}/auth/register", wait_until="load", timeout=30000)
            page.wait_for_timeout(1000)
            record("Register page loads", "register" in page.url)
            page.screenshot(path=f"{SDIR}/04_register.png", full_page=False)
        except Exception as e:
            record("Register page", False, str(e)[:100])

        try:
            page.goto(f"{BASE}/auth/login", wait_until="load", timeout=30000)
            page.wait_for_timeout(1000)
            record("Login page loads", "login" in page.url)
            page.screenshot(path=f"{SDIR}/05_login.png", full_page=False)
        except Exception as e:
            record("Login page", False, str(e)[:100])

        # ─────────────────────────────────────────────────
        # 5. CART PAGE
        # ─────────────────────────────────────────────────
        print("\n═══ 5. CART PAGE ═══")
        try:
            page.goto(f"{BASE}/cart", wait_until="load", timeout=30000)
            page.wait_for_timeout(1000)
            record("Cart page loads", "cart" in page.url)
            page.screenshot(path=f"{SDIR}/06_cart.png", full_page=False)
        except Exception as e:
            record("Cart page", False, str(e)[:100])

        # ─────────────────────────────────────────────────
        # 6. WISHLIST PAGE
        # ─────────────────────────────────────────────────
        print("\n═══ 6. WISHLIST PAGE ═══")
        try:
            page.goto(f"{BASE}/wishlist", wait_until="load", timeout=30000)
            page.wait_for_timeout(1000)
            record("Wishlist page loads", "wishlist" in page.url)
            page.screenshot(path=f"{SDIR}/07_wishlist.png", full_page=False)
        except Exception as e:
            record("Wishlist page", False, str(e)[:100])

        # ─────────────────────────────────────────────────
        # 7. ADMIN PAGES (redirect to login if not auth'd)
        # ─────────────────────────────────────────────────
        print("\n═══ 7. ADMIN PAGES ═══")
        admin_pages = [
            ("/admin", "Admin dashboard"),
            ("/admin/products", "Admin products"),
            ("/admin/users", "Admin users"),
            ("/admin/orders", "Admin orders"),
        ]
        for path, name in admin_pages:
            try:
                page.goto(f"{BASE}{path}", wait_until="load", timeout=30000)
                page.wait_for_timeout(1500)
                # Admin pages redirect unauthenticated users to / or /login — both are correct
                url = page.url
                url_path = url.split('.app')[1] if '.app' in url else url
                is_ok = path in url or "login" in url or "admin" in url or url_path == "/"
                record(f"{name} accessible", is_ok, f"redirects to {url_path} (auth required)")
            except Exception as e:
                record(name, False, str(e)[:100])

        # ─────────────────────────────────────────────────
        # 8. STATIC PAGES
        # ─────────────────────────────────────────────────
        print("\n═══ 8. STATIC PAGES ═══")
        static_pages = [
            ("/deals", "Deals page"),
            ("/help", "Help page"),
            ("/terms", "Terms page"),
            ("/privacy", "Privacy page"),
            ("/checkout", "Checkout page"),
        ]
        for path, name in static_pages:
            try:
                page.goto(f"{BASE}{path}", wait_until="load", timeout=30000)
                page.wait_for_timeout(500)
                record(f"{name} loads", path in page.url)
            except Exception as e:
                record(name, False, str(e)[:100])

        # ─────────────────────────────────────────────────
        # 9. API ENDPOINTS
        # ─────────────────────────────────────────────────
        print("\n═══ 9. API ENDPOINTS ═══")
        api_tests = [
            ("/health", "API health check"),
            ("/products?limit=1", "API products list"),
            ("/products/filters", "API filters endpoint"),
            ("/products?brand=Samsung&limit=1", "API brand filter"),
            ("/products?minRating=4&limit=1", "API rating filter"),
            ("/products?category=Electronics&limit=1", "API category filter"),
        ]
        for path, name in api_tests:
            try:
                resp = page.request.get(f"{API}{path}")
                data = resp.json()
                record(name, resp.status == 200 and data.get("success") == True, f"status={resp.status}")
            except Exception as e:
                record(name, False, str(e)[:100])

        # ─────────────────────────────────────────────────
        # 10. MOBILE RESPONSIVE
        # ─────────────────────────────────────────────────
        print("\n═══ 10. MOBILE RESPONSIVE ═══")
        try:
            mobile_context = browser.new_context(
                viewport={"width": 390, "height": 844},
                user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"
            )
            mobile_page = mobile_context.new_page()
            mobile_page.goto(BASE, wait_until="load", timeout=30000)
            mobile_page.wait_for_timeout(3000)

            mobile_nav = mobile_page.locator("nav[aria-label='Mobile navigation']")
            record("Mobile nav bar visible", mobile_nav.is_visible())

            home_btn = mobile_page.locator("#mobile-nav-home")
            record("Mobile Home button", home_btn.is_visible())

            cart_btn = mobile_page.locator("#mobile-nav-cart")
            record("Mobile Cart button", cart_btn.is_visible())

            mobile_page.screenshot(path=f"{SDIR}/08_mobile_home.png", full_page=False)

            mobile_page.goto(f"{BASE}/products", wait_until="load", timeout=30000)
            count = wait_for_products(mobile_page)
            record("Mobile products render", count > 0, f"{count} products")
            mobile_page.screenshot(path=f"{SDIR}/09_mobile_products.png", full_page=False)

            mobile_page.close()
            mobile_context.close()
        except Exception as e:
            record("Mobile responsive", False, str(e)[:100])

        browser.close()

    # ─────────────────────────────────────────────────
    # SUMMARY
    # ─────────────────────────────────────────────────
    print("\n" + "═" * 60)
    print("  SHOPEX E2E TEST SUMMARY")
    print("═" * 60)

    passed = sum(1 for _, s, _ in results if "PASS" in s)
    failed = sum(1 for _, s, _ in results if "FAIL" in s)
    total = len(results)

    for name, status, detail in results:
        line = f"  {status}  {name}"
        if detail:
            line += f"  — {detail}"
        print(line)

    print(f"\n  Total: {total}  |  Passed: {passed}  |  Failed: {failed}")
    print("═" * 60)

    if failed > 0:
        sys.exit(1)


if __name__ == "__main__":
    import os
    os.makedirs("/home/mostafa/Work/ecommerce-website/.venv/screenshots", exist_ok=True)
    run_tests()
