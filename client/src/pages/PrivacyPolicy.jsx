import { useState, useEffect } from "react";
import { Database,Cookie, ArrowUp, ArrowLeft } from "lucide-react";
import tokens from "../styles/tokens";
import Section from "../components/ui/Section.jsx";
import InfoBlock from "../components/ui/InfoBlock.jsx";
import LinkButton from "../components/ui/LinkButton.jsx";

const { color, font, radius, shadow } = tokens;

const pStyle = {
  fontSize: font.sizeLg,
  lineHeight: 1.7,
  color: color.textSecondary,
  textAlign: "left",
  margin: 0,
};

const ulStyle = {
  margin: 0,
  paddingLeft: 0,
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  fontSize: font.sizeLg,
  lineHeight: 1.7,
  color: color.textSecondary,
  textAlign: "left",
};

const COMPANY_NAME = "Auth App";
const CONTACT_EMAIL = "company@support.com";
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

export default function PrivacyPolicy({ navigate }) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ minHeight: "100vh", padding: "48px 24px" }}>
      <style>{`
        .pp-backtotop:hover { background: ${color.ctaHover ?? color.cta}; }
        .pp-mailto:hover { text-decoration: underline; }
        @media (min-width: 1024px) {
          .pp-layout { display: flex;}
        }
      `}</style>

      {/* Header */}
      <header style={{
        maxWidth: "1040px",
        margin: "0 auto 40px",
        borderBottom: `1px solid ${color.divider}`,
        paddingBottom: "32px",
      }}>
        <h1 style={{
          fontSize: "56px",
          fontWeight: font.weightSemibold,
          color: color.textPrimary,
          letterSpacing: "-0.3px",
          margin: 0,
        }}>
          Privacy Policy
        </h1>
        <p style={{ marginTop: "20px", marginBottom: "10px", fontSize: font.sizeSm, color: color.textMuted }}>
          Last updated date: {LAST_UPDATED}
        </p>
        <LinkButton onClick={() => navigate("login")}>← Back to sign in</LinkButton>
      </header>

      <div className="pp-layout" style={{ maxWidth: "1040px", margin: "0 auto" }}>

        <main style={{
          background: color.bgCard,
          borderRadius: radius.xl,
          border: `1px solid ${color.border}`,
          boxShadow: shadow.card,
          padding: "32px",
          gap: "40px",
        }}>

          {/* 1 */}
          <Section id="overview" title="1. Overview">
            <p style={pStyle}>
              At <strong style={{ color: color.textPrimary }}>{COMPANY_NAME}</strong>, we respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy outlines how we collect, use, safeguard, and disclose information when you visit or interact with our platform and services. By using our service, you agree to the collection and use of information in accordance with this policy. If you do not agree with this policy, please do not access or use our services.
            </p>
          </Section>

          {/* 2 */}
          <Section id="data-collected" title="2. Information We Collect" icon={<Database size={18} color={color.cta} />} divider>
            <p style={pStyle}>
              We collect information to provide better services and we gather: name, email, password hash, and password history hash when you register.
            </p>
          </Section>

          {/* 3 */}
          <Section id="data-usage" title="3. How We Use Your Data" divider>
            <p style={pStyle}>
              We use the collected information for various core operational purposes:
            </p>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "12px",
              marginTop: "8px",
            }}>
              <InfoBlock title="Account Maintenance" text="To maintain your account, authenticate logins, and monitor account activity." />
              <InfoBlock title="Secure Authentication" text="To enable MFA for secure user login and password change policy." />
            </div>
          </Section>

          {/* 4 */}
          <Section id="cookies" title="4. Cookies & Tracking" icon={<Cookie size={18} color={color.cta} />} divider>
            <p style={pStyle}>
              We use cookies to provide login session, and other necessary browsing helpers.
            </p>
          </Section>

          {/* 5 */}
          <Section id="third-parties" title="5. Third-Party Sharing" divider>
            <p style={pStyle}>
              We do not sell, exchange, or borrow your personal information to third parties.
            </p>
          </Section>

          {/* 6 */}
          <Section id="data-security" title="6. Data Security" divider>
            <p style={pStyle}>
              The security of your data is paramount. We implement industry-standard security measures such as encryption and multi-factor authentication to protect your personal information against unauthorized access. We retain personal data only for as long as necessary.
            </p>
          </Section>

          {/* 7 */}
          <Section id="your-rights" title="7. Your Privacy Rights" divider>
            <p style={pStyle}>
              Depending on your location (e.g., GDPR in Europe, CCPA in California), you have the following rights regarding your personal information:
            </p>
            <ul style={ulStyle}>
              <li>The right to access and receive a copy of your personal data.</li>
              <li>The right to rectify inaccurate or incomplete personal information.</li>
              <li>The right to request deletion ("Right to be forgotten").</li>
              <li>The right to restrict or object to the processing of your data.</li>
            </ul>
          </Section>
        </main>
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          className="pp-backtotop"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            background: color.cta,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: shadow.card,
            zIndex: 50,
            transition: "background 0.15s",
          }}
        >
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  );
}