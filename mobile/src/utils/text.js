export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'EL';
}

export function firstName(name = '') {
  return name.split(' ')[0] || 'Elovia';
}

export function onlyDigits(value) {
  return value.replace(/\D/g, '');
}
