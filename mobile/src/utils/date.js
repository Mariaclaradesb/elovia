export function isoToDisplayDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return '';
  }

  const [year, month, day] = value.split('-');
  return `${day}-${month}-${year}`;
}

export function displayToIsoDate(value) {
  if (!value || !/^\d{2}-\d{2}-\d{4}$/.test(value)) {
    return value;
  }

  const [day, month, year] = value.split('-');
  return `${year}-${month}-${day}`;
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
