const { detectBrand, luhn, formatPan, formatExpiry, validateCardFields, BRAND_EMOJIS } = window.HPPUtils;

const panInput    = document.getElementById('pan');
const expiryInput = document.getElementById('expiry');
const cvvInput    = document.getElementById('cvv');
const nameInput   = document.getElementById('cardholder-name');
const brandIcon   = document.getElementById('card-brand-icon');

function setError(field, msg) {
  document.getElementById('error-' + field).textContent = msg;
  document.getElementById('group-' + field).classList.add('has-error');
}

function clearError(field) {
  document.getElementById('error-' + field).textContent = '';
  document.getElementById('group-' + field).classList.remove('has-error');
}

function runValidation() {
  const { valid, errors } = validateCardFields({
    name:   nameInput.value,
    pan:    panInput.value,
    expiry: expiryInput.value,
    cvv:    cvvInput.value,
  });
  ['name', 'pan', 'expiry', 'cvv'].forEach((f) => {
    errors[f] ? setError(f, errors[f]) : clearError(f);
  });
  return valid;
}

function mockTokenise(pan, name, expiry) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const last4 = pan.replace(/\s/g, '').slice(-4);
      const brand = detectBrand(pan);
      const token = 'tok_' + Math.random().toString(36).slice(2, 12).toUpperCase();
      resolve({ token, last4, brand, cardholderName: name, expiry });
    }, 600);
  });
}

panInput.addEventListener('input', (e) => {
  e.target.value = formatPan(e.target.value);
  const brand = detectBrand(e.target.value);
  brandIcon.textContent = BRAND_EMOJIS[brand] ?? '';
  brandIcon.dataset.brand = brand;
  clearError('pan');
});

expiryInput.addEventListener('input', (e) => {
  e.target.value = formatExpiry(e.target.value);
  clearError('expiry');
});

cvvInput.addEventListener('input',  () => clearError('cvv'));
nameInput.addEventListener('input', () => clearError('name'));

window.addEventListener('message', async (event) => {
  const { type } = event.data || {};

  if (type === 'VALIDATE_AND_TOKENISE') {
    if (!runValidation()) {
      parent.postMessage({ type: 'VALIDATION_FAILED' }, '*');
      return;
    }
    parent.postMessage({ type: 'TOKENISING' }, '*');
    try {
      const tokenData = await mockTokenise(panInput.value, nameInput.value.trim(), expiryInput.value);
      parent.postMessage({ type: 'TOKEN_READY', payload: tokenData }, '*');
    } catch (err) {
      parent.postMessage({ type: 'TOKENISE_ERROR', error: err.message }, '*');
    }
    return;
  }

  if (type === 'CLEAR_FORM') {
    document.getElementById('card-form').reset();
    brandIcon.textContent = '';
    ['name', 'pan', 'expiry', 'cvv'].forEach(clearError);
  }
});

window.addEventListener('load', () => {
  parent.postMessage({ type: 'HPP_READY' }, '*');
});
