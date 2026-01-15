import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConversionBlock from "@/components/ConversionBlock";
import ClientLogos from "@/components/ClientLogos";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Services = () => {
  const consultingBenefits = [
    "Conversion & growth strategy advisorship",
    "Acquisition-informed CRO guidance",
    "Offer, positioning, and funnel strategy",
    "Experimentation frameworks & test prioritization",
    "Ongoing strategic support for complex setups",
    "Strategic clarity without long-term lock-ins"
  ];

  const expertiseAreas = [
    {
      title: "Data & Analytics",
      description: "We scrutinize your heatmaps, scroll maps, and behavioral data to identify problems, opportunities, and successes. Every decision is informed, every prioritization is efficient.",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="12" y="40" width="8" height="16" fill="currentColor"/>
          <rect x="28" y="28" width="8" height="28" fill="currentColor"/>
          <rect x="44" y="16" width="8" height="40" fill="currentColor"/>
          <path d="M16 36L32 24L48 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      title: "User Experience",
      description: "We put ourselves in users' shoes through usability testing, customer polls, surveys, and interviews. Keeping things clean, value-based, and easy to follow.",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="24" r="12" stroke="currentColor" strokeWidth="3" fill="none"/>
          <path d="M18 52C18 44.268 24.268 38 32 38C39.732 38 46 44.268 46 52" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="28" cy="22" r="2" fill="currentColor"/>
          <circle cx="36" cy="22" r="2" fill="currentColor"/>
          <path d="M27 28C27 28 29 31 32 31C35 31 37 28 37 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      title: "Holistic Understanding",
      description: "We understand what works for the business and what matters to the customer. We connect acquisition, conversion, and retention into growth systems that compound.",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="8" fill="currentColor"/>
          <circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="48" cy="16" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="16" cy="48" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="48" cy="48" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
          <line x1="26" y1="26" x2="20" y2="20" stroke="currentColor" strokeWidth="2"/>
          <line x1="38" y1="26" x2="44" y2="20" stroke="currentColor" strokeWidth="2"/>
          <line x1="26" y1="38" x2="20" y2="44" stroke="currentColor" strokeWidth="2"/>
          <line x1="38" y1="38" x2="44" y2="44" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 lg:py-28 bg-background">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
                CRO Solutions That Turn Data Into{" "}
                <span className="text-primary">Growth Roadmaps</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                From deep audits to full-service optimization, we offer flexible engagement models designed to meet you where you are and take you where you need to go. We take a growth marketing approach to traditional CRO.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  size="lg"
                  className="bg-primary hover:bg-primary-muted text-primary-foreground font-semibold px-8 py-4 rounded-lg transition-smooth"
                  asChild
                >
                  <a href="https://calendly.com/kanika-misra" target="_blank" rel="noopener noreferrer">
                    Book a Discovery Call
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Full Service Disruptive CRO */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-start">
                <div className="space-y-6">
                  <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: '#EEFAF8', color: '#2E3242' }}>
                    Our Flagship Service
                  </span>
                  <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                    Full Service Disruptive™ CRO
                  </h2>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    We partner with 8-9 figure brands and Series A+ companies to predict, achieve, and accelerate growth. This isn't about changing button colors. It's about full-funnel optimization across your entire customer journey.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Dropping acquisition costs and increasing conversion rates equals sustainable scaling. We take a growth marketing approach to traditional CRO, integrating emotion mapping, user psychology, and data-backed experimentation to create a compound effect over time.
                  </p>
                  <div className="pt-4">
                    <h3 className="font-bold text-foreground mb-4">What's Included:</h3>
                    <ul className="space-y-3">
                      {[
                        "Custom high-performance landing pages built for conversion",
                        "Sitewide testing: copywriting, UX design, and development",
                        "Full-funnel optimization including upsells, cross-sells, and pricing",
                        "AOV and LTV optimization strategies",
                        "Homepage to checkout journey optimization",
                        "Continuous testing programs with statistically-backed methods"
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-700">
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div 
                  className="rounded-2xl p-8 lg:p-10 h-full"
                  style={{ backgroundColor: '#181B21' }}
                >
                  <h3 className="text-xl font-bold text-white mb-6">
                    2X to 3X Your Revenue From the Same Clicks
                  </h3>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    Imagine if you could double or triple your revenue without spending a cent more on traffic. Through our data-driven process, we identify exactly where your conversion leaks are and how to fix them.
                  </p>
                  <p className="text-gray-300 leading-relaxed mb-8">
                    As you get more traffic, the ROI you generate is amplified. We eliminate false positives with statistically-backed methods to accurately assess every test.
                  </p>
                  <div className="border-t border-gray-700 pt-6">
                    <p className="text-gray-400 text-sm italic mb-6">
                      "No one can guarantee that every test will win. Often, the biggest learnings are from losing tests. We use that insight to fuel future hypotheses and get a compound effect over time."
                    </p>
                    <Button 
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      asChild
                    >
                      <a href="https://calendly.com/kanika-misra" target="_blank" rel="noopener noreferrer">
                        Start Scaling <ArrowRight className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Landing Page Optimization */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-start">
                <div 
                  className="rounded-2xl p-8 lg:p-10 order-2 lg:order-1"
                  style={{ backgroundColor: '#EEFAF8' }}
                >
                  <h3 className="text-xl font-bold text-foreground mb-6">
                    We Are the Watson to Your Sherlock Holmes
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    Need research-backed dedicated pages with strategic UX design and custom development? We create customer-focused landing pages, strategizing, writing, designing, building, and testing to ensure they deliver results.
                  </p>
                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Conversion-centered design principles</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Message-match optimization for ad campaigns</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Rigorous A/B testing and iteration</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Regular reporting with actionable insights</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm italic">
                    The insights we uncover can be used across your entire organization, not just your landing pages.
                  </p>
                </div>
                <div className="space-y-6 order-1 lg:order-2">
                  <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-gray-200 text-gray-700">
                    Maximize Campaign ROI
                  </span>
                  <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                    Landing Page Optimization
                  </h2>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    High-impact, conversion-focused landing pages designed to maximize your campaign performance and acquisition efficiency. Every page is built on research, psychology, and proven conversion principles.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Looking to boost marketing efficiency and conversion rates? We take the guesswork out of landing page performance and replace it with systematic optimization based on real user behavior and data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Deep Data Audits */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-start">
                <div className="space-y-6">
                  <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-gray-200 text-gray-700">
                    Beyond Surface-Level Fixes
                  </span>
                  <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                    Deep Data Audits & Testing Roadmaps
                  </h2>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    This isn't about superficial bug fixes. Every successful optimization campaign begins with a comprehensive, in-depth audit that covers every facet of your business and user experience.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    We go beyond surface-level issues to address user experience barriers and the underlying motivations that drive (or prevent) conversions. We scrutinize quantitative and qualitative data to eliminate what doesn't work and double down on what does.
                  </p>
                </div>
                <div 
                  className="rounded-2xl p-8 lg:p-10"
                  style={{ backgroundColor: '#181B21' }}
                >
                  <h3 className="text-xl font-bold text-white mb-6">
                    What You Get:
                  </h3>
                  <ul className="space-y-4 mb-8">
                    {[
                      "Comprehensive analytics audit",
                      "Heuristic reviews of key pages and flows",
                      "Review mining and customer research",
                      "Heatmap and session recording analysis",
                      "60+ page full report with findings",
                      "15-20 prioritized test recommendations",
                      "1-hour video call review of findings"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    asChild
                  >
                    <a href="https://calendly.com/kanika-misra" target="_blank" rel="noopener noreferrer">
                      Get Your Audit <ArrowRight className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Consulting & Advisorship */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-start">
                <div className="space-y-8">
                  <div>
                    <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4" style={{ backgroundColor: '#EEFAF8', color: '#2E3242' }}>
                      Strategic Partnership
                    </span>
                    <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-6">
                      Consulting & Advisorship
                    </h2>
                    <div className="space-y-4 text-gray-600 leading-relaxed">
                      <p>
                        Gone are the days of fragmented advice, surface-level audits, and strategy that looks good on slides but falls apart in execution. You don't need more opinions. You need clear judgment, decisive direction, and an experienced partner who understands growth, acquisition, and conversion as a connected system.
                      </p>
                      <p>
                        Our senior team works alongside founders and internal teams to bring clarity, momentum, and confidence to high-stakes decisions.
                      </p>
                    </div>
                  </div>
                </div>

                <div 
                  className="rounded-2xl p-8 lg:p-10"
                  style={{ backgroundColor: '#181B21' }}
                >
                  <h3 className="text-xl font-bold text-white mb-6">
                    What's Included
                  </h3>
                  <ul className="space-y-4">
                    {consultingBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 leading-relaxed">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 pt-6 border-t border-gray-700">
                    <p className="text-gray-400 text-sm italic">
                      No generic playbooks. No performative deliverables. Just thoughtful, hands-on guidance rooted in real execution and accountability.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Expertise Areas */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-4">
                  Our Expertise
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Three pillars that power every engagement we take on.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {expertiseAreas.map((area, index) => (
                  <div 
                    key={index}
                    className="bg-white rounded-2xl p-8 text-center border border-gray-200"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#EEFAF8', color: '#2E3242' }}>
                      {area.icon}
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-3">
                      {area.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {area.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <ClientLogos />

        {/* CTA Section */}
        <ConversionBlock />
      </main>
      <Footer />
    </div>
  );
};

export default Services;