# Card Payment Demo

A mocked card payment page built with **Next.js** that demonstrates PCI-scoped iframe architecture using browser `window.postMessage` events to communicate between the main page and a **Hosted Payment Page (HPP)** served inside an `<iframe>`.

---

### Message Flow

| # | Direction       | Event                    | Description                                  |
|---|-----------------|--------------------------|----------------------------------------------|
| 1 | parent → iframe | `VALIDATE_AND_TOKENISE`  | Triggered when user clicks Pay               |
| 2 | iframe → parent | `VALIDATION_FAILED`      | Sent if any field fails validation           |
| 3 | iframe → parent | `TOKENISING`             | Notifies parent that mock tokenise is running|
| 4 | iframe → parent | `TOKEN_READY`            | Returns `{ token, last4, brand, expiry }`    |
| 5 | parent → (mock) | Payment request          | Main page calls mock payment API with token  |
| 6 | parent → iframe | `CLEAR_FORM`             | Resets form fields after successful payment  |

---

## Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher

### Installation

```bash
git clone https://github.com/evan-erasmus/card-payment-app.git
cd card-payment-app

npm install

npm run dev
```

Open http://localhost:3000?debug=true in your browser.

### Production Build

```bash
npm run build
npm start
```

Open http://localhost:3000 in your browser.

### With Docker

```bash
docker build -t card-payments-app:latest .
docker run -p 3000:3000 card-payments-app
```

To use another port, just change the command to `docker run -p <your-chosen-port>:3000 card-payments-app`

---

## Project Structure

```
card-payment-app/
├── app/
│   ├── components/
│   │   ├── payment-page/         # Components used in PaymentPage
│   │   └── PaymentPage.tsx       # Main Next.js payment UI
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
└── public/
    └── hosted-payment/
        └── index.html            # Vanilla HTML Hosted Payment Page (iframe)
```

---

## Test Cases

### Test Case 1 — Successful New Card Payment

**Goal:** Verify the full happy-path flow: style injection → form fill → validation → tokenisation → payment authorisation.

**Steps:**

1. Open http://localhost:3000?debug=true
2. Observe the **Event Log** panel
3. Fill in the card form:
   - **Cardholder Name:** `Test User`
   - **Card Number:** `4242 4242 4242 4242` *(Visa — passes Luhn)*
   - **Expiry:** `12 / 26`
   - **CVV:** `123`
4. Click **Pay £149.99**
5. Watch the Event Log for: `VALIDATE_AND_TOKENISE` → `TOKENISING` → `TOKEN_READY` → Payment → `AUTH`
6. Green **"Payment Authorised!"** banner appears with a transaction ID

**Expected result:** Payment succeeds; form clears; transaction ID shown.

---

### Test Case 2 — Validation Errors on New Card

**Goal:** Verify that the iframe validates inputs and reports errors back without proceeding to tokenisation.

**Steps:**

1. Open http://localhost:3000
2. Leave all card fields **empty**
3. Click **Pay {Amount}**
4. Event Log shows: `VALIDATE_AND_TOKENISE` sent, then `VALIDATION_FAILED` received
5. All four fields show inline errors in the iframe form
6. Error banner on main page: *"Please fix the errors in the card form."*
7. No tokenisation or payment request appears in the Event Log

**Additional sub-cases:**
- Card number `1234 5678 9012 3456` → *"Card number is invalid."* (Luhn fail)
- Expiry `01 / 20` → *"Card has expired."*
- CVV `12` → *"Enter a valid CVV."*

**Expected result:** Errors shown inline; no tokenisation; no payment fired.

---

### Test Case 3 — Pay with a Saved Card

**Goal:** Verify selecting a stored card bypasses the iframe and uses the saved token directly.

**Steps:**

1. Open http://localhost:3000
2. Click **Visa ····4242** in the Saved Cards section — it highlights with a checkmark
3. The new card iframe disappears
4. Click **Pay £149.99**
5. Event Log shows: `Payment request (saved card)` then `AUTH`
6. Green success banner appears

**Expected result:** Payment uses saved token; iframe not involved.

---

### Test Case 4 — Save a New Card

**Goal:** Verify that toggling "Save card" persists the new card in the saved cards list.

**Steps:**

1. Open http://localhost:3000
2. Enable the **"Save card for future payments"** toggle (turns blue)
3. Fill in:
   - **Name:** `New Cardholder`
   - **PAN:** `5500 0000 0000 0004` *(Mastercard)*
   - **Expiry:** `10 / 27`
   - **CVV:** `321`
4. Click **Pay £149.99**
5. After success, a third saved card `Mastercard ····0004` appears in Saved Cards
6. Event Log shows `SAVE Card saved: ····0004`
7. Click **Make Another Payment** → select the new card → pay again successfully

**Expected result:** Card is saved and reusable in subsequent payments.

---

## The Repository

Github actions is used to:
1. Run unit tests (Jest)
2. Build via npm
3. Build and push docker image (stub)

---

## Notes

- All payment, tokenisation, and card storage are **fully mocked** — no real network calls or sensitive data.
- The iframe uses `sandbox="allow-scripts allow-same-origin"` to restrict capabilities while permitting `postMessage`.