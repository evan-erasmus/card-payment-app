const BRAND_EMOJIS = { visa: '💳', mastercard: '🟠', amex: '🟦', discover: '🟡' };

function detectBrand(value) {
  const v = value.replace(/\s/g, '');
  if (/^4/.test(v)) return 'visa';
  if (/^5[1-5]|^2[2-7]/.test(v)) return 'mastercard';
  if (/^3[47]/.test(v)) return 'amex';
  if (/^6(?:011|5)/.test(v)) return 'discover';
  return '';
}

function luhn(num) {
  let sum = 0, alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = parseInt(num[i], 10);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function formatPan(raw) {
  const digits = raw.replace(/\D/g, '');
  return digits.match(/.{1,4}/g)?.join(' ') ?? digits;
}

function formatExpiry(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.length >= 2) return digits.slice(0, 2) + ' / ' + digits.slice(2);
  return digits;
}

function validateCardFields({ name, pan, expiry, cvv }) {
  const errors = {};

  if (!name || name.trim().length < 2) {
    errors.name = 'Please enter the cardholder name.';
  }

  const rawPan = pan.replace(/\s/g, '');
  if (!rawPan || rawPan.length < 13 || rawPan.length > 19) {
    errors.pan = 'Enter a valid card number.';
  } else if (!luhn(rawPan)) {
    errors.pan = 'Card number is invalid.';
  }

  const expRaw = expiry.replace(/\s/g, '').replace('/', '');
  if (expRaw.length < 4) {
    errors.expiry = 'Enter expiry as MM/YY.';
  } else {
    const mm = parseInt(expRaw.slice(0, 2), 10);
    const yy = parseInt(expRaw.slice(2, 4), 10);
    const now = new Date();
    const cardYear = 2000 + yy;
    if (mm < 1 || mm > 12) {
      errors.expiry = 'Invalid month.';
    } else if (cardYear < now.getFullYear() || (cardYear === now.getFullYear() && mm < now.getMonth() + 1)) {
      errors.expiry = 'Card has expired.';
    }
  }

  if (!cvv || cvv.trim().length < 3) {
    errors.cvv = 'Enter a valid CVV.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

if (typeof module !== 'undefined') {
  module.exports = { detectBrand, luhn, formatPan, formatExpiry, validateCardFields, BRAND_EMOJIS };
}
