import { Navbar }          from "@/components/layout/Navbar";
import { MobileNav }       from "@/components/layout/MobileNav";
import { Hero }            from "@/components/home/Hero";
import { BentoGrid }       from "@/components/home/BentoGrid";
import { NewsletterForm }  from "@/components/home/NewsletterForm";
import Link from "next/link";
import { Globe, MessageSquareShare, Rss, Share2 } from "lucide-react";

const footerLinks = [
  {
    title: "Shop",
    links: [
      { label: "Electronics", href: "/products?category=Electronics" },
      { label: "Men's Clothing", href: "/products?category=Men's Clothing" },
      { label: "Home & Kitchen", href: "/products?category=Home & Kitchen" },
      { label: "Sports & Outdoors", href: "/products?category=Sports & Outdoors" },
      { label: "Toys & Games", href: "/products?category=Toys & Games" },
      { label: "All Products", href: "/products" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Returns", href: "/terms" },
      { label: "Track Order", href: "/orders" },
      { label: "Contact Us", href: "/help" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/help" },
      { label: "Deals", href: "/deals" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const socialIcons = [Share2, MessageSquareShare, Globe, Rss];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Navbar />

      <Hero />
      <BentoGrid />

      {/* Newsletter — client component handles form interaction */}
      <NewsletterForm />

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="bg-[#0a0a0a] text-[#888] border-t border-white/5">
        <div className="mx-auto max-w-[1400px] px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <div className="text-2xl font-black text-white mb-3">
                Shop<span className="text-[#FF9900]">Ex</span>
              </div>
              <p className="text-sm leading-relaxed mb-4">
                The modern marketplace built for speed, trust, and delight.
              </p>
              <div className="flex gap-3">
                {socialIcons.map((Icon, i) => (
                  <button
                    key={i}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#FF9900]/20 hover:text-[#FF9900] flex items-center justify-center transition-all"
                    aria-label={`Social link ${i + 1}`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {footerLinks.map((col) => (
              <div key={col.title}>
                <h4 className="text-white font-bold text-sm mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm hover:text-[#FF9900] transition-colors duration-150"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs">© 2026 ShopEx Inc. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs">
              {[{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }, { label: "Cookies", href: "/cookies" }].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="hover:text-[#FF9900] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile bottom nav */}
      <MobileNav />
      {/* Spacer so content isn't hidden behind mobile nav */}
      <div className="h-16 md:hidden" />
    </main>
  );
}
