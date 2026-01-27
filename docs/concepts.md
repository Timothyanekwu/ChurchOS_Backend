# Technical Concepts & Architecture

This document explains the core technologies and patterns used in the ChurchOS backend to help you understand how everything fits together.

---

## 🔐 Authentication: JWT (Json Web Tokens)

We use JWTs to handle authentication because they are stateless, meaning the server doesn't need to store session data in a database for every logged-in user.

### Access Token vs. Refresh Token
Think of these as a **short-term visitor pass** and a **long-term master ID**.

#### 🔑 Access Token
- **Lifespan**: Short (15 minutes).
- **Usage**: Sent in the `Authorization` header for every protected request.
- **Security**: Because it expires quickly, if it's stolen, the attacker has a very small window to use it.

#### 🔄 Refresh Token
- **Lifespan**: Long (7 days).
- **Usage**: Only used to request a *new* Access Token when the old one expires.
- **Security**: Should be stored more securely (like an `HttpOnly` cookie). It allows users to stay logged in without typing their password every 15 minutes.

---

## 📊 Database: Mongoose Patterns

### Statics vs. Methods
When defining the `User` model, we use **Statics**.
- **Statics**: These are methods called on the **Model** itself (e.g., `User.login()`). They are like "Class Methods".
- **Methods**: These are called on a **specific user instance** (e.g., `user.comparePassword()`).

In ChurchOS, we prioritize Statics for logic like `register`, `login`, and `deleteUser` to keep the controllers clean.

### Pre-Save Middleware
We use Mongoose `pre('save')` hooks to automatically hash passwords.
- **How it works**: Every time a user is created or their password is changed, Mongoose intercepts the save process, hashes the password using `bcryptjs`, and then saves the hash instead of the plain text.

---

## 🧱 Middleware Architecture

Middleware functions in Express are functions that have access to the `Request` object (`req`), the `Response` object (`res`), and the `next` function in the application’s request-response cycle.

### Custom Logger
Every request is passed through our logger:
```javascript
app.use((req, res, next) => {
  console.log(`${req.method} :: ${req.originalUrl}`);
  next();
});
```
- **Why?**: It gives us instant visibility in the console into what endpoints are being hit.

### Auth Guard (`protect`)
The `protect` middleware acts as a security gate.
- It extracts the JWT from the `Authorization` header.
- It verifies if the token is valid.
- If valid, it attaches the User object to the `req` object (`req.user = user`), making it available to the controller.

---

## 📂 Folder Reorganization (`sup_`)
The project uses specific prefixing for SuperAdmin-related logic (e.g., `sup_model`, `sup_controller`). This helps distinguish core platform logic from potential future sub-platforms or tenant-specific code.
