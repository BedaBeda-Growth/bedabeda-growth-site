const ClientLogos = () => {
  return (
    <section className="py-12 bg-background border-b border-gray-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <p className="text-lg font-medium text-gray-600">Trusted by:</p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {[1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              className="w-32 h-16 bg-gray-200 rounded-lg flex items-center justify-center"
            >
              <span className="text-gray-400 text-sm font-medium">Logo {index}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientLogos;