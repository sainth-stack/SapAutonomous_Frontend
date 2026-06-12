export const MAX_IMAGE_SIZE_MB = 10;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Copies image bytes into a stable File and data URL so pasted clipboard
 * images remain visible in chat (blob: URLs can become invalid after send).
 */
export async function prepareImageAttachment(file, fallbackType) {
  if (!file) return null;

  const normalizedType =
    file.type && ACCEPTED_IMAGE_TYPES.includes(file.type)
      ? file.type
      : fallbackType && ACCEPTED_IMAGE_TYPES.includes(fallbackType)
        ? fallbackType
        : null;

  if (!normalizedType) {
    return { error: 'type' };
  }

  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    return { error: 'size' };
  }

  const buffer = await file.arrayBuffer();
  const ext = normalizedType.split('/')[1] || 'png';
  const name = file.name || `pasted-image.${ext === 'jpeg' ? 'jpg' : ext}`;
  const stableFile = new File([buffer], name, { type: normalizedType });
  const previewUrl = await readFileAsDataUrl(stableFile);

  return { file: stableFile, previewUrl, name };
}
