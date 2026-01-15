import { BarChart3, Play, Zap, PenTool, Split, Palette, TrendingUp, Brain, Book } from "lucide-react";

const CROMethodologyDiagram = () => {
  const methodologies = [
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      position: "top-4 left-1/2 transform -translate-x-1/2",
      delay: "0s"
    },
    {
      icon: Palette,
      title: "UI/UX Design", 
      position: "top-16 right-2",
      delay: "0.2s"
    },
    {
      icon: Brain,
      title: "User Psychology",
      position: "top-1/2 right-2 transform -translate-y-1/2",
      delay: "0.3s"
    },
    {
      icon: Split,
      title: "A/B Testing",
      position: "bottom-16 right-2", 
      delay: "0.4s"
    },
    {
      icon: PenTool,
      title: "Persuasive Copy",
      position: "bottom-4 left-1/2 transform -translate-x-1/2",
      delay: "0.6s"
    },
    {
      icon: Zap,
      title: "Heat Mapping",
      position: "bottom-16 left-2",
      delay: "0.8s"
    },
    {
      icon: Book,
      title: "Brand Positioning",
      position: "top-1/2 left-2 transform -translate-y-1/2",
      delay: "0.9s"
    },
    {
      icon: Play,
      title: "Session Recordings",
      position: "top-16 left-2",
      delay: "1s"
    }
  ];

  return (
    <>
      {/* Desktop View - Only on lg and above */}
      <div className="hidden lg:block relative w-full max-w-lg mx-auto aspect-square">
        {/* Central hub */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full border-2 border-primary/30 backdrop-blur-sm flex items-center justify-center animate-pulse">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-muted rounded-full flex items-center justify-center shadow-xl">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Connecting lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
          <g className="opacity-30">
            {methodologies.map((_, index) => {
              const angle = (index * 45) * (Math.PI / 180);
              const radius = index % 2 === 0 ? 120 : 140;
              const startX = 200;
              const startY = 200;
              const endX = 200 + Math.cos(angle) * radius;
              const endY = 200 + Math.sin(angle) * radius;
              
              return (
                <line
                  key={index}
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  className="text-primary animate-pulse"
                  style={{
                    animationDelay: `${index * 0.2}s`,
                    animationDuration: "2s"
                  }}
                />
              );
            })}
          </g>
        </svg>

        {/* Methodology cards */}
        {methodologies.map((method, index) => {
          const IconComponent = method.icon;
          return (
            <div
              key={index}
              className={`absolute ${method.position} group cursor-pointer`}
              style={{
                animation: `fade-in 0.8s ease-out ${method.delay} both, hover-scale 0.3s ease-out`
              }}
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-gray-200/50 hover:shadow-2xl hover:scale-110 transition-all duration-300 min-w-[120px] text-center group-hover:bg-white">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center group-hover:from-primary/20 group-hover:to-secondary/20 transition-all duration-300">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground leading-tight">
                    {method.title}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Floating background elements */}
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-br from-secondary/5 to-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-4 right-12 w-16 h-16 bg-primary/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: "0.5s" }}></div>
      </div>

      {/* Mobile & Tablet View */}
      <div className="lg:hidden w-full max-w-sm mx-auto">
        {/* Central hub with headline for mobile */}
        <div className="flex items-center justify-center mb-8 gap-4">
          <h3 className="text-2xl font-bold text-foreground">Our</h3>
          <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full border-2 border-primary/30 backdrop-blur-sm flex items-center justify-center animate-pulse">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-muted rounded-full flex items-center justify-center shadow-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-foreground">Toolkit</h3>
        </div>

        {/* Mobile methodology grid */}
        <div className="grid grid-cols-2 gap-4">
          {methodologies.map((method, index) => {
            const IconComponent = method.icon;
            return (
              <div
                key={index}
                className="group cursor-pointer"
                style={{
                  animation: `fade-in 0.8s ease-out ${method.delay} both`
                }}
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-gray-200/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 text-center group-hover:bg-white">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center group-hover:from-primary/20 group-hover:to-secondary/20 transition-all duration-300">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs font-semibold text-foreground leading-tight">
                      {method.title}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile background elements */}
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-secondary/5 to-primary/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>
    </>
  );
};

export default CROMethodologyDiagram;