
import { Button } from "@/components/ui/button";
import heroIllustration from "@/assets/hero-cro-illustration.png";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-background">
      <div className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
                CRO for High-Growth,{" "}
                <span className="text-primary">Performance-Obsessed</span>{" "}
                Teams
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
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
            
            {/* Floating methodology labels */}
            <div className="absolute -top-2 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700 shadow-md border border-gray-200">
              Customer Research
            </div>
            <div className="absolute top-16 -left-8 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700 shadow-md border border-gray-200">
              Session Recordings
            </div>
            <div className="absolute top-8 -right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700 shadow-md border border-gray-200">
              Quantitative Data
            </div>
            <div className="absolute top-32 -right-12 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700 shadow-md border border-gray-200">
              Drop-off Points
            </div>
            <div className="absolute bottom-32 -left-6 bg-primary/10 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-primary shadow-md border border-primary/20">
              Strategy
            </div>
            <div className="absolute bottom-16 left-8 bg-primary/10 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-primary shadow-md border border-primary/20">
              Test Design
            </div>
            <div className="absolute bottom-4 -right-2 bg-primary/10 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-primary shadow-md border border-primary/20">
              Active Analysis
            </div>
            <div className="absolute bottom-20 right-12 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700 shadow-md border border-gray-200">
              Reporting
            </div>
            <div className="absolute top-24 left-16 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700 shadow-md border border-gray-200">
              Deep Research
            </div>
            <div className="absolute bottom-8 left-20 bg-primary/10 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-primary shadow-md border border-primary/20">
              Roadmapping
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
