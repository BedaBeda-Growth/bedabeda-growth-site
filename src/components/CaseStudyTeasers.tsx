const CaseStudyTeasers = () => {
  const benefits = [
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M32 8L44 20H20L32 8Z" fill="currentColor"/>
          <rect x="20" y="20" width="24" height="4" fill="currentColor"/>
          <circle cx="32" cy="40" r="12" stroke="currentColor" strokeWidth="3" fill="none"/>
          <text x="32" y="45" textAnchor="middle" fontSize="12" fill="currentColor">$</text>
        </svg>
      ),
      title: "Average of 18% Increase in Revenue Per Visitor in First 5 Months",
      description: "Huge increases in conversion rates and AOV (ultimately RPV) mean huge boosts in overall performance, making your acquisition spend way more efficient and impacting your top & bottom line quickly."
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="45" r="8" fill="currentColor"/>
          <rect x="25" y="35" width="4" height="20" fill="currentColor"/>
          <rect x="32" y="25" width="4" height="30" fill="currentColor"/>
          <rect x="39" y="15" width="4" height="40" fill="currentColor"/>
          <path d="M45 20L52 13L55 16L48 23Z" fill="currentColor"/>
        </svg>
      ),
      title: "Better Customer Retention + More New Customers",
      description: "With customized user journeys for your specific customers, you'll learn which levers actually move the needle + expand your new customer sales while doubling down on returning customers."
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="20" r="12" fill="currentColor"/>
          <path d="M20 35L32 32L44 35V50L32 47L20 50V35Z" fill="currentColor"/>
          <circle cx="24" cy="42" r="3" fill="white"/>
          <circle cx="32" cy="40" r="3" fill="white"/>
          <circle cx="40" cy="42" r="3" fill="white"/>
          <text x="24" y="45" textAnchor="middle" fontSize="8" fill="currentColor">$</text>
          <text x="32" y="43" textAnchor="middle" fontSize="8" fill="currentColor">$</text>
          <text x="40" y="45" textAnchor="middle" fontSize="8" fill="currentColor">$</text>
        </svg>
      ),
      title: "Pave The Way For Profitable Future Growth",
      description: "Not only are you receiving critical insights to optimize your entire customer journey, but high performance pages allow you to drop your acquisition costs, giving you more budget to keep growing & protecting your margins."
    }
  ];

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              When You Mix Psychology & Data, <span className="text-primary">Great Things Happen</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-card rounded-xl p-8 shadow-sm border border-border hover-lift">
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground leading-tight">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-left">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudyTeasers;