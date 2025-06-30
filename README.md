# Auth PoC Next.js

A small proof-of-concept demonstrating a two-step OTP login flow in Next.js (App Router), using Server Actions, HTTP-only cookies, and JWT session tokens. Includes a guardian-and-child phone-switching demo.

---

## Features

- **Phone-only OTP Login**  
  - Step 1: Enter guardian phone ▶︎ generate & display 6-digit code  
  - Step 2: Enter code ▶︎ issue JWT session if valid  
- **Secure HTTP-only Cookies**  
  - OTP stored in a short-lived cookie  
  - Session JWT stored in a 1-hour cookie  
- **Server Actions** via App Router  
  - `getCode`, `verifyCode`, `selectPhone` isolated in `app/actions/auth.ts`  
- **Reusable JWT Helpers**  
  - Centralized in `lib.ts` (sign/verify tokens, set/clear cookies)  
- **Child-Number Switching**  
  - Dashboard shows guardian’s children phones  
  - Click to swap “active” phone in the session JWT  

---

## Demo

1. **GET** `/` ▶︎ Login page  
2. Submit known guardian phone ▶︎ code appears on screen  
3. Enter that code ▶︎ redirect to `/dashboard`  
4. Click on any child phone ▶︎ updates “active” phone without re-login

---

## Prerequisites

- Node.js ≥ 18  
- pnpm (or npm/yarn)  
- Git (for cloning)

---

## Installation

```bash
# Clone the repo
git clone https://github.com/your-username/auth-poc-next.git
cd auth-poc-next

# Install dependencies
pnpm install

# Run development server
pnpm dev
