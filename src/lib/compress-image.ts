/** Nén ảnh phía client trước khi upload (ảnh điện thoại thường rất lớn). */

const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.82;

export type PixelCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export async function compressImageForUpload(
  file: File,
  options?: { maxEdge?: number; quality?: number },
): Promise<File> {
  if (!file.type.startsWith('image/')) {
    throw new Error('File không phải ảnh.');
  }

  const maxEdge = options?.maxEdge ?? MAX_EDGE;
  const quality = options?.quality ?? JPEG_QUALITY;

  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Không tạo được canvas.');
    ctx.drawImage(bitmap, 0, 0, w, h);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Không nén được ảnh.'))),
        'image/jpeg',
        quality,
      );
    });

    const base = file.name.replace(/\.[^.]+$/, '') || 'anh-su-kien';
    return new File([blob], `${base}.jpg`, { type: 'image/jpeg' });
  } finally {
    bitmap.close();
  }
}

/** Cắt vùng pixelCrop rồi nén (dùng sau react-easy-crop). */
export async function cropAndCompressImage(
  imageSrc: string,
  pixelCrop: PixelCrop,
  options?: {
    maxEdge?: number;
    quality?: number;
    fileName?: string;
  },
): Promise<File> {
  const maxEdge = options?.maxEdge ?? MAX_EDGE;
  const quality = options?.quality ?? JPEG_QUALITY;

  const image = await loadHtmlImage(imageSrc);
  const scale = Math.min(
    1,
    maxEdge / Math.max(pixelCrop.width, pixelCrop.height),
  );
  const outW = Math.max(1, Math.round(pixelCrop.width * scale));
  const outH = Math.max(1, Math.round(pixelCrop.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Không tạo được canvas.');

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outW,
    outH,
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Không cắt được ảnh.'))),
      'image/jpeg',
      quality,
    );
  });

  const base =
    (options?.fileName ?? 'anh-banner').replace(/\.[^.]+$/, '') || 'anh-banner';
  return new File([blob], `${base}.jpg`, { type: 'image/jpeg' });
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Không đọc được ảnh.'));
    img.src = src;
  });
}
