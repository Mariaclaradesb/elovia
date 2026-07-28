export function isoToDisplayDate(value) {
  if (!value) {
    return '';
  }

  const datePart = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return '';
  }

  const [year, month, day] = datePart.split('-');
  return `${day}-${month}-${year}`;
}

export function displayToIsoDate(value) {
  if (!value || !/^\d{2}-\d{2}-\d{4}$/.test(value)) {
    return value;
  }

  const [day, month, year] = value.split('-');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
}

export function isoToDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date();
  }

  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function dateToIso(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
