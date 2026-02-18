# EduQuiz Vajra - Security Documentation & Compliance Report

## Executive Summary
This document outlines the security architecture and data protection measures implemented in the **EduQuiz Vajra** platform. It is intended for government compliance review and technical auditing. The platform adheres to industry-standard security protocols to ensure the confidentiality, integrity, and availability of student and institutional data.

---

## 1. Authentication & Access Control

### 1.1 Secure Authentication (OAuth 2.0 / JWT)
- **JSON Web Tokens (JWT):** The platform uses stateless JWT authentication for all user sessions (Admin, Faculty, and Students).
- **Token Handling:** Tokens are signed using a strong `HS256` algorithm with a securely managed 256-bit secret key.
- **Session Expiry:** All sessions have a strictly enforced expiration time (default: 24 hours), mitigating the risk of session hijacking.
- **Cookie Security:** Admin authentication tokens are stored in `HttpOnly` and `Secure` cookies, preventing Access via client-side scripts (XSS attacks).

### 1.2 Role-Based Access Control (RBAC)
The system enforces strict privilege separation:
- **Super Admin:** Full system access (User management, Global settings).
- **Faculty/School Admin:** Restricted access only to their specific school's students and data.
- **Student:** Read-only access to their own profile and assigned quizzes.
- **Middleware Enforcement:** Server-side middleware (`middleware.ts`) intercepts every request to validate the user's role before granting access to regulated routes.

---

## 2. Data Protection & Encryption

### 2.1 Password Security
- **Hashing Algorithm:** All passwords are hashed using **bcrypt** (a cryptographic hash function) with a robust salt work factor before storage.
- **No Plaintext Storage:** Passwords are never stored in plain text. Even with database access, an attacker cannot retrieve user passwords.
- **Blind Verification:** The system verifies passwords by hashing the input and comparing the hash, ensuring the actual password is never exposed in memory during validation.

### 2.2 Data Transmission (in Transit)
- **TLS/SSL Encryption:** The application is designed to run exclusively over **HTTPS**. All data transmitted between the client (browser) and server is encrypted using Transport Layer Security (TLS 1.2/1.3).
- **API Security:** All API endpoints perform strict validation of input data to prevent injection attacks.

### 2.3 Data Storage (at Rest)
- **Database Security:** Hosted on secure MongoDB clusters with IP whitelisting.
- **Schema Validation:** Strict Mongoose schemas prevent "NoSQL Injection" attacks by validating data types and structures before any database query is executed.

---

## 3. Threat Mitigation

### 3.1 Cross-Site Scripting (XSS) Protection
- **Content Sanitization:** The frontend (React/Next.js) automatically escapes content by default, preventing the injection of malicious scripts into web pages.
- **HttpOnly Cookies:** Critical authentication tokens are inaccessible to JavaScript, neutralizing the impact of potential XSS vulnerabilities.

### 3.2 Cross-Site Request Forgery (CSRF)
- **SameSite Cookie Policy:** Cookies are configured with `SameSite=Strict` or `Lax` attributes to prevent unauthorized external sites from initiating requests on behalf of a logged-in user.

### 3.3 Rate Limiting & DoS Protection
- **API Throttling:** (Recommended Configuration) The infrastructure supports rate limiting on API routes to prevent brute-force attacks on login endpoints.

---

## 4. Audit & Compliance

### 4.1 Activity Logging
- **Login Audits:** The system logs authentication attempts, allowing administrators to detect suspicious activity (e.g., multiple failed login attempts).
- **Last Active Monitoring:** Student activity is tracked via `lastActiveAt` timestamps to monitor engagement and detect anomalies.

### 4.2 Privacy Preservation
- **Minimal Data Collection:** The platform collects only essential data required for educational purposes (Name, Class, ID), adhering to data minimization principles.

---

## 5. Deployment Security Checklist

| Security Measure | Status | Implementation Details |
| :--- | :--- | :--- |
| **HTTPS Enforcement** | ✅ implemented | Server configuration redirects HTTP to HTTPS. |
| **Database Encryption** | ✅ implemented | MongoDB Atlas encryption at rest. |
| **Input Validation** | ✅ implemented | Zod/Mongoose validation on all API inputs. |
| **Dependency Scanning** | ✅ monitored | Regular `npm audit` checks for vulnerable packages. |

---

**Conclusion:**
EduQuiz Vajra is built with a "Security First" approach. The implementation of modern encryption, strict access controls, and secure coding practices ensures that the platform is robust against common web vulnerabilities and is safe for deployment in government or educational institutions.
