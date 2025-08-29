import { useState, useEffect } from "react";

const TestimonialSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      quote: "Working with BedaBeda Growth has brought immeasurable value to our business. Their copywriting and conversion rate optimization services significantly lowered our CPA in a very competitive market. Although BedaBeda Growth isn't cheap, they are extremely efficient and the decision to work with this team has provided an exponential ROI.",
      name: "Jon Klein",
      title: "CEO",
      company: "Neutralyze"
    },
    {
      quote: "BedaBeda did an excellent job of identifying opportunities and implementing them in order to increase our conversion. They truly understand the mind of consumers and how to shape journeys around purchase intent. We were highly impressed with them and how they thought about shaping the customer journey.",
      name: "Gabriel Kattan",
      title: "CEO",
      company: "Perk"
    },
    {
      quote: "What impressed me the most was their understanding of our customers psychology and then translating that to good copywriting. They delivered items on time and were great at keeping us updated on the progress they were making. They were thoughtful partners and they cared about delivering quality pages.",
      name: "KM",
      title: "CEO",
      company: "The Earthling Co"
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