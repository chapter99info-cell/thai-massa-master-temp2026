import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface ServiceImageProps {
  src?: string;
  alt: string;
  className?: string;
}

export default function ServiceImage({ src, alt, className }: ServiceImageProps) {
  if (!src) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center bg-accent/5 border border-primary/10 text-center p-4",
        className
      )}>
        <ImageIcon className="text-primary/40 mb-2" size={32} />
        <span className="text-[10px] uppercase tracking-widest font-bold text-primary/60">
          Premium Spa Image Coming Soon
        </span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={cn("object-cover", className)}
      referrerPolicy="no-referrer"
      onError={(e) => {
        // Fallback if image fails to load
        e.currentTarget.style.display = 'none';
        const parent = e.currentTarget.parentElement;
        if (parent) {
          const fallback = document.createElement('div');
          fallback.className = "flex flex-col items-center justify-center bg-accent/5 border border-primary/10 text-center p-4 w-full h-full";
          fallback.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary/40 mb-2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            <span class="text-[10px] uppercase tracking-widest font-bold text-primary/60">Premium Spa Image Coming Soon</span>
          `;
          parent.appendChild(fallback);
        }
      }}
    />
  );
}
