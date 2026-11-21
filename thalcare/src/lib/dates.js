// Local-calendar date helpers. toISOString() returns the UTC date, which is the
// wrong day for users east of UTC (e.g. East Africa, UTC+3) in the early hours.
export function localDateStr(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Parse 'YYYY-MM-DD' as a local calendar date (new Date('YYYY-MM-DD') is UTC midnight).
export function parseLocalDate(str) {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(str, n) {
  const d = parseLocalDate(str)
  d.setDate(d.getDate() + n)
  return localDateStr(d)
}

// Whole calendar days from a to b (both 'YYYY-MM-DD'); immune to DST shifts.
export function daysBetween(a, b) {
  const [ay, am, ad] = a.split('-').map(Number)
  const [by, bm, bd] = b.split('-').map(Number)
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000)
}
