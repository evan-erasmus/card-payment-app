const { detectBrand, luhn, formatPan, formatExpiry, validateCardFields } = require('../../public/hosted-payment/script.utils');

describe('detectBrand', () => {
  test('detects Visa', () => expect(detectBrand('4111111111111111')).toBe('visa'));
  test('detects Mastercard (5x)', () => expect(detectBrand('5500000000000004')).toBe('mastercard'));
  test('detects Mastercard (2x)', () => expect(detectBrand('2221000000000009')).toBe('mastercard'));
  test('detects Amex', () => expect(detectBrand('378282246310005')).toBe('amex'));
  test('detects Discover', () => expect(detectBrand('6011111111111117')).toBe('discover'));
  test('returns empty string for unknown', () => expect(detectBrand('9999999999999999')).toBe(''));
  test('handles spaces in input', () => expect(detectBrand('4111 1111 1111 1111')).toBe('visa'));
});

describe('luhn', () => {
  test('passes valid Visa test number', () => expect(luhn('4111111111111111')).toBe(true));
  test('passes valid Mastercard test number', () => expect(luhn('5500000000000004')).toBe(true));
  test('passes valid Amex test number', () => expect(luhn('378282246310005')).toBe(true));
  test('fails invalid number', () => expect(luhn('1234567890123456')).toBe(false));
  test('fails single digit change', () => expect(luhn('4111111111111112')).toBe(false));
});

describe('formatPan', () => {
  test('formats 16 digits into groups of 4', () => expect(formatPan('4111111111111111')).toBe('4111 1111 1111 1111'));
  test('formats partial input', () => expect(formatPan('41111')).toBe('4111 1'));
  test('strips non-digits', () => expect(formatPan('4111-1111-1111-1111')).toBe('4111 1111 1111 1111'));
  test('handles empty string', () => expect(formatPan('')).toBe(''));
});

describe('formatExpiry', () => {
  test('formats MM/YY correctly', () => expect(formatExpiry('1226')).toBe('12 / 26'));
  test('handles partial month input', () => expect(formatExpiry('12')).toBe('12 / '));
  test('single digit stays as-is', () => expect(formatExpiry('1')).toBe('1'));
  test('strips non-digits', () => expect(formatExpiry('12/26')).toBe('12 / 26'));
});

describe('validateCardFields', () => {
  const validCard = {
    name: 'Jane Doe',
    pan: '4111 1111 1111 1111',
    expiry: '12 / 99',
    cvv: '123',
  };

  test('passes with valid inputs', () => {
    const { valid, errors } = validateCardFields(validCard);
    expect(valid).toBe(true);
    expect(errors).toEqual({});
  });

  test('fails with empty name', () => {
    const { valid, errors } = validateCardFields({ ...validCard, name: '' });
    expect(valid).toBe(false);
    expect(errors.name).toBeDefined();
  });

  test('fails with single character name', () => {
    const { valid, errors } = validateCardFields({ ...validCard, name: 'J' });
    expect(valid).toBe(false);
    expect(errors.name).toBeDefined();
  });

  test('fails with invalid PAN (too short)', () => {
    const { valid, errors } = validateCardFields({ ...validCard, pan: '4111' });
    expect(valid).toBe(false);
    expect(errors.pan).toBeDefined();
  });

  test('fails with PAN that fails Luhn', () => {
    const { valid, errors } = validateCardFields({ ...validCard, pan: '4111 1111 1111 1112' });
    expect(valid).toBe(false);
    expect(errors.pan).toMatch(/invalid/i);
  });

  test('fails with expired card', () => {
    const { valid, errors } = validateCardFields({ ...validCard, expiry: '01 / 20' });
    expect(valid).toBe(false);
    expect(errors.expiry).toMatch(/expired/i);
  });

  test('fails with invalid month 13', () => {
    const { valid, errors } = validateCardFields({ ...validCard, expiry: '13 / 99' });
    expect(valid).toBe(false);
    expect(errors.expiry).toMatch(/month/i);
  });

  test('fails with short expiry', () => {
    const { valid, errors } = validateCardFields({ ...validCard, expiry: '12' });
    expect(valid).toBe(false);
    expect(errors.expiry).toBeDefined();
  });

  test('fails with CVV too short', () => {
    const { valid, errors } = validateCardFields({ ...validCard, cvv: '12' });
    expect(valid).toBe(false);
    expect(errors.cvv).toBeDefined();
  });

  test('accumulates multiple errors at once', () => {
    const { valid, errors } = validateCardFields({ name: '', pan: '', expiry: '', cvv: '' });
    expect(valid).toBe(false);
    expect(Object.keys(errors).length).toBe(4);
  });
});
