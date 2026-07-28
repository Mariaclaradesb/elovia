export function formatCpf(value = '') {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function cleanCpf(value = '') {
  return value.replace(/\D/g, '').slice(0, 11);
}

export function formatPhone(value = '') {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (!digits) {
    return '';
  }

  if (digits.length <= 2) {
    return digits.replace(/(\d{0,2})/, '($1');
  }

  if (digits.length <= 7) {
    return digits.replace(/(\d{2})(\d{0,1})(\d{0,4})/, '($1) $2 $3').trim();
  }

  return digits.replace(/(\d{2})(\d{1})(\d{4})(\d{0,4})/, '($1) $2 $3-$4').trim();
}

export function cleanPhone(value = '') {
  return value.replace(/\D/g, '').slice(0, 11);
}
