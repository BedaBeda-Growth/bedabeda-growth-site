import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConversionBlock from "@/components/ConversionBlock";
import ClientLogos from "@/components/ClientLogos";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const Services = () => {
  const coreServices = [
    {
      title: "Sitewide CRO",
      description: "Full-funnel optimization across your entire customer journey. We identify friction points, test hypotheses, and systematically improve conversion at every touchpoint.",
      features: ["Homepage to checkout optimization", "User journey analysis", "Continuous testing programs"]
    },
    {
      title: "Landing Page Optimization",
      description: "High-impact, conversion-focused landing pages designed to maximize your campaign performance and acquisition efficiency.",
      features: ["Conversion-centered design", "Message-match optimization", "A/B testing & iteration"]
    },
    {
      title: "Deep Data Audits",
      description: "Comprehensive analysis of your analytics, user behavior, and conversion data to uncover hidden opportunities and prioritize high-leverage improvements.",
      features: ["Analytics deep-dive", "Heatmap & session analysis", "Actionable recommendations"]
    }
  ];

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
      title: "Data-Driven Insights",
      description: "We don't guess. Every recommendation is backed by rigorous analysis of your quantitative and qualitative data.",
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
      title: "UX & Psychology",
      description: "Understanding user behavior and motivation is at the heart of what we do. We design experiences that resonate.",
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
      title: "Holistic Strategy",
      description: "We connect the dots between acquisition, conversion, and retention to build growth systems that compound.",
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
                From deep audits to full-service optimization, we offer flexible engagement models designed to meet you where you are — and take you where you need to go.
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

        {/* Core Services */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-4">
                  Core Services
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Strategic CRO solutions built on psychology, data, and proven experimentation frameworks.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {coreServices.map((service, index) => (
                  <div 
                    key={index}
                    className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-smooth"
                  >
                    <h3 className="text-xl font-bold text-foreground mb-4">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    <ul className="space-y-3">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-sm text-gray-700">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Consulting & Advisorship - Featured Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-start">
                {/* Left: Content */}
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
                        Gone are the days of fragmented advice, surface-level audits, and strategy that looks good on slides but falls apart in execution. You don't need more opinions — you need clear judgment, decisive direction, and an experienced partner who understands growth, acquisition, and conversion as a connected system.
                      </p>
                      <p>
                        Our senior team works alongside founders and internal teams to bring clarity, momentum, and confidence to high-stakes decisions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Benefits Card */}
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
