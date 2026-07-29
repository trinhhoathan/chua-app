/** Nén ảnh phía client trước khi upload (ảnh điện thoại thường rất lớn). */

const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.82;

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
