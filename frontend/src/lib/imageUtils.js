/**
 * imageUtils — client-side image compression + base64 encoding.
 * Images are compressed to WebP < 500 KB before storing in Mongo (as base64 data URLs).
 */
import imageCompression from "browser-image-compression";

const DEFAULT_OPTS = {
  maxSizeMB: 0.45,
  maxWidthOrHeight: 2000,
  useWebWorker: true,
  fileType: "image/webp",
  initialQuality: 0.82,
};

export async function compressToDataUrl(file, opts = {}) {
  const merged = { ...DEFAULT_OPTS, ...opts };
  const compressed = await imageCompression(file, merged);
  return await imageCompression.getDataUrlFromFile(compressed);
}

export async function compressMany(files, onProgress) {
  const arr = Array.from(files);
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    try {
      const url = await compressToDataUrl(arr[i]);
      out.push(url);
    } catch (e) {
      console.error("Compression failed for", arr[i].name, e);
    }
    if (onProgress) onProgress(i + 1, arr.length);
  }
  return out;
}

/** Crop an image (dataURL) using pixel crop returned by react-easy-crop */
export async function cropImageDataUrl(dataUrl, pixelCrop) {
  const image = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height
  );
  return canvas.toDataURL("image/webp", 0.85);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.crossOrigin = "anonymous";
    img.src = src;
  });
}
