export function textToList(value) {
  if (!value) {
    return [];
  }

  return value
    .split('\n')
    .map((item) => item.replace(/^-\s*/, '').trim())
    .filter(Boolean);
}

export function listToText(items) {
  return items.filter(Boolean).map((item) => `- ${item.trim()}`).join('\n');
}
