
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import heroIllustration from "@/assets/hero-cro-illustration.png";

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
      <div className="container mx-auto px-6 pt-12 pb-0">
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
                We don't run shallow tests just to say we tested.<br />
                We design high-leverage, hybrid experiments that combine deep strategic insight with standout execution — so you get conversion lifts that actually last.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary-muted text-primary-foreground font-semibold px-8 py-4 rounded-xl transition-smooth hover-lift"
              >
                Book a Discovery Call
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-8 py-4 rounded-xl transition-smooth"
              >
                View Our Approach
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

          {/* Right Column - Visual with Labels */}
          <div className="relative">
            <div className="bg-secondary/20 rounded-2xl p-8 backdrop-blur-sm">
              <img 
                src={heroIllustration}
                alt="BedaBeda Growth CRO Methodology Illustration"
                className="w-full h-auto rounded-xl shadow-2xl hover-scale transition-smooth"
              />
            </div>
            
            {/* Floating methodology labels arranged in circle pattern */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 shadow-md border border-gray-200">
              Customer Research
            </div>
            <div className="absolute top-12 right-8 bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 shadow-md border border-gray-200">
              Session Recordings
            </div>
            <div className="absolute top-1/3 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium text-primary shadow-md border border-gray-200">
              Strategy
            </div>
            <div className="absolute top-1/2 right-8 bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 shadow-md border border-gray-200">
              Deep Research
            </div>
            <div className="absolute bottom-1/3 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium text-primary shadow-md border border-gray-200">
              Test Design
            </div>
            <div className="absolute bottom-12 right-8 bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 shadow-md border border-gray-200">
              Quantitative Data
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full text-sm font-medium text-primary shadow-md border border-gray-200">
              Active Analysis
            </div>
            <div className="absolute bottom-12 left-8 bg-white px-3 py-1 rounded-full text-sm font-medium text-primary shadow-md border border-gray-200">
              Roadmapping
            </div>
            <div className="absolute bottom-1/3 left-4 bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 shadow-md border border-gray-200">
              Drop-off Points
            </div>
            <div className="absolute top-1/2 left-8 bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 shadow-md border border-gray-200">
              Reporting
            </div>
            
            {/* Background floating elements for depth */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-secondary/30 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
