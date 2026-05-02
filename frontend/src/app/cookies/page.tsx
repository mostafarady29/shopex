import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <Navbar />
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-[800px] mx-auto w-full">
        <h1 className="text-3xl font-black text-[#111] tracking-tight mb-8">Cookie Policy</h1>
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-6 sm:p-8 prose prose-sm max-w-none text-[#333] space-y-6">
          <p className="text-sm text-[#555]">Last updated: May 1, 2026</p>

          <section>
            <h2 className="text-lg font-bold text-[#111]">What Are Cookies</h2>
            <p>Cookies are small text files stored on your device when you visit our website. They help us remember your preferences, keep you signed in, and understand how you use our services.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">Essential Cookies</h2>
            <p>These cookies are necessary for ShopEx to function properly. They enable features like shopping cart functionality, account authentication, and secure checkout. These cannot be disabled.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">Analytics Cookies</h2>
            <p>We use analytics cookies to understand how visitors interact with our website, which pages are most popular, and how users navigate through the site. This helps us improve our services.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">Managing Cookies</h2>
            <p>You can manage or delete cookies through your browser settings. Please note that disabling certain cookies may impact the functionality of our website.</p>
          </section>
        </div>
      </main>
      <MobileNav />
      <div className="h-16 md:hidden" />
    </div>
  );
}
