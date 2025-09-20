// Example utility function for testing
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided')
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw new Error('Invalid amount provided')
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

import { describe, it, expect } from 'vitest';

describe('formatDate', () => {
  it('formats a valid date correctly', () => {
    const date = new Date('2024-01-15')
    expect(formatDate(date)).toBe('January 15, 2024')
  })

  it('formats a date string correctly', () => {
    expect(formatDate('2024-01-15')).toBe('January 15, 2024')
  })

  it('throws error for invalid date', () => {
    expect(() => formatDate('invalid-date')).toThrow('Invalid date provided')
  })

  it('throws error for null date', () => {
    expect(() => formatDate(null as any)).toThrow('Invalid date provided')
  })
})

describe('formatCurrency', () => {
  it('formats USD currency correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })

  it('formats zero amount correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('formats negative amount correctly', () => {
    expect(formatCurrency(-1234.56)).toBe('-$1,234.56')
  })

  it('throws error for invalid amount', () => {
    expect(() => formatCurrency(NaN)).toThrow('Invalid amount provided')
  })

  it('throws error for non-number input', () => {
    expect(() => formatCurrency('123' as any)).toThrow('Invalid amount provided')
  })
}) 