/** Timestamp Firestore, Date o ISO string → Date valida, altrimenti null */
export function redeemedAtToDate(value) {
  if (value == null) return null
  if (typeof value.toDate === 'function') return value.toDate()
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export function accountHasRedeemedAt(data) {
  return redeemedAtToDate(data?.redeemed_at) != null
}
