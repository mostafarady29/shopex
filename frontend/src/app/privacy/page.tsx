import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <Navbar />
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-[800px] mx-auto w-full">
        <h1 className="text-3xl font-black text-[#111] tracking-tight mb-8">Privacy Policy</h1>
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-6 sm:p-8 prose prose-sm max-w-none text-[#333] space-y-6">
          <p className="text-sm text-[#555]">Last updated: May 1, 2026</p>

          <section>
            <h2 className="text-lg font-bold text-[#111]">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, make a purchase, subscribe to our newsletter, or contact us for support. This includes your name, email address, shipping address, phone number, and payment information.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">2. How We Use Your Information</h2>
            <p>We use the information we collect to process your orders, communicate with you about your account and our products, personalize your shopping experience, improve our services, and send you promotional offers (with your consent).</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">3. Information Sharing</h2>
            <p>We do not sell your personal information to third parties. We may share your information with service providers who help us operate our business, such as payment processors, shipping carriers, and cloud service providers.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">4. Data Security</h2>
            <p>We implement industry-standard security measures including 256-bit SSL encryption, secure payment processing, and regular security audits to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal information at any time. You may also opt out of marketing communications by updating your preferences in your account settings or contacting our support team.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">6. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at <span className="text-[#0066c0] font-bold">privacy@shopex.com</span>.</p>
          </section>
        </div>
      </main>
      <MobileNav />
      <div className="h-16 md:hidden" />
    </div>
  );
}
