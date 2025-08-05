const WhoYoullWorkWith = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Not an intern. Not a middleman. <br />
              <span className="text-primary">Real experts.</span>
            </h2>
            
            <div className="max-w-3xl mx-auto">
              <p className="text-xl text-gray-600 leading-relaxed">
                We're small by design. You'll work directly with the people who think critically, synthesize qualitative and quantitative insights, and design experiments that actually teach you something.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="text-2xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Strategic Thinking
              </h3>
              <p className="text-gray-600">
                Deep analysis that uncovers the real conversion barriers hidden in your customer journey.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="text-2xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Flawless Execution
              </h3>
              <p className="text-gray-600">
                End-to-end test implementation that maintains your brand integrity while maximizing impact.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoYoullWorkWith;