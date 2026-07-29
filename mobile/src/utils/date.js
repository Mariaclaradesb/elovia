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
    return '';
  }

  const [day, month, year] = value.split('-');
  const isoDate = `${year}-${month}-${day}`;
  return isValidIsoDate(isoDate) ? isoDate : '';
}

export function isValidIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day;
}

export function normalizeDateForApi(value) {
  const text = String(value || '').trim();
  if (isValidIsoDate(text)) {
    return text;
  }

  const displayDate = displayToIsoDate(text);
  if (displayDate) {
    return displayDate;
  }

  // Corrige valores legados que foram montados como AAAA-DD-MM.
  const legacyMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (legacyMatch) {
    const [, year, day, month] = legacyMatch;
    const correctedDate = `${year}-${month}-${day}`;
    if (Number(day) > 12 && isValidIsoDate(correctedDate)) {
      return correctedDate;
    }
  }

  return '';
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
