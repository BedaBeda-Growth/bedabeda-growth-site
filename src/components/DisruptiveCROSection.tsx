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
    { top: '0rem' },     // First box
    { top: '8rem' },     // Second box offset down
    { top: '16rem' }     // Third box offset further down
  ];

  const theyBoxPositions = [
    { top: '4rem' },     // First box offset down
    { top: '12rem' },    // Second box offset further
    { top: '20rem' }     // Third box offset most
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

          {/* Desktop & Tablet Layout */}
          <div className="hidden md:block">
            <div className="relative min-h-[700px]">
              {/* WE Section - 3 separate staggered boxes */}
              <div className="absolute left-0">
                {wePoints.map((point, index) => (
                  <div 
                    key={index} 
                    className="absolute"
                    style={{ top: weBoxPositions[index].top }}
                  >
                    <div 
                      className="rounded-xl p-6 text-white relative"
                      style={{ 
                        backgroundColor: '#181B21',
                        width: '405px',
                        height: '210px'
                      }}
                    >
                      <h4 className="text-lg font-bold mb-3 text-white">
                        {point.title}
                      </h4>
                      <p className="text-sm text-gray-300 leading-relaxed">
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
                  
                  {/* Connection lines from WE circle to WE boxes */}
                  {wePoints.map((_, index) => {
                    const isMiddle = index === 1;
                    const isTop = index === 0;
                    const isBottom = index === 2;
                    
                    return (
                      <div key={index} className="absolute">
                        <svg 
                          width="300" 
                          height="400" 
                          className="overflow-visible absolute"
                          style={{
                            left: '-220px',
                            top: '-200px'
                          }}
                        >
                          {isMiddle ? (
                            // Straight line to middle box
                            <>
                              <line 
                                x1="130" 
                                y1="200" 
                                x2="190" 
                                y2="200" 
                                stroke="#666" 
                                strokeWidth="2" 
                                strokeDasharray="5,5"
                              />
                              <circle cx="195" cy="200" r="4" fill="#666" />
                            </>
                          ) : (
                            // Curved lines to top and bottom boxes
                            <>
                              <path 
                                d={`M 130 200 Q 160 ${isTop ? 120 : 280} 190 ${isTop ? 100 : 300}`}
                                stroke="#666" 
                                strokeWidth="2" 
                                fill="none"
                                strokeDasharray="5,5"
                              />
                              <circle cx="190" cy={isTop ? 100 : 300} r="4" fill="#666" />
                            </>
                          )}
                        </svg>
                      </div>
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
                  
                  {/* Connection lines from THEY circle to THEY boxes */}
                  {theyPoints.map((_, index) => {
                    const isMiddle = index === 1;
                    const isTop = index === 0;
                    const isBottom = index === 2;
                    
                    return (
                      <div key={index} className="absolute">
                        <svg 
                          width="300" 
                          height="400" 
                          className="overflow-visible absolute"
                          style={{
                            left: '90px',
                            top: '-200px'
                          }}
                        >
                          {isMiddle ? (
                            // Straight line to middle box
                            <>
                              <line 
                                x1="90" 
                                y1="200" 
                                x2="150" 
                                y2="200" 
                                stroke="#666" 
                                strokeWidth="2" 
                                strokeDasharray="5,5"
                              />
                              <circle cx="155" cy="200" r="4" fill="#666" />
                            </>
                          ) : (
                            // Curved lines to top and bottom boxes
                            <>
                              <path 
                                d={`M 90 200 Q 120 ${isTop ? 120 : 280} 150 ${isTop ? 100 : 300}`}
                                stroke="#666" 
                                strokeWidth="2" 
                                fill="none"
                                strokeDasharray="5,5"
                              />
                              <circle cx="150" cy={isTop ? 100 : 300} r="4" fill="#666" />
                            </>
                          )}
                        </svg>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* THEY Section - 3 separate staggered boxes */}
              <div className="absolute right-0">
                {theyPoints.map((point, index) => (
                  <div 
                    key={index} 
                    className="absolute"
                    style={{ top: theyBoxPositions[index].top }}
                  >
                    <div 
                      className="rounded-xl p-6 relative"
                      style={{ 
                        backgroundColor: '#EEFAF8',
                        width: '405px',
                        height: '210px'
                      }}
                    >
                      <h4 className="text-lg font-bold mb-3" style={{ color: '#2E3242' }}>
                        {point.title}
                      </h4>
                      <p className="text-sm leading-relaxed" style={{ color: '#3D3D3D' }}>
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