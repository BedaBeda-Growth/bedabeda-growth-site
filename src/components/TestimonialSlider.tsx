import { useState, useEffect } from "react";

const TestimonialSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      quote: "BedaBeda Growth transformed our conversion strategy with deep insights that led to a 35% increase in conversions within 3 months.",
      name: "Sarah Johnson",
      title: "VP of Growth",
      company: "TechStart Inc."
    },
    {
      quote: "Their approach to CRO is unlike anything we've experienced. They don't just run tests - they understand our customers.",
      name: "Mike Chen",
      title: "Head of Marketing",
      company: "Commerce Plus"
    },
    {
      quote: "The team's strategic thinking and execution helped us break through a plateau we'd been stuck at for months.",
      name: "Emily Rodriguez",
      title: "CMO",
      company: "ScaleUp Solutions"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div className="bg-secondary/20 rounded-2xl p-8 mb-8">
      <div className="text-center">
        <div className="mb-6">
          <p className="text-lg italic text-gray-700 leading-relaxed max-w-3xl mx-auto">
            "{testimonials[currentSlide].quote}"
          </p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">{testimonials[currentSlide].name}</p>
          <p className="text-gray-600">{testimonials[currentSlide].title}</p>
          <p className="text-primary font-medium">{testimonials[currentSlide].company}</p>
        </div>
        
        {/* Dots indicator */}
        <div className="flex justify-center space-x-2 mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide ? 'bg-primary' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialSlider;