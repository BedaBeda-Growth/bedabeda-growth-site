import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CaseStudyGallery = () => {
  const caseStudies = [
    {
      id: 1,
      title: "Product Page Optimization",
      metric: "+15.8% Revenue Per Session",
      description: "Data-driven PDP overhaul for niche home goods",
      image: "/lovable-uploads/073035e6-0b23-493f-b261-b59c55a82d2b.png",
      category: "E-commerce"
    },
    {
      id: 2,
      title: "Landing Page Optimization",
      metric: "+57.4% Conversion Rate Increase",
      description: "Ad-focused dedicated landing page",
      image: "/placeholder.svg",
      category: "Landing Page"
    },
    {
      id: 3,
      title: "Homepage Optimization",
      metric: "+36.3% Revenue Per Session",
      description: "Homepage optimization for high-volume B2C online community",
      image: "/placeholder.svg",
      category: "Online B2C Community"
    },
    {
      id: 4,
      title: "Catalog Page Optimization",
      metric: "+$1.8MM New Annual Revenue",
      description: "Catalog/Collections page optimization for 9-figure brand",
      image: "/placeholder.svg",
      category: "High SKU E-Commerce"
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
                          {study.id === 1 ? (
                            <>
                              <img 
                                src="/lovable-uploads/cee89299-737e-4676-b52f-73feda5f3234.png" 
                                alt="Product Page Optimization Background"
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
                            </>
                          ) : study.id === 2 ? (
                            <>
                              <img 
                                src="/lovable-uploads/65bfccf9-b541-42fb-b0d7-0cd49a416900.png" 
                                alt="Paperlike Landing Page Background"
                                className="absolute inset-0 w-full h-full object-cover object-top"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
                            </>
                          ) : study.id === 3 ? (
                            <>
                              <img 
                                src="/lovable-uploads/eb294c82-2731-41e6-86f1-ba3cad39182a.png" 
                                alt="Online B2C Community Background"
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
                            </>
                          ) : study.id === 4 ? (
                            <>
                              <img 
                                src="/lovable-uploads/74ef33b8-f697-485c-8321-217c9176ac92.png" 
                                alt="Catalog Page Optimization Background"
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
                            </>
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
                          )}
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 relative">
                              <p className="text-xs text-gray-300 mb-1">{study.category}</p>
                              <p className="font-semibold text-lg">{study.metric}</p>
                              {study.id === 1 && (
                                <img 
                                  src="/lovable-uploads/84c87a09-5422-4ab4-9d3a-33ef18351388.png" 
                                  alt="Allegiance Made in USA"
                                  className="absolute top-2 right-2 h-6 w-auto"
                                />
                              )}
                              {study.id === 2 && (
                                <img 
                                  src="/lovable-uploads/044f4f7c-632f-40fd-ac25-44e34df54ca2.png" 
                                  alt="Paperlike Logo"
                                  className="absolute top-2 right-2 h-6 w-auto"
                                />
                              )}
                              {study.id === 3 && (
                                <img 
                                  src="/lovable-uploads/4c063577-ca79-4938-8d0f-4e64f18822d5.png" 
                                  alt="Community Logo"
                                  className="absolute top-2 right-2 h-6 w-auto"
                                />
                              )}
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
                        <div className="bg-gray-100 rounded-lg mb-6 overflow-hidden">
                          {study.id === 1 ? (
                            <img 
                              src="/lovable-uploads/073035e6-0b23-493f-b261-b59c55a82d2b.png" 
                              alt="Product Page Optimization Case Study"
                              className="w-full h-auto object-contain"
                            />
                          ) : study.id === 2 ? (
                            <img 
                              src="/lovable-uploads/c849057c-6021-4b80-b5e8-2f0a47117a60.png" 
                              alt="Paperlike Landing Page Case Study"
                              className="w-full h-auto object-contain"
                            />
                          ) : study.id === 3 ? (
                            <img 
                              src="/lovable-uploads/ac9e1377-2ade-4510-93cd-1a3bc9f79323.png" 
                              alt="Personal Development School Case Study"
                              className="w-full h-auto object-contain"
                            />
                          ) : study.id === 4 ? (
                            <img 
                              src="/lovable-uploads/74ef33b8-f697-485c-8321-217c9176ac92.png" 
                              alt="Catalog Page Optimization Case Study"
                              className="w-full h-auto object-contain"
                            />
                          ) : (
                            <div className="aspect-[4/3] w-full h-full flex items-center justify-center text-gray-500">
                              Full Case Study View - {study.title}
                            </div>
                          )}
                        </div>
                        <h2 className="text-2xl font-bold mb-4">
                          {study.id === 1 ? "Product Page Optimization" : study.id === 2 ? "Landing Page Optimization" : study.id === 4 ? "Catalog Page Optimization" : study.title}
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-semibold mb-2">Challenge</h3>
                            <p className="text-gray-600 mb-4">
                              {study.id === 1 
                                ? "Allegiance Flag Supply was growing quickly and wanted to ensure effiency as they scaled, especially knowing their product was more expensive than others in the market."
                                : study.id === 2
                                ? "Paperlike had historically only sent their traffic primarily to the product page, and they wanted to improve performance by testing landing pages in a clear and structured way."
                                : study.id === 3
                                ? "The Personal Development School was investing meaningfully in growing across all their acquisition channels. They wanted to make sure they were converting that traffic as effectively and efficiently as possible to support profitable growth."
                                : study.id === 4
                                ? "This 9-figure equestrian brand needed to optimize their catalog and collections pages to better showcase their extensive SKU range and improve the shopping experience for their customers."
                                : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                              }
                            </p>
                            <h3 className="font-semibold mb-2">Solution</h3>
                            <p className="text-gray-600">
                              {study.id === 1 
                                ? "We used a combination of user research, custom conversion & behavioral reports, and an updated page journey to showcase the right information at the right time to build trust & perceived value."
                                : study.id === 2
                                ? "The BedaBeda Growth team used our deep-dive audit and analysis process to create a landing page testing roadmap and framework, customized to support top-performing ads & overal user needs, hesitations, and values."
                                : study.id === 3
                                ? "The BedaBeda Growth team discovered that the audience knew their problems and had a decent understanding of how to solve it, but they needed confidence that joining the PDS community was the best, most effective to do that. BBG created a new homepage focused on user education, confidence, and trust-building to outperform the control."
                                : study.id === 4
                                ? "The BedaBeda Growth team implemented a comprehensive catalog page redesign focused on improving product discovery, filtering capabilities, and visual hierarchy to help customers navigate the extensive inventory more effectively."
                                : "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
                              }
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
            <CarouselPrevious className="md:hidden flex text-black hover:text-white h-12 w-12 -left-2 z-10 top-[40%]" />
            <CarouselNext className="md:hidden flex text-black hover:text-white h-12 w-12 -right-2 z-10 top-[40%]" />
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