/**
 * ImageUploader — multi-file upload with preview, crop, compression, drag-reorder.
 * Emits an array of base64 data URLs. Used inside the admin PropertyForm.
 */
import { useState, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Upload, X, Crop as CropIcon, GripVertical, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { compressMany, cropImageDataUrl } from "../lib/imageUtils";

function SortableThumb({ id, src, index, onRemove, onCrop }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="relative group border border-black/10 bg-white" data-testid={`upload-thumb-${index}`}>
      <img src={src} alt="" className="w-full aspect-[4/3] object-cover" />
      <div className="absolute top-1 left-1 flex items-center gap-1">
        {index === 0 && <span className="text-[9px] bg-[#C8A96A] text-charcoal px-1.5 py-0.5 tracking-widest uppercase">Cover</span>}
      </div>
      <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
        <button type="button" {...attributes} {...listeners} className="w-7 h-7 bg-white/90 flex items-center justify-center hover:bg-white" aria-label="Drag to reorder"><GripVertical size={12} /></button>
        <button type="button" onClick={() => onCrop(index)} className="w-7 h-7 bg-white/90 flex items-center justify-center hover:bg-white" aria-label="Crop"><CropIcon size={12} /></button>
        <button type="button" onClick={() => onRemove(index)} className="w-7 h-7 bg-white/90 flex items-center justify-center hover:bg-white text-red-600" aria-label="Remove"><X size={12} /></button>
      </div>
    </div>
  );
}

export default function ImageUploader({ value = [], onChange, max = 20 }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [cropIndex, setCropIndex] = useState(-1);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(4 / 3);
  const [pixelCrop, setPixelCrop] = useState(null);
  const inputRef = useRef(null);

  const onFiles = async (files) => {
    if (!files || files.length === 0) return;
    if (value.length + files.length > max) {
      toast.error(`Maximum ${max} images per property`);
      return;
    }
    setBusy(true);
    setProgress({ done: 0, total: files.length });
    try {
      const urls = await compressMany(files, (d, t) => setProgress({ done: d, total: t }));
      onChange([...value, ...urls]);
      toast.success(`Uploaded ${urls.length} image${urls.length > 1 ? "s" : ""}`);
    } catch (e) {
      toast.error("Upload failed");
    } finally {
      setBusy(false);
      setProgress({ done: 0, total: 0 });
    }
  };

  const remove = (i) => onChange(value.filter((_, k) => k !== i));

  const handleDragEnd = (e) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = value.findIndex((_, i) => `img-${i}` === active.id);
    const newIndex = value.findIndex((_, i) => `img-${i}` === over.id);
    onChange(arrayMove(value, oldIndex, newIndex));
  };

  const applyCrop = useCallback(async () => {
    if (cropIndex < 0 || !pixelCrop) return;
    try {
      const cropped = await cropImageDataUrl(value[cropIndex], pixelCrop);
      const next = [...value];
      next[cropIndex] = cropped;
      onChange(next);
      toast.success("Cropped");
    } catch { toast.error("Crop failed"); }
    setCropIndex(-1);
  }, [cropIndex, pixelCrop, value, onChange]);

  return (
    <div className="space-y-4" data-testid="image-uploader">
      <div
        className="border-2 border-dashed border-black/15 hover:border-[#C8A96A] p-8 text-center cursor-pointer bg-[#FAFAFA] transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}
        data-testid="upload-dropzone"
      >
        <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
        {busy ? (
          <div className="flex items-center justify-center gap-2 text-sm text-black/60">
            <Loader2 className="animate-spin" size={16} /> Compressing {progress.done} / {progress.total}…
          </div>
        ) : (
          <>
            <Upload size={22} strokeWidth={1.5} className="mx-auto text-[#C8A96A]" />
            <p className="mt-3 text-sm text-charcoal font-medium">Click or drop images here</p>
            <p className="text-xs text-black/50 mt-1">WebP compression to &lt;500 KB · up to {max} images · drag to reorder</p>
          </>
        )}
      </div>

      {value.length > 0 && (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={value.map((_, i) => `img-${i}`)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {value.map((src, i) => (
                <SortableThumb key={`img-${i}-${src.slice(-10)}`} id={`img-${i}`} src={src} index={i} onRemove={remove} onCrop={setCropIndex} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Cropper modal */}
      {cropIndex >= 0 && (
        <div className="fixed inset-0 z-[80] bg-black/85 flex items-center justify-center p-4" onClick={() => setCropIndex(-1)}>
          <div className="bg-white w-full max-w-3xl p-4" onClick={(e) => e.stopPropagation()} data-testid="crop-modal">
            <div className="relative w-full h-[60vh] bg-black">
              <Cropper
                image={value[cropIndex]}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, px) => setPixelCrop(px)}
              />
            </div>
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <label className="flex items-center gap-2 text-sm">Aspect:
                <select value={aspect} onChange={(e) => setAspect(Number(e.target.value))} className="border border-black/15 h-8 px-2 text-sm">
                  <option value={4/3}>4:3</option>
                  <option value={16/9}>16:9</option>
                  <option value={1}>1:1</option>
                  <option value={3/4}>3:4</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm flex-1 min-w-[120px]">Zoom:
                <input type="range" min={1} max={3} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1 accent-[#C8A96A]" />
              </label>
              <button type="button" onClick={() => setCropIndex(-1)} className="btn-outline-dark !py-2 !px-4 text-xs">Cancel</button>
              <button type="button" onClick={applyCrop} className="btn-gold !py-2 !px-4 text-xs" data-testid="crop-apply">Apply Crop</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
