import { Button } from "@/components/ui/button";

const CaseStudyTeasers = () => {
  const results = [
    {
      icon: "🛒",
      metric: "+39% CVR",
      description: "from big swing PDP redesign"
    },
    {
      icon: "📈", 
      metric: "+18% AOV",
      description: "with merchandising-focused landing page"
    },
    {
      icon: "🎯",
      metric: "22% lift",
      description: "in lead quality from long-form layout test"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Results That <span className="text-primary">Actually Matter</span>
            </h2>
            <p className="text-xl text-gray-600">
              Real lifts from strategic experiments that compound over time
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {results.map((result, index) => (
              <div 
                key={index}
                className="text-center p-8 bg-secondary/20 rounded-2xl hover:bg-secondary/30 transition-smooth hover-lift"
              >
                <div className="text-5xl mb-4">
                  {result.icon}
                </div>
                <div className="text-3xl font-bold text-primary mb-2">
                  {result.metric}
                </div>
                <p className="text-gray-600 font-medium">
                  {result.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center pt-8">
            <Button 
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8 py-4 rounded-xl transition-smooth"
            >
              See More Results
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudyTeasers;