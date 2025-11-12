import React, { useState, useEffect } from 'react';
import { getRandomQuote, Quote } from '../data/quotes';

const QuotesPage: React.FC = () => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNewQuote();
  }, []);

  const loadNewQuote = () => {
    setIsLoading(true);
    // Small delay for smooth transition
    setTimeout(() => {
      setQuote(getRandomQuote());
      setIsLoading(false);
    }, 100);
  };

  if (isLoading || !quote) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-64 md:h-96 bg-gradient-to-br from-indigo-500 to-purple-600">
          <img
            src={quote.imageUrl}
            alt={quote.category}
            className="w-full h-full object-cover opacity-80"
            onError={(e) => {
              // Fallback to gradient if image fails to load
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              {quote.category}
            </span>
          </div>
        </div>

        <div className="p-8 md:p-12">
          <blockquote className="text-2xl md:text-3xl font-medium text-gray-900 dark:text-gray-100 mb-6 leading-relaxed">
            "{quote.text}"
          </blockquote>
          
          <div className="flex items-center justify-between">
            <cite className="text-lg text-gray-600 dark:text-gray-400 font-medium not-italic">
              — {quote.author}
            </cite>
            
            <button
              onClick={loadNewQuote}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
            >
              New Quote
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Get inspired. Stay motivated. Keep rising.
        </p>
      </div>
    </main>
  );
};

export default QuotesPage;

