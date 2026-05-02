import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <Navbar />
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-[800px] mx-auto w-full">
        <h1 className="text-3xl font-black text-[#111] tracking-tight mb-8">Terms & Conditions</h1>
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-6 sm:p-8 prose prose-sm max-w-none text-[#333] space-y-6">
          <p className="text-sm text-[#555]">Last updated: May 1, 2026</p>

          <section>
            <h2 className="text-lg font-bold text-[#111]">1. Acceptance of Terms</h2>
            <p>By accessing or using ShopEx, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">2. Account Registration</h2>
            <p>To make purchases, you must create an account with accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">3. Orders & Pricing</h2>
            <p>All prices are listed in USD and are subject to change without notice. We reserve the right to cancel any order due to pricing errors, product availability, or suspected fraud.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">4. Shipping & Delivery</h2>
            <p>Free shipping is available on orders over $35. Standard delivery takes 2-5 business days. Expedited and same-day delivery options are available in select areas.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">5. Returns & Refunds</h2>
            <p>We offer a 30-day hassle-free return policy. Items must be in their original condition and packaging. Refunds will be processed within 5-7 business days of receiving the returned item.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">6. Limitation of Liability</h2>
            <p>ShopEx shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with the use of our services.</p>
          </section>
        </div>
      </main>
      <MobileNav />
      <div className="h-16 md:hidden" />
    </div>
  );
}
