import React, { useState } from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { IMAGES } from '../data/initialData';

export const SmileSlider: React.FC = () => {
  const [sliderPos, setSliderPos] = useState<number>(50);

  return (
    <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-xl p-6 sm:p-10 my-10 text-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Interactive Smile Transformation</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            See the Clinical Difference: Real Patient Results
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg leading-relaxed">
            Slide horizontally to compare enamel discoloration and crowding against our laser whitening & aesthetic porcelain veneer treatments.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 w-fit">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Verified Clinical Outcome</span>
        </div>
      </div>

      {/* Interactive Comparison Canvas */}
      <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden select-none cursor-ew-resize border border-slate-200 shadow-md">
        {/* AFTER (Background) */}
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
          <img
            src={IMAGES.heroDentalSmile}
            alt="After treatment radiant white aligned smile"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 right-4 bg-emerald-700/90 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg flex items-center gap-1.5">
            <span>AFTER TREATMENT</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Whitening + Aligners</span>
          </div>
        </div>

        {/* BEFORE (Foreground Clip) */}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden bg-slate-900"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={IMAGES.heroDentalSmile}
            alt="Before treatment stained smile"
            className="absolute inset-0 w-full h-full object-cover filter contrast-125 sepia brightness-90 saturate-50"
            style={{ width: '100%', minWidth: '100%', maxWidth: 'none' }}
          />
          <div className="absolute bottom-4 left-4 bg-slate-900/90 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg border border-white/20">
            BEFORE TREATMENT
          </div>
        </div>

        {/* Slider Divider Line */}
        <div
          className="absolute inset-y-0 w-1 bg-white shadow-2xl cursor-ew-resize flex items-center justify-center"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="w-8 h-8 rounded-full bg-white text-slate-900 shadow-xl border-2 border-blue-600 flex items-center justify-center font-bold text-xs">
            ⇄
          </div>
        </div>

        {/* Invisible Range Input for smooth touch & mouse interaction */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={(e) => setSliderPos(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
          aria-label="Before and after transformation slider"
        />
      </div>

      <div className="flex items-center justify-between mt-4 text-[11px] text-slate-500 font-medium">
        <span>◀ Drag slider left to reveal After</span>
        <span>Drag slider right to reveal Before ▶</span>
      </div>
    </div>
  );
};
