'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface PriceSliderProps {
  min?: number;
  max?: number;
  defaultMin?: number;
  defaultMax?: number;
  onApply: (min: number | null, max: number | null) => void;
}

export function PriceSlider({
  min = 0,
  max = 1000,
  defaultMin,
  defaultMax,
  onApply,
}: PriceSliderProps) {
  const [minValue, setMinValue] = useState(defaultMin ?? min);
  const [maxValue, setMaxValue] = useState(defaultMax ?? max);

  useEffect(() => {
    setMinValue(defaultMin ?? min);
    setMaxValue(defaultMax ?? max);
  }, [defaultMin, defaultMax, min, max]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxValue - 1);
    setMinValue(value);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minValue + 1);
    setMaxValue(value);
  };

  const handleApply = () => {
    const finalMin = minValue > min ? minValue : null;
    const finalMax = maxValue < max ? maxValue : null;
    onApply(finalMin, finalMax);
  };

  const minPercent = ((minValue - min) / (max - min)) * 100;
  const maxPercent = ((maxValue - min) / (max - min)) * 100;

  return (
    <div className="space-y-4">
      {/* Inputs numéricos */}
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1.5 block font-medium">Mínimo</label>
          <input
            type="number"
            value={minValue}
            onChange={(e) => setMinValue(Math.max(min, Number(e.target.value)))}
            placeholder={`$${min}`}
            min={min}
            max={maxValue - 1}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors bg-gray-50"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1.5 block font-medium">Máximo</label>
          <input
            type="number"
            value={maxValue}
            onChange={(e) => setMaxValue(Math.min(max, Number(e.target.value)))}
            placeholder={`$${max}`}
            min={minValue + 1}
            max={max}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors bg-gray-50"
          />
        </div>
      </div>

      {/* Slider visual */}
      <div className="relative pt-2 pb-1">
        {/* Track background */}
        <div className="h-1.5 bg-gray-100 rounded-full relative">
          {/* Active range */}
          <div
            className="absolute h-full bg-primary rounded-full"
            style={{
              left: `${minPercent}%`,
              right: `${100 - maxPercent}%`,
            }}
          />
        </div>

        {/* Min range input */}
        <input
          type="range"
          min={min}
          max={max}
          value={minValue}
          onChange={handleMinChange}
          className="absolute w-full h-1.5 top-2 left-0 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md"
        />

        {/* Max range input */}
        <input
          type="range"
          min={min}
          max={max}
          value={maxValue}
          onChange={handleMaxChange}
          className="absolute w-full h-1.5 top-2 left-0 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md"
        />
      </div>

      {/* Range display */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>${minValue}</span>
        <span>${maxValue}</span>
      </div>

      <Button
        onClick={handleApply}
        variant="outline"
        size="sm"
        className="w-full text-xs font-semibold"
      >
        Aplicar precio
      </Button>
    </div>
  );
}
