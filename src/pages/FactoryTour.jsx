import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Import all factory images
const imageModules = import.meta.glob("../assets/factorytour/*", {
  eager: true,
  import: "default",
});

console.log("Found files:", imageModules);

// Get image URLs and sort alphabetically
const images = Object.entries(imageModules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, image]) => image);

// Debugging
console.log("Factory images:", images);
console.log("First image type:", typeof images[0]);

const FactoryTour = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  if (!images.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        No factory images found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] py-12 px-4">

      <h1 className="text-3xl md:text-4xl font-semibold text-center text-[#5a3e2b] mb-10">
        Factory Tour
      </h1>

      <div className="max-w-6xl mx-auto">

        <div className="relative">

          {/* Main Image */}
          <div className="h-[300px] md:h-[600px] rounded-xl overflow-hidden shadow-lg bg-white">

            <img
              src={images[currentIndex]}
              alt={`Factory Tour ${currentIndex + 1}`}
              className="w-full h-full object-contain"
            />

          </div>

          {/* Previous Arrow */}
          <button
            onClick={handlePrevious}
            aria-label="Previous image"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#5a3e2b] p-3 rounded-full shadow-md transition"
          >
            <ChevronLeft size={30} />
          </button>

          {/* Next Arrow */}
          <button
            onClick={handleNext}
            aria-label="Next image"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#5a3e2b] p-3 rounded-full shadow-md transition"
          >
            <ChevronRight size={30} />
          </button>

        </div>

        

        

      </div>
    </div>
  );
};

export default FactoryTour;
