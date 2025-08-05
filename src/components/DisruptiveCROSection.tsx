import { useState } from "react";
import { ChevronLeft, ChevronRight, Check, X, ArrowDown } from "lucide-react";

const DisruptiveCROSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  const comparisons = [
    {
      category: "Testing Approach",
      we: {
        title: "Hybrid Testing That Combines Quantitative Data with Behavioral Insights",
        points: [
          "Advanced heat mapping & user behavior analysis",
          "Statistical significance with behavioral context",
          "Qualitative research integrated with A/B testing",
          "User journey optimization across multiple touchpoints"
        ]
      },
      they: {
        title: "Basic A/B Tests on Surface-Level Elements Like Buttons and Colors",
        points: [
          "Simple color & button testing only",
          "No behavioral analysis or context",
          "Shallow metrics without user understanding",
          "Single-point optimization without journey view"
        ]
      }
    },
    {
      category: "Strategy Development",
      we: {
        title: "Deep-Dive Analysis to Identify the Biggest Conversion Opportunities",
        points: [
          "Comprehensive conversion audit & funnel analysis",
          "Data-driven hypothesis formation",
          "Strategic roadmap with priority ranking",
          "Custom solutions for unique business challenges"
        ]
      },
      they: {
        title: "Generic Best Practices Applied Without Context",
        points: [
          "Cookie-cutter approaches for all clients",
          "No custom analysis or research",
          "Generic recommendations without data backing",
          "One-size-fits-all solutions"
        ]
      }
    },
    {
      category: "Execution Excellence",
      we: {
        title: "End-to-End Test Implementation with Brand Integrity Maintained",
        points: [
          "Seamless technical implementation",
          "Brand guidelines strictly followed",
          "Quality assurance across all devices",
          "Performance optimization maintained"
        ]
      },
      they: {
        title: "Quick Fixes That Often Break User Experience",
        points: [
          "Rushed implementation without testing",
          "Brand inconsistencies introduced",
          "Mobile & device compatibility issues",
          "Performance degradation ignored"
        ]
      }
    }
  ];

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % comparisons.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + comparisons.length) % comparisons.length);
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6">
              Our Difference? <span className="text-primary">Data Deep-Dives</span> + 
              <br />Bespoke Conversion Strategy
            </h2>
            <p className="text-xl text-muted-foreground">
              Just call us your personal CRO concierge.
            </p>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:block space-y-16">
            {comparisons.map((comparison, index) => (
              <div key={index} className="relative">
                {/* Category Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    {comparison.category}
                  </h3>
                </div>

                {/* Comparison Layout */}
                <div className="grid grid-cols-12 gap-8 items-center">
                  {/* WE Section */}
                  <div className="col-span-5">
                    <div className="bg-primary/5 rounded-2xl p-8 border border-primary/20 relative">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <Check className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <h4 className="text-lg font-bold text-primary">WE</h4>
                      </div>
                      <h5 className="text-lg font-semibold text-foreground mb-4 leading-tight">
                        {comparison.we.title}
                      </h5>
                      <ul className="space-y-3">
                        {comparison.we.points.map((point, pointIndex) => (
                          <li key={pointIndex} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground leading-relaxed">
                              {point}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {/* Arrow pointing to center */}
                      <div className="absolute -right-4 top-1/2 transform -translate-y-1/2">
                        <div className="w-8 h-0.5 bg-primary"></div>
                        <div className="absolute -right-1 -top-1 w-3 h-3 border-r-2 border-t-2 border-primary transform rotate-45"></div>
                      </div>
                    </div>
                  </div>

                  {/* Center VS */}
                  <div className="col-span-2 flex justify-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center border-2 border-border">
                      <span className="text-lg font-bold text-muted-foreground">VS</span>
                    </div>
                  </div>

                  {/* THEY Section */}
                  <div className="col-span-5">
                    <div className="bg-destructive/5 rounded-2xl p-8 border border-destructive/20 relative">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-destructive rounded-full flex items-center justify-center">
                          <X className="h-6 w-6 text-destructive-foreground" />
                        </div>
                        <h4 className="text-lg font-bold text-destructive">THEY</h4>
                      </div>
                      <h5 className="text-lg font-semibold text-foreground mb-4 leading-tight">
                        {comparison.they.title}
                      </h5>
                      <ul className="space-y-3">
                        {comparison.they.points.map((point, pointIndex) => (
                          <li key={pointIndex} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground leading-relaxed">
                              {point}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {/* Arrow pointing to center */}
                      <div className="absolute -left-4 top-1/2 transform -translate-y-1/2">
                        <div className="w-8 h-0.5 bg-destructive"></div>
                        <div className="absolute -left-1 -top-1 w-3 h-3 border-l-2 border-t-2 border-destructive transform -rotate-45"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connecting Line to Next Section */}
                {index < comparisons.length - 1 && (
                  <div className="flex justify-center mt-12">
                    <ArrowDown className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Carousel */}
          <div className="lg:hidden">
            <div className="relative bg-white rounded-2xl shadow-lg border border-border overflow-hidden">
              {/* Mobile Header */}
              <div className="bg-muted/50 p-6 text-center border-b border-border">
                <h3 className="text-xl font-bold text-foreground">
                  {comparisons[activeSlide].category}
                </h3>
                <div className="flex justify-center mt-4 gap-2">
                  {comparisons.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === activeSlide ? 'bg-primary' : 'bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Mobile Content */}
              <div className="p-6 space-y-6">
                {/* WE Section */}
                <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Check className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <h4 className="text-lg font-bold text-primary">WE</h4>
                  </div>
                  <h5 className="text-base font-semibold text-foreground mb-3 leading-tight">
                    {comparisons[activeSlide].we.title}
                  </h5>
                  <ul className="space-y-2">
                    {comparisons[activeSlide].we.points.map((point, pointIndex) => (
                      <li key={pointIndex} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground leading-relaxed">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* VS Divider */}
                <div className="flex justify-center">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center border-2 border-border">
                    <span className="text-sm font-bold text-muted-foreground">VS</span>
                  </div>
                </div>

                {/* THEY Section */}
                <div className="bg-destructive/5 rounded-xl p-6 border border-destructive/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-destructive rounded-full flex items-center justify-center">
                      <X className="h-5 w-5 text-destructive-foreground" />
                    </div>
                    <h4 className="text-lg font-bold text-destructive">THEY</h4>
                  </div>
                  <h5 className="text-base font-semibold text-foreground mb-3 leading-tight">
                    {comparisons[activeSlide].they.title}
                  </h5>
                  <ul className="space-y-2">
                    {comparisons[activeSlide].they.points.map((point, pointIndex) => (
                      <li key={pointIndex} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-destructive rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground leading-relaxed">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Mobile Navigation */}
              <div className="flex justify-between items-center p-6 bg-muted/20 border-t border-border">
                <button
                  onClick={prevSlide}
                  className="p-2 rounded-full bg-background border border-border hover:bg-muted transition-colors"
                  disabled={activeSlide === 0}
                >
                  <ChevronLeft className={`h-5 w-5 ${activeSlide === 0 ? 'text-muted-foreground/50' : 'text-foreground'}`} />
                </button>
                
                <span className="text-sm text-muted-foreground">
                  {activeSlide + 1} of {comparisons.length}
                </span>
                
                <button
                  onClick={nextSlide}
                  className="p-2 rounded-full bg-background border border-border hover:bg-muted transition-colors"
                  disabled={activeSlide === comparisons.length - 1}
                >
                  <ChevronRight className={`h-5 w-5 ${activeSlide === comparisons.length - 1 ? 'text-muted-foreground/50' : 'text-foreground'}`} />
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