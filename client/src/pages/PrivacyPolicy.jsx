import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  Database, 
  UserCheck, 
  Cookie, 
  Mail, 
  ChevronRight,
  ArrowUp
} from "lucide-react";

// Update these to match your company details
const COMPANY_NAME = "Acme Inc.";
const CONTACT_EMAIL = "privacy@acme.com";
const LAST_UPDATED = "July 27, 2026";

const SECTIONS = [
  { id: "overview", title: "1. Overview & Scope" },
  { id: "data-collected", title: "2. Information We Collect" },
  { id: "data-usage", title: "3. How We Use Your Data" },
  { id: "cookies", title: "4. Cookies & Tracking" },
  { id: "third-parties", title: "5. Third-Party Sharing" },
  { id: "data-security", title: "6. Security & Retention" },
  { id: "your-rights", title: "7. Your Privacy Rights" },
  { id: "contact", title: "8. Contact Us" },
];

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState("overview");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Handle active navigation item based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);

      const sectionElements = SECTIONS.map((sec) =>
        document.getElementById(sec.id)
      );

      const scrollPosition = window.scrollY + 200;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Container */}
      <header className="max-w-5xl mx-auto mb-10 text-center sm:text-left border-b border-slate-200 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-4 border border-blue-100">
          <ShieldCheck className="w-4 h-4" /> Legal & Transparency
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Effective date: {LAST_UPDATED}
        </p>
      </header>

      {/* Main Content Layout */}
      <div className="max-w-5xl mx-auto lg:grid lg:grid-cols-12 lg:gap-10">
        {/* Table of Contents - Sticky Sidebar */}
        <nav className="hidden lg:block lg:col-span-4">
          <div className="sticky top-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Table of Contents
            </h3>
            <ul className="space-y-2">
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors duration-150 flex items-center justify-between group ${
                      activeSection === section.id
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>{section.title}</span>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        activeSection === section.id
                          ? "text-blue-600 translate-x-1"
                          : "text-slate-300 group-hover:text-slate-400"
                      }`}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Policy Content Area */}
        <main className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-12">
          {/* Executive Summary Cards */}
          <div className="grid sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex flex-col items-center text-center p-3">
              <Lock className="w-6 h-6 text-blue-600 mb-2" />
              <h4 className="text-xs font-semibold text-slate-900">Encrypted Data</h4>
              <p className="text-xs text-slate-500 mt-1">
                Your credentials and personal details are always encrypted.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-3">
              <Eye className="w-6 h-6 text-blue-600 mb-2" />
              <h4 className="text-xs font-semibold text-slate-900">No Selling</h4>
              <p className="text-xs text-slate-500 mt-1">
                We do not sell your personal details to third-party brokers.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-3">
              <UserCheck className="w-6 h-6 text-blue-600 mb-2" />
              <h4 className="text-xs font-semibold text-slate-900">Your Control</h4>
              <p className="text-xs text-slate-500 mt-1">
                Export or request full deletion of your data at any time.
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <section id="overview" className="scroll-mt-8 space-y-3">
            <h2 className="text-xl font-bold text-slate-900">1. Overview & Scope</h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              At <strong>{COMPANY_NAME}</strong>, we respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy outlines how we collect, use, safeguard, and disclose information when you visit or interact with our platform and services.
            </p>
            <p className="text-slate-600 leading-relaxed text-sm">
              By using our service, you agree to the collection and use of information in accordance with this policy. If you do not agree with this policy, please do not access or use our services.
            </p>
          </section>

          {/* Section 2 */}
          <section id="data-collected" className="scroll-mt-8 space-y-3 border-t border-slate-100 pt-8">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">2. Information We Collect</h2>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm">
              We collect information to provide better services to all our users. The types of information we gather include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 text-sm pl-2">
              <li>
                <strong className="text-slate-800">Account Data:</strong> Name, email address, password hash, and profile settings when you register.
              </li>
              <li>
                <strong className="text-slate-800">Usage Data:</strong> Pages viewed, access times, IP address, device specs, and browser type.
              </li>
              <li>
                <strong className="text-slate-800">Payment Information:</strong> Billing addresses and payment card details processed through secure third-party payment gateways.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="data-usage" className="scroll-mt-8 space-y-3 border-t border-slate-100 pt-8">
            <h2 className="text-xl font-bold text-slate-900">3. How We Use Your Data</h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              We use the collected information for various core operational purposes:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-sm pt-2">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="font-semibold text-slate-900">Account Maintenance</span>
                <p className="text-xs text-slate-500 mt-1">To maintain your account, authenticate logins, and handle customer support requests.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="font-semibold text-slate-900">Service Improvement</span>
                <p className="text-xs text-slate-500 mt-1">To analyze usage patterns, fix bugs, and enhance user experience across devices.</p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section id="cookies" className="scroll-mt-8 space-y-3 border-t border-slate-100 pt-8">
            <div className="flex items-center gap-2">
              <Cookie className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">4. Cookies & Tracking</h2>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm">
              We use cookies and similar tracking technologies to track activity on our service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
            </p>
            <p className="text-slate-600 leading-relaxed text-sm">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some features of our service.
            </p>
          </section>

          {/* Section 5 */}
          <section id="third-parties" className="scroll-mt-8 space-y-3 border-t border-slate-100 pt-8">
            <h2 className="text-xl font-bold text-slate-900">5. Third-Party Sharing</h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              We do not sell, trade, or rent your personal identification information to third parties. We may share aggregated generic demographic information with our business partners and trusted affiliates for the purposes outlined above.
            </p>
            <p className="text-slate-600 leading-relaxed text-sm">
              We may employ third-party companies (e.g., analytics providers, payment processors, hosting partners) to facilitate our service, perform service-related operations, or assist us in analyzing usage.
            </p>
          </section>

          {/* Section 6 */}
          <section id="data-security" className="scroll-mt-8 space-y-3 border-t border-slate-100 pt-8">
            <h2 className="text-xl font-bold text-slate-900">6. Security & Data Retention</h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              The security of your data is paramount. We implement industry-standard security measures (such as TLS encryption) to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
            <p className="text-slate-600 leading-relaxed text-sm">
              We retain personal data only for as long as necessary to fulfill the purposes for which it was collected, including legal or reporting obligations.
            </p>
          </section>

          {/* Section 7 */}
          <section id="your-rights" className="scroll-mt-8 space-y-3 border-t border-slate-100 pt-8">
            <h2 className="text-xl font-bold text-slate-900">7. Your Privacy Rights</h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              Depending on your location (e.g., GDPR in Europe, CCPA in California), you may have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-600 text-sm pl-2">
              <li>The right to access and receive a copy of your personal data.</li>
              <li>The right to rectify inaccurate or incomplete personal information.</li>
              <li>The right to request deletion ("Right to be forgotten").</li>
              <li>The right to restrict or object to the processing of your data.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section id="contact" className="scroll-mt-8 space-y-4 border-t border-slate-100 pt-8">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">8. Contact Us</h2>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm">
              If you have any questions or concerns regarding this Privacy Policy or our data practices, please reach out to us:
            </p>
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl inline-block">
              <p className="text-xs font-semibold text-blue-900 uppercase tracking-wider">Privacy Team</p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-sm font-medium text-blue-600 hover:underline mt-1 inline-block"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
          </section>
        </main>
      </div>

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 p-3 bg-slate-900 text-white rounded-full shadow-lg hover:bg-slate-800 transition-all duration-200 z-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}