
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import CROMethodologyDiagram from "./CROMethodologyDiagram";

const Hero = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://widget.clutch.co/static/js/widget.js';
    script.async = true;
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-background">
      <div className="container mx-auto px-6 pt-20 pb-0">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
                CRO for High-Growth,{" "}
                <span className="text-primary">Performance-Obsessed</span>{" "}
                Teams
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl text-left">
                We don't run shallow tests just to say we tested.
                <br />
                We design <strong>high-leverage, hybrid experiments that combine deep strategic insight with standout execution</strong> – so you get conversion lifts that actually last.
                <br />
                Our approach blends data-backed analysis, creative experimentation, and a sharp eye on long-term upside.
                <br />
                No fluff. No wasted traffic. Just smarter testing that compounds.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary-muted text-primary-foreground font-semibold px-8 py-4 rounded-xl transition-smooth hover-lift"
                asChild
              >
                <a href="https://calendly.com/kanika-misra" target="_blank" rel="noopener noreferrer">
                  Book a Discovery Call
                </a>
              </Button>
            </div>

            {/* Clutch Widget */}
            <div className="mt-6 flex justify-center sm:justify-start">
              <div 
                className="clutch-widget" 
                data-url="https://widget.clutch.co" 
                data-widget-type="14" 
                data-height="50" 
                data-nofollow="true" 
                data-expandifr="true" 
                data-clutchcompany-id="1896447"
              ></div>
            </div>
          </div>

          {/* Right Column - CRO Methodology Diagram */}
          <div className="relative flex items-center justify-center min-h-[500px]">
            <CROMethodologyDiagram />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
