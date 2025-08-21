import TestimonialSlider from "./TestimonialSlider";

const WhoWeWorkWith = () => {
  const clientTypes = [
    {
      title: "E-commerce brands between $10M–$150M",
      description: "Scaling beyond basic DTC playbooks"
    },
    {
      title: "High-volume B2C services",
      description: "Security, education, health sectors"
    },
    {
      title: "Subscription & B2C SaaS businesses",
      description: "With growth bottlenecks to unlock"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Ecommerce + High-Volume B2C = <br />
              <span className="text-primary">Our Sweet Spot</span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed text-center">
              We've driven powerful, measurable lifts for:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {clientTypes.map((client, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-smooth hover-lift relative"
              >
                {/* Logo clusters */}
                <div className="absolute -top-3 -right-3 flex">
                  {[1, 2, 3].map((logoIndex) => (
                    <div
                      key={logoIndex}
                      className={`w-8 h-8 ${(index === 0 && logoIndex === 1) || (index === 0 && logoIndex === 2) || (index === 0 && logoIndex === 3) || (index === 1 && logoIndex === 1) || (index === 1 && logoIndex === 3) || (index === 2 && logoIndex === 1) || (index === 2 && logoIndex === 2) ? 'bg-white border border-gray-300' : 'bg-gray-300 border-2 border-white'} rounded-full flex items-center justify-center text-xs font-medium text-gray-600 ${
                        logoIndex === 1 ? 'z-30' : logoIndex === 2 ? 'z-20 -ml-2' : 'z-10 -ml-2'
                      }`}
                    >
                      {index === 2 && logoIndex === 1 ? (
                        <img 
                          src="/lovable-uploads/f94c354e-f540-4220-8e15-a296078bb8a1.png" 
                          alt="Logo" 
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : index === 0 && logoIndex === 1 ? (
                        <img 
                          src="/lovable-uploads/5e63431b-7188-49a5-9743-83d62299c3c7.png" 
                          alt="Logo" 
                          className="w-full h-full object-contain rounded-full p-1"
                        />
                      ) : index === 0 && logoIndex === 2 ? (
                        <img 
                          src="/lovable-uploads/ad14011f-b94a-4411-a169-04cb1e19dac5.png" 
                          alt="Hush Logo" 
                          className="w-full h-full object-contain rounded-full p-1"
                        />
                      ) : index === 0 && logoIndex === 3 ? (
                        <img 
                          src="/lovable-uploads/5551cc33-4b99-400c-af3d-a9edc2da688b.png" 
                          alt="Logo" 
                          className="w-full h-full object-contain rounded-full p-1"
                        />
                      ) : index === 1 && logoIndex === 1 ? (
                        <img 
                          src="/lovable-uploads/539f99f7-e4aa-4a6b-a440-8292d128ab0f.png" 
                          alt="Roda Logo" 
                          className="w-full h-full object-contain rounded-full p-1"
                        />
                      ) : index === 1 && logoIndex === 3 ? (
                        <img 
                          src="/lovable-uploads/55e2678b-21da-4195-b9a1-edcf54f1ccd4.png" 
                          alt="Logo" 
                          className="w-full h-full object-contain rounded-full p-1"
                        />
                      ) : index === 2 && logoIndex === 2 ? (
                        <img 
                          src="/lovable-uploads/0fd97cf8-629d-4ab3-a445-94b71b5117c7.png" 
                          alt="Inspired Logo" 
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        logoIndex
                      )}
                    </div>
                  ))}
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-4 leading-tight">
                  {client.title}
                </h3>
                <p className="text-gray-600 text-left">
                  {client.description}
                </p>
              </div>
            ))}
          </div>

          <TestimonialSlider />
          
          <div className="bg-secondary/30 rounded-2xl p-8 text-left">
            <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
              <strong>What ties them together?</strong> They're past the DTC playbook stage. They're ready for depth, not fluff. And they're tired of CRO that doesn't move the needle or leaves their site looking like Frankenstein's love child.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoWeWorkWith;