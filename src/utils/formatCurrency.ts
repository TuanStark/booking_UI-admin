/**
 * Chuẩn hóa giá trị tiền từ API (number hoặc string) để tránh nối chuỗi khi reduce.
 */
export function toMoneyNumber(value: unknown): number {
  if (value == null || value === '') return 0
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }
  const n = Number(String(value).trim())
  return Number.isFinite(n) ? n : 0
}

/**
 * Định dạng số tiền VND (locale vi-VN, ký hiệu ₫).
 */
const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

export function formatVND(
  value: number | string | null | undefined,
): string {
  const n = typeof value === 'string' ? Number(value) : value ?? 0
  const num = Number.isFinite(n) ? n : 0
  return vndFormatter.format(num)
}

/** Số đếm / không phải tiền — nhóm theo chuẩn vi-VN */
export function formatNumberVi(value: number | null | undefined): string {
  const n = value ?? 0
  const num = Number.isFinite(n) ? n : 0
  return new Intl.NumberFormat('vi-VN').format(num)
}
