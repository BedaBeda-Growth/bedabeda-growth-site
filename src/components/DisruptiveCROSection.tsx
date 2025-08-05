import disruptiveCroImage from "@/assets/what-is-disruptive-cro.png";

const DisruptiveCROSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6">
              Our Difference? <span className="text-primary">Data Deep-Dives</span> + 
              <br />Bespoke Conversion Strategy
            </h2>
            <p className="text-xl text-gray-600">
              Just call us your personal CRO concierge.
            </p>
          </div>
          
          <div className="flex justify-center">
            <img 
              src={disruptiveCroImage}
              alt="What is Disruptive CRO - WE vs THEY comparison diagram"
              className="w-full max-w-4xl h-auto rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DisruptiveCROSection;