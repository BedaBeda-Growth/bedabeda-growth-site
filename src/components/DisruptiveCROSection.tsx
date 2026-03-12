import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DisruptiveCROSection = () => {
  const [activePage, setActivePage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setSvgDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

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
      title: "Build site perception & value",
      description: "Our process strengthens your site value, while driving real performance results."
    }
  ];

  const theyPoints = [
    {
      title: "Give your site a once-over",
      description: "Generic advice that doesn't account for your unique audience, industry, or business model."
    },
    {
      title: "Quickly exhaust their list of best practices",
      description: "Test ideas feel stale quickly, risky tests are rolled out, and important data-based considerations are missed."
    },
    {
      title: "Provide no long-term growth planning",
      description: "Lack of innovation and strategy means no long-term competitive thinking - just short-term tactics that create a patchwork site decreasing in value."
    }
  ];

  // Staggered positioning for boxes (pure pixel units for absolute precision)
  const weBoxPositions = [
    { top: 0, left: 0 },      // First box - highest, aligned left
    { top: 192, left: -50 },  // Second box - middle, staggered left
    { top: 384, left: 0 }     // Third box - lowest, aligned left
  ];

  const theyBoxPositions = [
    { top: 0, right: 0 },     // First box - same height as WE top, aligned right  
    { top: 192, right: -50 }, // Second box - same height as WE middle, staggered right
    { top: 384, right: 0 }    // Third box - same height as WE bottom, aligned right
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
              We believe: to optimize behavior, you must optimize perception.
            </p>
          </div>

          {/* Desktop Layout - Only on lg and above */}
          <div className="hidden lg:block">
            <div className="relative min-h-[600px]" ref={containerRef}>
              {/* Connection Lines rendered dynamically over container */}
              {svgDimensions.width > 0 && (
                <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%', zIndex: 0 }}>
                  {/* WE lines */}
                  {wePoints.map((_, index) => {
                    const boxTop = weBoxPositions[index].top;
                    const boxLeft = weBoxPositions[index].left;
                    const boxRightEdge = 375 + boxLeft;
                    const boxCenterY = boxTop + 90;

                    const containerWidth = svgDimensions.width;
                    const weCircleLeftEdge = (containerWidth / 2) - 8 - 180;
                    const weCircleCenterY = svgDimensions.height > 0 ? svgDimensions.height / 2 : 300;

                    const midX = (boxRightEdge + weCircleLeftEdge) / 2;
                    const d = `M ${boxRightEdge} ${boxCenterY} C ${midX} ${boxCenterY}, ${midX} ${weCircleCenterY}, ${weCircleLeftEdge} ${weCircleCenterY}`;

                    return (
                      <g key={`we-${index}`}>
                        <path 
                          d={d}
                          stroke="#92B5AF" 
                          strokeWidth="2" 
                          fill="none"
                          strokeDasharray="5,5"
                        />
                        <circle cx={boxRightEdge} cy={boxCenterY} r="4" fill="#92B5AF" />
                        <circle cx={weCircleLeftEdge} cy={weCircleCenterY} r="4" fill="#92B5AF" />
                      </g>
                    );
                  })}

                  {/* THEY lines */}
                  {theyPoints.map((_, index) => {
                    const boxTop = theyBoxPositions[index].top;
                    const boxRight = theyBoxPositions[index].right;
                    const containerWidth = svgDimensions.width;
                    const boxLeftEdge = containerWidth - 375 - boxRight;
                    const boxCenterY = boxTop + 90;

                    const theyCircleRightEdge = (containerWidth / 2) + 8 + 180;
                    const theyCircleCenterY = svgDimensions.height > 0 ? svgDimensions.height / 2 : 300;

                    const midX = (boxLeftEdge + theyCircleRightEdge) / 2;
                    const d = `M ${boxLeftEdge} ${boxCenterY} C ${midX} ${boxCenterY}, ${midX} ${theyCircleCenterY}, ${theyCircleRightEdge} ${theyCircleCenterY}`;

                    return (
                      <g key={`they-${index}`}>
                        <path 
                          d={d}
                          stroke="#666" 
                          strokeWidth="2" 
                          fill="none"
                          strokeDasharray="5,5"
                        />
                        <circle cx={boxLeftEdge} cy={boxCenterY} r="4" fill="#666" />
                        <circle cx={theyCircleRightEdge} cy={theyCircleCenterY} r="4" fill="#666" />
                      </g>
                    );
                  })}
                </svg>
              )}

              {/* WE Section - 3 separate boxes */}
              <div className="absolute left-0 w-[400px]">
                {wePoints.map((point, index) => (
                  <div 
                    key={index} 
                    className="absolute w-[375px]"
                    style={{ 
                      top: weBoxPositions[index].top,
                      left: weBoxPositions[index].left
                    }}
                  >
                    <div 
                      className="rounded-xl p-6 relative w-full h-[180px] mb-6 flex flex-col"
                      style={{ backgroundColor: '#EEFAF8' }}
                    >
                      <h4 className="text-lg font-bold mb-3" style={{ color: '#2E3242' }}>
                        {point.title}
                      </h4>
                      <p className="text-sm leading-relaxed flex-1 flex items-center" style={{ color: '#3D3D3D' }}>
                        {point.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Center Circles */}
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-4">
                {/* WE Circle */}
                <div 
                  className="rounded-full flex items-center justify-center relative"
                  style={{ 
                    backgroundColor: '#EEFAF8',
                    width: '180px',
                    height: '180px'
                  }}
                >
                  <span className="text-2xl font-bold" style={{ color: '#92B5AF' }}>WE</span>
                </div>
                
                {/* THEY Circle */}
                <div 
                  className="rounded-full flex items-center justify-center relative"
                  style={{ 
                    backgroundColor: '#2E3242',
                    width: '180px',
                    height: '180px'
                  }}
                >
                  <span className="text-2xl font-bold text-white">THEY</span>
                </div>
              </div>

              {/* THEY Section - 3 separate boxes */}
              <div className="absolute right-0 w-[400px]">
                {theyPoints.map((point, index) => (
                  <div 
                    key={index} 
                    className="absolute w-[375px]"
                    style={{ 
                      top: theyBoxPositions[index].top,
                      right: theyBoxPositions[index].right
                    }}
                  >
                    <div 
                      className="rounded-xl p-6 text-white relative w-full h-[180px] mb-6 flex flex-col"
                      style={{ backgroundColor: '#181B21' }}
                    >
                      <h4 className="text-lg font-bold mb-3 text-white">
                        {point.title}
                      </h4>
                      <p className="text-sm text-gray-300 leading-relaxed flex-1 flex items-center">
                        {point.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile & Tablet Slider */}
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
                      <div 
                        className="rounded-full flex items-center justify-center mx-auto mb-3"
                        style={{ 
                          backgroundColor: '#EEFAF8',
                          width: '64px',
                          height: '64px'
                        }}
                      >
                        <img src="/uploads/f71869bd-fed3-4bbd-a0cb-41a2ebce63be.png" alt="BBG Logo" className="w-8 h-8" />
                      </div>
                    </div>
                    {wePoints.map((point, index) => (
                      <div 
                        key={index} 
                        className="rounded-xl p-4"
                        style={{ backgroundColor: '#EEFAF8' }}
                      >
                        <h4 className="text-base font-bold mb-2" style={{ color: '#2E3242' }}>
                          {point.title}
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {point.description}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* THEY Page */
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div 
                        className="rounded-full flex items-center justify-center mx-auto mb-3 px-2"
                        style={{ 
                          backgroundColor: '#2E3242',
                          width: '80px',
                          height: '80px'
                        }}
                      >
                        <span className="text-xs font-bold text-center leading-tight text-white">Regular CRO Agencies</span>
                      </div>
                    </div>
                    {theyPoints.map((point, index) => (
                      <div 
                        key={index} 
                        className="rounded-xl p-4 text-white"
                        style={{ backgroundColor: '#181B21' }}
                      >
                        <h4 className="text-base font-bold mb-2 text-white">
                          {point.title}
                        </h4>
                        <p className="text-sm text-gray-300 leading-relaxed">
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
                  {activePage === 0 ? 'BedaBeda Growth' : 'Regular CRO Agencies'}
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