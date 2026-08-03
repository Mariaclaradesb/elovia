const LOCAL_IMAGE_PREFIXES = ['file:', 'content:', 'blob:', 'data:'];

export function isTemporaryImageUri(uri) {
  if (typeof uri !== 'string') return false;
  const value = uri.trim();
  return LOCAL_IMAGE_PREFIXES.some((prefix) => value.startsWith(prefix))
    || value.includes('/host.exp.exponent/cache/ImagePicker/');
}

export function getDisplayImageUri(uri) {
  if (typeof uri !== 'string') return '';
  const value = uri.trim();
  if (!value) return '';
  if (isTemporaryImageUri(value)) return value;
  if (!/^https?:\/\//i.test(value)) return '';
  return value;
}

export function getRemoteImageUri(uri) {
  if (typeof uri !== 'string') return '';
  const value = uri.trim();
  if (!value || isTemporaryImageUri(value)) return '';
  if (!/^https?:\/\//i.test(value)) return '';
  return value;
}
