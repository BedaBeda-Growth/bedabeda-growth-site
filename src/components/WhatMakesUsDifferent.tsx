const WhatMakesUsDifferent = () => {
  const differentiators = [
    {
      title: "Hybrid Testing That Hits Hard",
      description: "Not just copy tweaks or button colors. We design layered, insight-rich experiments that actually shift behavior and, most importantly, increase revenue and protect profit.",
      icon: "⚡"
    },
    {
      title: "Strategy Meets Execution", 
      description: "We don't just 'advise.' We deep-dive to identify the biggest opportunities, and then execute tests end-to-end to capture them.",
      icon: "🎯"
    },
    {
      title: "No Wasted Traffic",
      description: "We respect your traffic like it's our own. We only test when there's a strong hypothesis and real upside on the table.",
      icon: "🚀"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              What Makes Us <span className="text-primary">Different</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {differentiators.map((item, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-smooth hover-lift group"
              >
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4 leading-tight">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatMakesUsDifferent;