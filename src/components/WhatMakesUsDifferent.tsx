import { Check, X } from "lucide-react";

const WhatMakesUsDifferent = () => {
  const comparisons = [
    {
      category: "Testing Approach",
      we: "Hybrid testing that combines quantitative data with behavioral insights",
      they: "Basic A/B tests on surface-level elements like buttons and colors"
    },
    {
      category: "Strategy",
      we: "Deep-dive analysis to identify the biggest conversion opportunities",
      they: "Generic best practices applied without context"
    },
    {
      category: "Execution",
      we: "End-to-end test implementation with brand integrity maintained",
      they: "Quick fixes that often break user experience"
    },
    {
      category: "Traffic Respect",
      we: "Only test when there's a strong hypothesis and clear upside",
      they: "Run tests constantly without strategic thinking"
    },
    {
      category: "Results Focus",
      we: "Revenue and profit protection with measurable impact",
      they: "Vanity metrics that don't translate to business value"
    },
    {
      category: "Partnership",
      we: "Direct access to experts who think critically about your business",
      they: "Middlemen and junior resources managing your account"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              What Makes Us <span className="text-primary">Different</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Not just another CRO agency. We're your strategic growth partners.
            </p>
          </div>

          {/* Comparison Grid */}
          <div className="bg-white rounded-3xl shadow-lg border border-border overflow-hidden">
            {/* Desktop Header */}
            <div className="hidden lg:grid lg:grid-cols-3 bg-muted/50 border-b border-border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-muted-foreground text-center">
                  Category
                </h3>
              </div>
              <div className="p-6 border-l border-border bg-primary/5">
                <h3 className="text-lg font-semibold text-primary text-center flex items-center justify-center gap-2">
                  <Check className="h-5 w-5" />
                  WE (BedaBeda Growth)
                </h3>
              </div>
              <div className="p-6 border-l border-border bg-destructive/5">
                <h3 className="text-lg font-semibold text-destructive text-center flex items-center justify-center gap-2">
                  <X className="h-5 w-5" />
                  THEY (Everyone Else)
                </h3>
              </div>
            </div>

            {/* Comparison Rows */}
            <div className="divide-y divide-border">
              {comparisons.map((comparison, index) => (
                <div key={index} className="lg:grid lg:grid-cols-3">
                  {/* Mobile Layout */}
                  <div className="lg:hidden p-6 space-y-6">
                    <h4 className="text-lg font-semibold text-foreground text-center">
                      {comparison.category}
                    </h4>
                    
                    {/* Mobile WE Section */}
                    <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <h5 className="font-semibold text-primary">WE (BedaBeda Growth)</h5>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed overflow-x-auto">
                        {comparison.we}
                      </p>
                    </div>

                    {/* Mobile THEY Section */}
                    <div className="bg-destructive/5 rounded-xl p-4 border border-destructive/20">
                      <div className="flex items-center gap-2 mb-3">
                        <X className="h-5 w-5 text-destructive flex-shrink-0" />
                        <h5 className="font-semibold text-destructive">THEY (Everyone Else)</h5>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed overflow-x-auto">
                        {comparison.they}
                      </p>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:block p-6 bg-muted/20">
                    <h4 className="text-base font-semibold text-foreground text-center">
                      {comparison.category}
                    </h4>
                  </div>
                  
                  <div className="hidden lg:block p-6 border-l border-border bg-primary/5">
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {comparison.we}
                      </p>
                    </div>
                  </div>
                  
                  <div className="hidden lg:block p-6 border-l border-border bg-destructive/5">
                    <div className="flex items-start gap-3">
                      <X className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {comparison.they}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center pt-8">
            <p className="text-lg text-muted-foreground mb-6">
              Ready to work with a team that actually moves the needle?
            </p>
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-xl font-semibold transition-colors">
              Let's Talk Strategy
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatMakesUsDifferent;