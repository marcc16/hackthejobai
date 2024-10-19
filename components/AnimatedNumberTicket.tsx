'use client';

import { useEffect, useState } from 'react';
import NumberTicker from '@/components/ui/number-ticker';

export default function AnimatedNumberTicker({ value }: { value: number }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById('number-ticker-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return isVisible ? (
    <NumberTicker
      value={value}
      className="text-6xl font-extrabold text-blue-600 mb-4 sm:mb-0"
    />
  ) : null;
}