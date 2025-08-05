import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DisruptiveCROSection = () => {
  const [activePage, setActivePage] = useState(0);

  const wePoints = [
    {
      title: "Craft a completely custom user journey",
      description: "Every design choice is intentional and based on your specific user data and business goals."
    },
    {
      title: "Test, analyze, iterate & win",
      description: "We use a systematic approach to continuously improve your conversion rates through data-driven testing."
    },
    {
      title: "Deep-dive into all things 'your brand'",
      description: "We take time to understand your brand, audience, and unique value proposition before making recommendations."
    }
  ];

  const theyPoints = [
    {
      title: "Give your brand a once-over",
      description: "Quick surface-level analysis without deep understanding of your specific business needs."
    },
    {
      title: "Make one-size-fits-all recommendations",
      description: "Generic advice that doesn't account for your unique audience, industry, or business model."
    },
    {
      title: "Quickly exhaust their list of best practices",
      description: "Limited toolkit of standard practices without custom strategy or innovation."
    }
  ];

  const nextPage = () => {
    setActivePage((prev) => (prev + 1) % 2);
  };

  const prevPage = () => {
    setActivePage((prev) => (prev - 1 + 2) % 2);
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Our Difference?
            </h2>
            <h3 className="text-2xl lg:text-3xl font-semibold text-foreground">
              <span className="text-primary">Data Deep-Dives</span> + Bespoke Conversion Strategy
            </h3>
            {/* Aqua divider line */}
            <div className="w-24 h-0.5 bg-primary mx-auto"></div>
            <p className="text-lg text-muted-foreground mt-4">
              Just call us your personal CRO concierge.
            </p>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-12 gap-8 items-start">
              {/* WE Section */}
              <div className="col-span-5 space-y-6">
                {wePoints.map((point, index) => (
                  <div key={index} className="relative">
                    <div className="bg-black rounded-2xl p-6 text-white relative">
                      <h4 className="text-lg font-bold mb-3 text-white">
                        {point.title}
                      </h4>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {point.description}
                      </p>
                      {/* Dashed line to center */}
                      <div className="absolute -right-6 top-1/2 transform -translate-y-1/2">
                        <div className="w-12 h-0.5 border-t-2 border-dashed border-gray-400"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Center Node */}
              <div className="col-span-2 flex justify-center">
                <div className="sticky top-1/2">
                  <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-white">WE</span>
                  </div>
                </div>
              </div>

              {/* THEY Section */}
              <div className="col-span-5 space-y-6">
                {theyPoints.map((point, index) => (
                  <div key={index} className="relative">
                    <div className="bg-green-50 rounded-2xl p-6 border border-green-100 relative">
                      <h4 className="text-lg font-bold mb-3 text-gray-900">
                        {point.title}
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {point.description}
                      </p>
                      {/* Dashed line to center */}
                      <div className="absolute -left-6 top-1/2 transform -translate-y-1/2">
                        <div className="w-12 h-0.5 border-t-2 border-dashed border-gray-400"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Slider */}
          <div className="lg:hidden">
            <div className="relative bg-white rounded-2xl shadow-lg border border-border overflow-hidden">
              {/* Page Indicators */}
              <div className="bg-muted/50 p-4 text-center border-b border-border">
                <div className="flex justify-center gap-2">
                  <div className={`w-3 h-3 rounded-full transition-colors ${activePage === 0 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                  <div className={`w-3 h-3 rounded-full transition-colors ${activePage === 1 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                </div>
              </div>

              {/* Mobile Content */}
              <div className="p-6">
                {activePage === 0 ? (
                  /* WE Page */
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-white bg-black rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                        WE
                      </h3>
                    </div>
                    {wePoints.map((point, index) => (
                      <div key={index} className="bg-black rounded-xl p-4 text-white">
                        <h4 className="text-base font-bold mb-2 text-white">
                          {point.title}
                        </h4>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {point.description}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* THEY Page */
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 border border-green-200">
                        THEY
                      </h3>
                    </div>
                    {theyPoints.map((point, index) => (
                      <div key={index} className="bg-green-50 rounded-xl p-4 border border-green-100">
                        <h4 className="text-base font-bold mb-2 text-gray-900">
                          {point.title}
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {point.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Navigation */}
              <div className="flex justify-between items-center p-6 bg-muted/20 border-t border-border">
                <button
                  onClick={prevPage}
                  className="p-2 rounded-full bg-background border border-border hover:bg-muted transition-colors"
                  disabled={activePage === 0}
                >
                  <ChevronLeft className={`h-5 w-5 ${activePage === 0 ? 'text-muted-foreground/50' : 'text-foreground'}`} />
                </button>
                
                <span className="text-sm text-muted-foreground">
                  {activePage === 0 ? 'WE' : 'THEY'}
                </span>
                
                <button
                  onClick={nextPage}
                  className="p-2 rounded-full bg-background border border-border hover:bg-muted transition-colors"
                  disabled={activePage === 1}
                >
                  <ChevronRight className={`h-5 w-5 ${activePage === 1 ? 'text-muted-foreground/50' : 'text-foreground'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DisruptiveCROSection;