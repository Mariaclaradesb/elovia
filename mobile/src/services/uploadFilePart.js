export async function appendUploadFile(data, fieldName, file, fallbackName = 'arquivo', fallbackType = 'application/octet-stream') {
  if (!file) return false;

  const name = file.fileName || file.name || fallbackName;
  const type = file.mimeType || file.type || fallbackType;

  if (file.file) {
    data.append(fieldName, file.file, name);
    return true;
  }

  if (isBrowserBlobUri(file.uri)) {
    const blob = await fetch(file.uri).then((response) => response.blob());
    data.append(fieldName, blob, name);
    return true;
  }

  data.append(fieldName, {
    uri: file.uri,
    name,
    type,
  });
  return true;
}

function isBrowserBlobUri(uri) {
  return typeof window !== 'undefined'
    && typeof uri === 'string'
    && (uri.startsWith('blob:') || uri.startsWith('data:'));
}
