import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CaseStudyGallery = () => {
  const caseStudies = [
    {
      id: 1,
      title: "E-commerce Redesign",
      metric: "+39% CVR",
      description: "Complete PDP overhaul for beauty brand",
      image: "/placeholder.svg",
      category: "E-commerce"
    },
    {
      id: 2,
      title: "Landing Page Optimization",
      metric: "+18% AOV",
      description: "Merchandising-focused homepage test",
      image: "/placeholder.svg",
      category: "Landing Page"
    },
    {
      id: 3,
      title: "Lead Generation",
      metric: "22% lift",
      description: "Long-form layout for B2B SaaS",
      image: "/placeholder.svg",
      category: "Lead Gen"
    },
    {
      id: 4,
      title: "Checkout Flow",
      metric: "+28% completion",
      description: "Streamlined 3-step checkout process",
      image: "/placeholder.svg",
      category: "Conversion"
    },
    {
      id: 5,
      title: "Mobile Experience",
      metric: "+45% mobile CVR",
      description: "Mobile-first redesign approach",
      image: "/placeholder.svg",
      category: "Mobile"
    }
  ];

  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <div>
              <p className="text-primary text-sm font-medium mb-2">Case Studies & Portfolio</p>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
                Browse Some of Our Wins
              </h2>
            </div>
          </div>

          <Carousel className="w-full">
            <CarouselContent className="-ml-4">
              {caseStudies.map((study) => (
                <CarouselItem key={study.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="bg-gray-800 rounded-2xl overflow-hidden cursor-pointer hover:bg-gray-750 transition-colors group">
                        <div className="aspect-[4/3] bg-gray-700 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                              <p className="text-xs text-gray-300 mb-1">{study.category}</p>
                              <p className="font-semibold text-lg">{study.metric}</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                            {study.title}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {study.description}
                          </p>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <div className="p-6">
                        <div className="aspect-[4/3] bg-gray-100 rounded-lg mb-6">
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            Full Case Study View - {study.title}
                          </div>
                        </div>
                        <h2 className="text-2xl font-bold mb-4">{study.title}</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-semibold mb-2">Challenge</h3>
                            <p className="text-gray-600 mb-4">
                              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            </p>
                            <h3 className="font-semibold mb-2">Solution</h3>
                            <p className="text-gray-600">
                              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            </p>
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2">Results</h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="text-3xl font-bold text-primary mb-2">{study.metric}</div>
                              <p className="text-gray-600 text-sm">{study.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex text-black hover:text-white h-12 w-12" />
            <CarouselNext className="hidden md:flex text-black hover:text-white h-12 w-12" />
            <CarouselPrevious className="md:hidden flex text-black hover:text-white h-12 w-12 -left-2 z-10" />
            <CarouselNext className="md:hidden flex text-black hover:text-white h-12 w-12 -right-2 z-10" />
          </Carousel>

          <div className="text-center mt-12">
            <Button 
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8 py-4 rounded-xl transition-smooth"
            >
              See More of What We Can Do
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudyGallery;