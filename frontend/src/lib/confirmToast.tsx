"use client";

import toast from "react-hot-toast";

export const confirmAction = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    toast.custom((t) => (
      <div 
        className={`${t.visible ? 'animate-fade-in' : 'opacity-0'} max-w-sm w-full bg-space-blue shadow-[0_4px_20px_rgba(0,0,0,0.5)] rounded-2xl pointer-events-auto border border-glass-border flex flex-col`}
      >
        <div className="p-5 flex items-start gap-4">
          <div className="w-10 h-10 shrink-0 rounded-full bg-cyan-glow/10 flex items-center justify-center border border-cyan-glow/20">
            <span className="text-cyan-glow text-xl font-bold">?</span>
          </div>
          <div className="flex-1 mt-0.5">
            <h3 className="text-sm font-bold text-text-primary mb-1">Confirmation</h3>
            <p className="text-sm text-text-secondary">
              {message}
            </p>
          </div>
        </div>
        <div className="flex border-t border-glass-border divide-x divide-glass-border bg-black/20 rounded-b-2xl">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              resolve(false);
            }}
            className="w-full px-4 py-3 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors focus:outline-none rounded-bl-2xl hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              resolve(true);
            }}
            className="w-full px-4 py-3 text-sm font-semibold text-cyan-glow hover:text-cyan-glow/80 transition-colors focus:outline-none rounded-br-2xl hover:bg-white/5"
          >
            Confirm
          </button>
        </div>
      </div>
    ), { 
      duration: Infinity, 
      position: "top-center" 
    });
  });
};
