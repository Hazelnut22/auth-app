# AuthApp

This is a full-stack authentication prototype which uses cybersecurity principles and secure system design. This website is built with React (frontend) and Node.js/Express (backend), using MongoDB as the database. This utilizes MERN stack. 

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Tech Stack](#tech-stack)
- [Authentication Flow](#authentication-flow)
- [Endpoints](#endpoints)

---

## Features

- 1. **Self-Built Canvas CAPTCHA**: A custom text-based CAPTCHA system was built without using any third-party service.

- 2. **Password Hashing**: Using Argon2id, the winner of the Password Hashing Competition (2015), passwords are hased stored in the database. 

- 3. **Password Policy**: Minimum 8 characters, Uppercase, Number, Special character, no repeating or consecutive characters, Password history, and Password expiration date is enforced.

- 4. **Multi-Factor Authentication (MFA)**: Username and password, and TOTP (Time-based One-Time Password) or Email OTP code via Nodemailer

- 5. **Email Verification on Registration**: New accounts are not usable until email is verified.

- 6. **JWT Session**: JSON Web Tokens stored in HttpOnly cookies and token purposes (`access`, `mfa_pending`, `password_reset`) guarded.

- 7. **Middleware**: Captcha, Helmet, IP Rate Limiting, and Account lockedout for 15 minutes after 5 failed login attempts

- 8. **Activity Log**: Every security events (REGISTER_SUCCESS, LOGIN_SUCCESS, LOGIN_FAILED, ACCOUNT_LOCKED, LOGOUT, MFA_ENABLED, MFA_DISABLED, PASSWORD_CHANGED, and PASSWORD_RESET) are recorded in database and displayed in the dashboard.

- 9. **Password Reset**: OTP sent to email, verify OTP, and set new password (new password cannot be one of last 5 used passwords).

- 10. **Input Validation and Sanitisation**: Request bodies are validated with express-validator. 

## Installation

### Prerequisites

- **Node.js** v20+
- **MongoDB** MongoDB Atlas connection string
- **Gmail account** with an App Password generated
- **Authenticator App** Any authenticator app to test functionality

### 1. Clone the repository:

```bash
git clone https://github.com/Hazelnut22/auth-app.git
cd auth-app
```

### 2. Install backend dependencies:

```bash
cd backend
npm install
```

### 3. Setup Enviornment Variables - Create a .env file at the root of backend folder with the following:

```bash
PORT=7001
SESSION_SECRET=my-session-secret
NODE_ENV=development
CONNECTION_STRING=your_mongodb_database_connection_url
JWT_SECRET=your-64-char-random-string-here
EMAIL_NAME=yourgmail@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx   # Gmail App Password (16 chars)
PASSWORD_EXPIRY_DAYS=90
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_MINUTES=15
FRONTEND_ORIGIN=http://localhost:5173
```

**How to generate JWT secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**How to get a Gmail App Password:**
1. Go to `myaccount.google.com`
2. Type App Passwords in Search bar and click it
3. Type in App name and click Create
4. Copy the 16-character password into `EMAIL_PASSWORD` and your email to `EMAIL_NAME`

### 4. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

### 5. Setup Enviornment Variables - Create a .env file at the root of frontend folder with the following:

```env
VITE_API_URL=http://localhost:7001
```

### Running the Website

### Start the backend

```bash
cd backend
npm run dev
```

### Start the frontend

```bash
cd frontend
npm run dev
```

---

## Configuration

### The application relies on the following environment variables:

#### CONNECTION_STRING: Connection string for MongoDB
#### JWT_SECRET: For signing the tokens
#### EMAIL_NAME and EMAIL_PASSWORD: Email service credentials to send OTPs for email-based MFA
#### FRONTEND_ORIGIN: Frontend url for CORS restriction
#### VITE_API_URL: Backend url for connection

---

## Tech Stack

| Frontend | React + Vite | UI framework |
| Backend | Node.js + Express | REST API server |
| Database | MongoDB + Mongoose | Data persistence |
| Password hashing | Argon2id | Secure password storage |
| MFA | speakeasy | TOTP generation and verification |
| QR codes | qrcode | MFA setup QR code generation |
| CAPTCHA | Custom canvas + JWT | Bot prevention |
| Session | jsonwebtoken | Signed session tokens |
| Email | Nodemailer + Gmail | OTP code send |
| Security headers | Helmet | HTTP header hardening |
| Rate limiting | express-rate-limit | Brute-force prevention |
| Validation | express-validator | Input validation |
| Icons | lucide-react | UI icons |

---

## Authentication Flow

```
Registration Flow
  Fill form (full name, email, password, confirm password, CAPTCHA) → CAPTCHA is verified first in server → Password policy checked and hashed with Argon2id → Activation OTP sent to email → Enter OTP → Account activated

LOGIN
  Enter email, password, and CAPTCHA → CAPTCHA is verified first in server → User exist checked → Account lockout checked → Verify password 
  → if MFA disabled (session cookie issued) 
  → if MFA enabled (mfa_pending cookie issued) → Enter TOTP code or request email OTP → enter code → session cookie issued

FORGOT PASSWORD
  Enter email → OTP emailed → Enter OTP code → issue password_reset cookie → Enter new password → Checked against last 5 passwords → Password updated

CHANGE PASSWORD
  Enter current, new password, and new password confirm → Current password verified → New password checked against last 5 passwords → Password changed
```

---

## Endpoints

### REST API
- Endpoint: /app/auth/captcha
- Method: GET
- Response:
```bash
{
    "message": "CAPTCHA generated."
}
```

- Endpoint: /app/auth/register
- Method: POST
- Request:
```bash
{
    "username": "Kylie",
    "email": "kylie@gmail.com",
    "password": "Welcome@12345",
    "captchaToken": "CAPTCHA_TOKEN",
    "captchaAnswer": "1J9sd2"
}
```
- Response:
```bash
{
    "message": "Account created. Check your email for an activation code."
}
```

- Endpoint: /app/auth/activate
- Method: POST
- Request:
```bash
{
    "email": "kylie@gmail.com",
    "otp": "442513"
}
```
- Response:
```bash
{
    "message": "Account activated. You can now log in."
}
```

- Endpoint: /app/auth/activate/resend
- Method: POST
- Request:
```bash
{
    "email": "kylie@gmail.com"
}
```
- Response:
```bash
{
    "message": "Activation code sent. It expires in 2 minutes."
}
```

- Endpoint: /app/auth/activate/login
- Method: POST
- Request:
```bash
{
    "email": "kylie@gmail.com",
    "password": "Welcome@12345",
    "captchaToken": "CAPTCHA_TOKEN",
    "captchaAnswer": "1J9sd2"
}
```
- Response:
```bash
{
    "message": "Login successful."
}
```

- Endpoint: /app/auth/activate/status
- Method: GET
- Response:
```bash
{
    "message": "Status retrieved."
    "data": { /* User information ( username, email, isMfaActive, passwordExpired, daysUntilExpiry, memberSince, lastLoginAt, and recent activity ) */ }
}
```

- Endpoint: /app/auth/activate/logout
- Method: POST
- Response:
```bash
{
    "message": "Logged out successfully."
}
```

- Endpoint: /app/auth/activate/2fa/setup
- Method: POST
- Response:
```bash
{
    "message": "MFA setup initiated. Scan the QR code."
}
```

- Endpoint: /app/auth/activate/2fa/verify
- Method: POST
- Request:
```bash
{
    "token": "123456"
}
```
- Response:
```bash
{
    "message": "2FA verified. Login complete."
}
```

- Endpoint: /app/auth/activate/2fa/reset
- Method: POST
- Response:
```bash
{
    "message": "2FA disabled successfully."
}
```

- Endpoint: /app/auth/activate/2fa/email/send
- Method: POST
- Request:
```bash
{
    "email": "kylie@gmail.com"
}
```
- Response:
```bash
{
    "message": "A verification code has been sent to your email. It expires in 5 minutes."
}
```

- Endpoint: /app/auth/activate/2fa/email/verify
- Method: POST
- Request:
```bash
{
    "otp": "123456"
}
```
- Response:
```bash
{
    "message": "Email verified successfully."
}
```

- Endpoint: /app/auth/activate/password/forgot
- Method: POST
- Request:
```bash
{
    "email": "kylie@gmail.com"
}
```
- Response:
```bash
{
    "message": "A reset code has been sent to your email."
}
```

- Endpoint: /app/auth/activate/password/verify
- Method: POST
- Request:
```bash
{
    "email": "kylie@gmail.com"
    "otp": "123456"
}
```
- Response:
```bash
{
    "message": "Code verified. You may now reset your password."
}
```

- Endpoint: /app/auth/activate/password/reset
- Method: POST
- Request:
```bash
{
    "newPassword": "yournewpassword"
}
```
- Response:
```bash
{
    "message": "Password reset successfully. You can now log in."
}
```

- Endpoint: /app/auth/activate/password/change
- Method: POST
- Request:
```bash
{
    "currentPassword": "Welcome@12345",
    "newPassword": "01020344df@"
}
```
- Response:
```bash
{
    "message": "Password changed successfully."
}
```
---