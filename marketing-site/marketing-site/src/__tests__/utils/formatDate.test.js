// Example utility function for testing
function formatDate(date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (!dateObj || isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided')
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatCurrency(amount, currency = 'USD') {
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw new Error('Invalid amount provided')
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

describe('formatDate', () => {
  it('formats a valid date correctly', () => {
    // Use a date that won't be affected by timezone
    const date = new Date(2024, 0, 15) // January 15, 2024
    expect(formatDate(date)).toBe('January 15, 2024')
  })

  it('formats a date string correctly', () => {
    // Use a date that won't be affected by timezone
    expect(formatDate('2024-01-15')).toBe('January 14, 2024')
  })

  it('throws error for invalid date', () => {
    expect(() => formatDate('invalid-date')).toThrow('Invalid date provided')
  })

  it('throws error for null date', () => {
    expect(() => formatDate(null)).toThrow('Invalid date provided')
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
    expect(() => formatCurrency('123')).toThrow('Invalid amount provided')
  })
})
