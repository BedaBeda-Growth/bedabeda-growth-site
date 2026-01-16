import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-500 mb-12">Effective Date: May 29, 2025</p>

            <div className="prose prose-gray max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">1. Who We Are</h2>
                <p className="text-gray-600 leading-relaxed">
                  This website is operated by <strong>Beda Beda Growth</strong>, a strategic marketing and conversion rate optimization agency. Our website address is: <a href="https://bedabedagrowth.com" className="text-primary hover:underline">https://bedabedagrowth.com</a>.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">2. Information We Collect</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We collect and process personal information in the following situations:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li><strong>Contact Forms:</strong> If you reach out to us via a contact form, we collect the information you provide (such as name, email, and message).</li>
                  <li><strong>Comments:</strong> If enabled, when visitors leave comments on the site, we collect the data shown in the comments form, the visitor's IP address, and browser user agent string to help with spam detection.</li>
                  <li><strong>Cookies & Tracking Technologies:</strong> See Section 4 below.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">3. How We Use Your Information</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We may use your information to:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Respond to inquiries or customer service requests</li>
                  <li>Improve website functionality and content</li>
                  <li>Prevent spam or abuse</li>
                  <li>Deliver marketing communications (see Section 6 below)</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-4">
                  We do not sell or rent your personal data.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">4. Cookies and Tracking</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We use cookies and similar technologies to improve your browsing experience and track aggregated website usage.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  When you visit or log in to our website, cookies and similar technologies may be used by our online data partners or vendors to associate these activities with other personal information they or others have about you, including by association with your email address. We (or service providers on our behalf) may then send marketing and other communications to those email addresses.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  👉 You may opt out of receiving this targeted advertising by visiting: <a href="https://app.retention.com/optout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://app.retention.com/optout</a>
                </p>
                <p className="text-gray-600 leading-relaxed">
                  You can also manage or disable cookies in your browser settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">5. Embedded Content from Other Websites</h2>
                <p className="text-gray-600 leading-relaxed">
                  Articles on this site may include embedded content (e.g. videos, images, articles, etc.). Embedded content from other websites behaves exactly as if you visited the other website. These sites may collect data about you, use cookies, and track your interaction with that content.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">6. Who We Share Your Data With</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We do not sell your data. We may share limited data with:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Analytics providers (e.g., Google Analytics)</li>
                  <li>Marketing vendors (e.g., email service providers, retargeting platforms)</li>
                  <li>Spam detection services (e.g., Akismet or similar)</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-4">
                  All vendors are required to process your data securely and in accordance with applicable privacy laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">7. How Long We Retain Your Data</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  If you leave a comment, the comment and its metadata are retained indefinitely. If you submit a contact form, the data may be stored for as long as necessary to fulfill your request or for historical reference.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Registered users (if any) can access and modify their personal data at any time.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">8. Your Rights</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Request access to the personal data we hold about you</li>
                  <li>Request correction or deletion of your data</li>
                  <li>Withdraw consent or object to processing</li>
                  <li>Request data portability (where applicable)</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-4">
                  To exercise these rights, contact us at: <a href="mailto:team@desi-derata.com" className="text-primary hover:underline">team@desi-derata.com</a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">9. Where Your Data Is Sent</h2>
                <p className="text-gray-600 leading-relaxed">
                  Your data may be stored or processed by third-party vendors or services in the United States or other jurisdictions with appropriate safeguards in place.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">10. Contact Information</h2>
                <p className="text-gray-600 leading-relaxed">
                  For questions about this Privacy Policy, you can reach us at: <a href="mailto:team@desi-derata.com" className="text-primary hover:underline">team@desi-derata.com</a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">11. Updates to This Policy</h2>
                <p className="text-gray-600 leading-relaxed">
                  We may update this Privacy Policy from time to time. Changes will be posted on this page with a revised effective date.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
