const ClientLogos = () => {
  const logos = [
    {
      name: "Every Man Jack",
      image: "/lovable-uploads/76859cc7-b48c-4e32-93c3-3afb347b4517.png",
      backgroundColor: "#000000",
      metric: "+92.91%",
      description: "increase in revenue per session"
    },
    {
      name: "Schneiders",
      image: "/lovable-uploads/223773ad-b16d-49c9-a23c-124e8902361b.png",
      backgroundColor: "#FFFFFF",
      metric: "+$497,710",
      description: "added monthly revenue"
    },
    {
      name: "Allegiance",
      image: "/lovable-uploads/971ca3d7-4554-4f81-90d4-2636758c0e03.png",
      backgroundColor: "#FFFFFF",
      metric: "+50.04%",
      description: "increase in revenue per visitor"
    },
    {
      name: "The Earthling Co.",
      image: "/lovable-uploads/598c47df-1223-41ea-9a54-7d682d54e442.png",
      backgroundColor: "#EBEEE9",
      metric: "+46.01%",
      description: "increase in revenue per visitor"
    },
    {
      name: "Aday",
      image: "/lovable-uploads/32829b25-fbc7-42dd-9a85-91fe8b92fdbd.png",
      backgroundColor: "#DEE2D8",
      metric: "+$199,960",
      description: "added annual revenue"
    }
  ];

  return (
    <section className="py-12 bg-background border-b border-gray-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <p className="text-lg font-medium text-gray-600">Trusted by:</p>
        </div>
        
        {/* Desktop Layout - Only on xl and above */}
        <div className="hidden xl:flex justify-center items-start gap-8 2xl:gap-12">
          {logos.map((logo, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className={`w-[230px] h-[140px] rounded-lg flex items-center justify-center mb-4 ${logo.backgroundColor === "#FFFFFF" ? "border border-gray-200" : ""}`}
                style={{ backgroundColor: logo.backgroundColor }}
              >
                <img
                  src={logo.image}
                  alt={logo.name}
                  className="max-h-[80%] max-w-[80%] object-contain"
                />
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-[#181B21] mb-1">
                  {logo.metric}
                </div>
                <div className="text-sm text-[#6B7280] leading-tight">
                  {logo.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile, Tablet & Medium Desktop Layout */}
        <div className="flex xl:hidden flex-col md:flex-row md:flex-wrap md:justify-center items-center gap-6">
          {logos.map((logo, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className={`w-[200px] h-[120px] rounded-lg flex items-center justify-center mb-3 ${logo.backgroundColor === "#FFFFFF" ? "border border-gray-200" : ""}`}
                style={{ backgroundColor: logo.backgroundColor }}
              >
                <img
                  src={logo.image}
                  alt={logo.name}
                  className="max-h-[80%] max-w-[80%] object-contain"
                />
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-[#181B21] mb-1">
                  {logo.metric}
                </div>
                <div className="text-sm text-[#6B7280] leading-tight">
                  {logo.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientLogos;