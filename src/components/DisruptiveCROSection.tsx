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

  // Staggered positioning for boxes (in rem units for responsiveness)
  const weBoxPositions = [
    { top: '0rem', left: '0px' },      // First box - highest, aligned left
    { top: '12rem', left: '-50px' },   // Second box - middle, staggered left
    { top: '24rem', left: '0px' }      // Third box - lowest, aligned left
  ];

  const theyBoxPositions = [
    { top: '0rem', right: '0px' },     // First box - same height as WE top, aligned right  
    { top: '12rem', right: '-50px' },  // Second box - same height as WE middle, staggered right
    { top: '24rem', right: '0px' }     // Third box - same height as WE bottom, aligned right
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

          {/* Desktop & Tablet Layout */}
          <div className="hidden md:block">
            <div className="relative min-h-[600px]">
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

              {/* Center Circles */}
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-4">
                {/* WE Circle */}
                <div 
                  className="rounded-full flex items-center justify-center relative"
                  style={{ 
                    backgroundColor: '#2E3242',
                    width: '180px',
                    height: '180px'
                  }}
                >
                  <span className="text-2xl font-bold text-white">WE</span>
                  
                  {/* Connection lines from left edge of WE circle to WE boxes */}
                  {wePoints.map((_, index) => {
                    const boxTop = parseInt(weBoxPositions[index].top) * 16; // Convert rem to px (16px per rem)
                    const boxLeft = parseInt(weBoxPositions[index].left || '0');
                    const boxCenterY = boxTop + 90; // Middle of 180px tall box
                    const circleCenterY = 300; // Center of 600px container
                    const circleLeftEdge = 90; // Left edge of circle (180px diameter / 2)
                    const boxRightEdge = 375 + boxLeft; // Right edge of box to connect to
                    
                    return (
                      <svg 
                        key={index}
                        width="400" 
                        height="600" 
                        className="absolute overflow-visible"
                        style={{
                          left: '-200px',
                          top: '-300px'
                        }}
                      >
                        <path 
                          d={`M ${circleLeftEdge} ${circleCenterY} Q ${(circleLeftEdge + boxRightEdge) / 2} ${(circleCenterY + boxCenterY) / 2} ${boxRightEdge} ${boxCenterY}`}
                          stroke="#666" 
                          strokeWidth="2" 
                          fill="none"
                          strokeDasharray="5,5"
                        />
                        <circle cx={boxRightEdge} cy={boxCenterY} r="4" fill="#666" />
                      </svg>
                    );
                  })}
                </div>
                
                {/* THEY Circle */}
                <div 
                  className="rounded-full flex items-center justify-center relative"
                  style={{ 
                    backgroundColor: '#EEFAF8',
                    width: '180px',
                    height: '180px'
                  }}
                >
                  <span className="text-2xl font-bold" style={{ color: '#92B5AF' }}>THEY</span>
                  
                  {/* Connection lines from right edge of THEY circle to THEY boxes */}
                  {theyPoints.map((_, index) => {
                    const boxTop = parseInt(theyBoxPositions[index].top) * 16; // Convert rem to px (16px per rem)
                    const boxRight = parseInt(theyBoxPositions[index].right || '0');
                    const boxCenterY = boxTop + 90; // Middle of 180px tall box
                    const circleCenterY = 300; // Center of 600px container
                    const circleRightEdge = 90; // Right edge of circle (from center - 180px diameter / 2)
                    const boxLeftEdge = 0 - boxRight; // Left edge of box to connect to
                    
                    return (
                      <svg 
                        key={index}
                        width="400" 
                        height="600" 
                        className="absolute overflow-visible"
                        style={{
                          left: '90px',
                          top: '-300px'
                        }}
                      >
                        <path 
                          d={`M ${circleRightEdge} ${circleCenterY} Q ${(circleRightEdge + boxLeftEdge) / 2} ${(circleCenterY + boxCenterY) / 2} ${boxLeftEdge} ${boxCenterY}`}
                          stroke="#666" 
                          strokeWidth="2" 
                          fill="none"
                          strokeDasharray="5,5"
                        />
                        <circle cx={boxLeftEdge} cy={boxCenterY} r="4" fill="#666" />
                      </svg>
                    );
                  })}
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
            </div>
          </div>

          {/* Mobile Slider */}
          <div className="md:hidden">
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
                          backgroundColor: '#2E3242',
                          width: '64px',
                          height: '64px'
                        }}
                      >
                        <span className="text-xl font-bold text-white">WE</span>
                      </div>
                    </div>
                    {wePoints.map((point, index) => (
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
                ) : (
                  /* THEY Page */
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
                        <span className="text-xl font-bold" style={{ color: '#92B5AF' }}>THEY</span>
                      </div>
                    </div>
                    {theyPoints.map((point, index) => (
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