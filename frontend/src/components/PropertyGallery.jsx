/**
 * PropertyGallery — masonry grid + fullscreen viewer with pinch zoom, swipe, keyboard nav.
 */
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Grid } from "lucide-react";

export default function PropertyGallery({ images = [], name = "" }) {
  const [open, setOpen] = useState(-1);
  const [showGrid, setShowGrid] = useState(false);
  const touchStart = useRef({ x: 0, y: 0, t: 0 });

  const close = useCallback(() => setOpen(-1), []);
  const next = useCallback(() => setOpen((i) => (i + 1) % images.length), [images.length]);
  const prev = useCallback(() => setOpen((i) => (i - 1 + images.length) % images.length), [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (open < 0) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "g" || e.key === "G") setShowGrid((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, next, prev]);

  // Body scroll lock
  useEffect(() => {
    if (open >= 0) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Swipe handlers
  const onTouchStart = (e) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  };
  const onTouchEnd = (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    const dt = Date.now() - touchStart.current.t;
    if (dt < 500 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx > 0) prev(); else next();
    }
  };

  if (!images.length) {
    return <div className="aspect-video bg-black/5 flex items-center justify-center text-black/40">No images yet</div>;
  }

  // Masonry pattern for grid
  const pattern = (i) => {
    const p = i % 6;
    if (p === 0) return "md:col-span-2 md:row-span-2";
    if (p === 3) return "md:row-span-2";
    return "";
  };

  return (
    <>
      {/* Editorial hero collage */}
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-1 md:gap-1.5 md:h-[70vh] relative bg-[#0A0A0A]">
        <button onClick={() => setOpen(0)} className="col-span-1 md:col-span-2 md:row-span-2 group overflow-hidden relative">
          <img src={images[0]} alt={name} className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-[1200ms] ease-out" />
        </button>
        {images.slice(1, 5).map((img, i) => (
          <button key={i} onClick={() => setOpen(i + 1)} className="group overflow-hidden relative">
            <img src={img} alt="" className="w-full h-40 md:h-full object-cover group-hover:scale-105 transition-transform duration-[1200ms] ease-out" />
            {i === 3 && images.length > 5 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-sm tracking-[0.2em] uppercase">+{images.length - 5} more</span>
              </div>
            )}
          </button>
        ))}
        {/* View all button */}
        <button
          onClick={() => { setOpen(0); setShowGrid(true); }}
          className="absolute bottom-4 right-4 glass-dark text-white text-xs tracking-[0.15em] uppercase px-4 py-2 flex items-center gap-2 hover:bg-black/90"
          data-testid="gallery-view-all"
        >
          <Grid size={12} /> View all {images.length}
        </button>
      </div>

      {/* Fullscreen viewer */}
      <AnimatePresence>
        {open >= 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/98 select-none"
            data-testid="gallery-fullscreen"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {/* Top bar */}
            <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 md:px-8 py-4 text-white bg-gradient-to-b from-black/70 to-transparent">
              <div className="text-xs tracking-[0.3em] uppercase text-white/70">{open + 1} / {images.length}</div>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowGrid((v) => !v)} className="w-9 h-9 flex items-center justify-center hover:text-[#C8A96A]" aria-label="Toggle grid" data-testid="gallery-toggle-grid">
                  <Grid size={16} strokeWidth={1.5} />
                </button>
                <button onClick={close} className="w-9 h-9 flex items-center justify-center hover:text-[#C8A96A]" aria-label="Close" data-testid="gallery-close">
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {showGrid ? (
              <div className="absolute inset-0 pt-20 pb-4 px-4 md:px-10 overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 auto-rows-[180px] md:auto-rows-[220px]">
                  {images.map((src, i) => (
                    <button key={i} onClick={() => { setOpen(i); setShowGrid(false); }}
                      className={`overflow-hidden bg-black relative group ${pattern(i)}`}>
                      <img src={src} alt="" className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <TransformWrapper
                initialScale={1}
                minScale={1}
                maxScale={4}
                doubleClick={{ mode: "toggle", step: 1.5 }}
                pinch={{ step: 5 }}
                wheel={{ step: 0.2 }}
              >
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <>
                    <TransformComponent
                      wrapperClass="!w-full !h-full"
                      contentClass="!w-full !h-full flex items-center justify-center"
                    >
                      <img
                        src={images[open]}
                        alt=""
                        className="max-h-[100vh] max-w-[100vw] object-contain"
                        draggable={false}
                      />
                    </TransformComponent>
                    {/* Nav arrows */}
                    <button onClick={prev} className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 md:w-14 md:h-14 rounded-full glass-dark text-white flex items-center justify-center hover:bg-black" aria-label="Previous" data-testid="gallery-prev">
                      <ChevronLeft size={20} strokeWidth={1.5} />
                    </button>
                    <button onClick={next} className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 md:w-14 md:h-14 rounded-full glass-dark text-white flex items-center justify-center hover:bg-black" aria-label="Next" data-testid="gallery-next">
                      <ChevronRight size={20} strokeWidth={1.5} />
                    </button>
                    {/* Zoom controls */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 glass-dark px-2 py-1.5 rounded-full text-white">
                      <button onClick={() => zoomOut()} className="w-8 h-8 flex items-center justify-center hover:text-[#C8A96A]" aria-label="Zoom out"><ZoomOut size={14} /></button>
                      <button onClick={() => resetTransform()} className="w-8 h-8 flex items-center justify-center hover:text-[#C8A96A]" aria-label="Reset zoom"><Maximize2 size={14} /></button>
                      <button onClick={() => zoomIn()} className="w-8 h-8 flex items-center justify-center hover:text-[#C8A96A]" aria-label="Zoom in"><ZoomIn size={14} /></button>
                    </div>
                    {/* Filmstrip */}
                    <div className="absolute bottom-20 md:bottom-24 inset-x-0 z-10 hidden md:flex justify-center gap-1.5 px-4 overflow-x-auto">
                      {images.map((src, i) => (
                        <button key={i} onClick={() => setOpen(i)}
                          className={`h-14 w-20 shrink-0 overflow-hidden border-2 transition-all ${i === open ? "border-[#C8A96A] opacity-100" : "border-transparent opacity-50 hover:opacity-80"}`}>
                          <img src={src} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                    {/* Hint */}
                    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 text-white/40 text-[10px] tracking-[0.3em] uppercase hidden md:block">
                      Double-click to zoom · ← → to navigate · G for grid · Esc to close
                    </div>
                  </>
                )}
              </TransformWrapper>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
