import React from 'react';

interface TestimonialProps {
  quote: string;
  description: string;
}

const Testimonial = ({ quote, description }: TestimonialProps) => {
  return (
    <div className="flex bg-[#EEF0ED] border-2 border-gray-200 rounded-2xl p-6 flex-col items-center animate-float">
      <h3 className="text-lg font-bold mb-4 p-2">{quote}</h3>
      <p className="text-sm text-gray-600 mb-1 p-2">{description}</p>
    </div>
  );
};

export default Testimonial;
