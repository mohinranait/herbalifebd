import Link from "next/link";
import FooterLogo from "./FooterLogo";
import { getAppSetting } from "@/lib/get-app-setting";
import { MapPin, Phone, Mail, ShieldCheck, Truck } from "lucide-react";

const FacebookIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const Footer = async () => {
  const appSetting = await getAppSetting();

  const {
    siteName = "শখের হাট",
    footerLogo,
    siteDescription,
    contactEmail,
    contactPhone,
    address,
    socialLinks,
  } = appSetting || {};

  const fullAddress = address
    ? [address.street, address.city, address.country].filter(Boolean).join(", ")
    : "মতিঝিল, ঢাকা-১০০০, বাংলাদেশ";

  return (
    <footer className="bg-slate-900 text-slate-300 pt-10 md:pt-14 pb-8 rounded-t-2xl md:rounded-none border-t border-slate-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Column 1: Brand & Contact Info */}
          <div className="space-y-4">
            <FooterLogo logo={footerLogo} siteName={siteName} />
            {siteDescription ? (
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                {siteDescription}
              </p>
            ) : (
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                আপনার পছন্দের সেরা পণ্যসমূহ সাশ্রয়ী মূল্যে ক্যাশ অন ডেলিভারিতে ঘরে বসে কিনুন।
              </p>
            )}

            <div className="space-y-2.5 pt-2 text-xs md:text-sm text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{fullAddress}</span>
              </div>
              {contactPhone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>{contactPhone}</span>
                </div>
              )}
              {contactEmail && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>{contactEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Company Links */}
          <div>
            <h4 className="text-[#00bba6] font-bold text-base md:text-lg mb-4 tracking-tight">
              কোম্পানি
            </h4>
            <ul className="space-y-2.5 text-xs md:text-sm">
              <li>
                <Link href="/" className="hover:text-orange-400 transition-colors">
                  হোম
                </Link>
              </li>
              <li>
                <Link href="/about-us" className="hover:text-orange-400 transition-colors">
                  আমাদের সম্পর্কে
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-orange-400 transition-colors">
                  প্রাইভেসি পলিসি
                </Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="hover:text-orange-400 transition-colors">
                  শর্তাবলী ও নিয়মাবলী
                </Link>
              </li>
              <li>
                <Link href="/shipping-and-delivery" className="hover:text-orange-400 transition-colors">
                  ডেলিভারি ও রিটার্ন পলিসি
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Help & Support */}
          <div>
            <h4 className="text-[#00bba6] font-bold text-base md:text-lg mb-4 tracking-tight">
              হেল্প ও সাপোর্ট
            </h4>
            <ul className="space-y-2.5 text-xs md:text-sm">
              <li>
                <Link href="/contact-us" className="hover:text-orange-400 transition-colors">
                  যোগাযোগ করুন
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="hover:text-orange-400 transition-colors">
                  প্রশ্ন ও উত্তর (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-orange-400 transition-colors">
                  সকল প্রডাক্ট
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-orange-400 transition-colors">
                  হট অফার
                </Link>
              </li>
              <li>
                <Link href="/brands" className="hover:text-orange-400 transition-colors">
                  আমাদের ব্র্যান্ডসমূহ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Social Links & Payment */}
          <div className="space-y-5">
            <div>
              <h4 className="text-white font-bold text-base mb-3">
                সোশ্যাল লিংক
              </h4>
              <div className="flex items-center gap-3">
                <a
                  href={socialLinks?.facebook || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-orange-500 text-white flex items-center justify-center transition-colors shadow-xs"
                >
                  <FacebookIcon />
                </a>
                <a
                  href={socialLinks?.youtube || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-orange-500 text-white flex items-center justify-center transition-colors shadow-xs"
                >
                  <YoutubeIcon />
                </a>
                <a
                  href={socialLinks?.instagram || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-orange-500 text-white flex items-center justify-center transition-colors shadow-xs"
                >
                  <InstagramIcon />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold text-base mb-3">
                পেমেন্ট মেথড
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-200">
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ক্যাশ অন ডেলিভারি</span>
                </div>
                <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-pink-400">
                  বিকাশ (bKash)
                </div>
                <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-orange-400">
                  নগদ (Nagad)
                </div>
                <div className="flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-blue-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>নিরাপদ পেমেন্ট</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-slate-800 mt-10 pt-6 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            স্বত্ব © {new Date().getFullYear()} {siteName} কর্তৃক সর্বস্বত্ব সংরক্ষিত।
          </p>
          <p className="text-slate-500 text-[11px]">
            Ecommerce Solution • Powered by Next.js
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
