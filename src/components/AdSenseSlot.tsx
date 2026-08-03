import React, { useEffect } from 'react';

interface AdSenseSlotProps {
  slotId?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  className?: string;
}

export const AdSenseSlot: React.FC<AdSenseSlotProps> = ({
  slotId = '1234567890',
  format = 'auto',
  className = '',
}) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      // AdSense script handles duplicate initialization or blocker safely
    }
  }, []);

  return (
    <div className={`w-full overflow-hidden my-3 text-center font-sans ${className}`}>
      <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
        ADVERTISEMENT
      </div>
      <div className="bg-slate-100 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-200 dark:border-slate-800 min-h-[100px] flex items-center justify-center relative">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client="ca-pub-3600904217061779"
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};
