# Security Review Summary

## Scope
The review covered the Express API and React client in this portfolio project, with emphasis on authentication, authorization, input handling, and common web application risks.

## Findings

### 1) JWT secret is not enforced and may be missing or weak
- File: `server/index.js` and `server/controllers/auth-controller.js`
- Risk: `jwt.sign(..., process.env.JWT_SECRET)` is used without validating that a strong secret exists. If `JWT_SECRET` is missing, empty, or weak in production, the application may generate tokens that are trivially forgeable or fail unexpectedly.
- Impact: Authentication bypass, session forgery, or broken admin access.
- Recommendation: Require a non-empty, strong JWT secret at startup and fail closed if it is absent or too short.

### 2) Authentication and admin endpoints are not protected against unauthorized access to the contact and profile management APIs
- File: `server/router/contact-router.js`, `server/router/profile-router.js`, `server/router/project-router.js`, `server/router/skill-router.js`
- Risk: Some state-changing endpoints are protected by `protect`, but the project lacks a robust role/permission model. The system currently treats any authenticated user as an admin, and the app exposes update/delete operations that can mutate portfolio content if tokens are stolen or users are created accidentally.
- Impact: Unauthorized modification of contact messages, portfolio content, and admin data.
- Recommendation: Enforce explicit role checks (for example `req.user.role === "admin"`), use strong admin-only routes, and keep the JWT secret and credentials in a secure deployment secret manager.

### 3) Broad CORS configuration allows any origin
- File: `server/index.js`
- Risk: CORS is configured with `origin: (origin, callback) => callback(null, true)`, which effectively allows any origin to make cross-site requests to the API.
- Impact: Increased exposure to cross-origin abuse, especially when the API contains authenticated endpoints or sensitive data.
- Recommendation: Restrict origins to trusted frontend domains and allow credentials only for known origins.

### 4) Public-facing input is accepted without strict validation or sanitization
- File: `server/controllers/contact-controller.js`, `server/controllers/project-controller.js`, `server/controllers/profile-controller.js`, `server/controllers/auth-controller.js`
- Risk: User-generated fields such as `name`, `email`, `subject`, `message`, `title`, `description`, and profile fields are stored directly without validation beyond presence checks. This is prone to malformed input, injection attempts, and downstream XSS when rendered in a client or admin UI.
- Impact: Stored XSS, malformed data, and abusive or malicious submissions.
- Recommendation: Validate types, enforce length boundaries, normalize email addresses, and sanitize HTML or dangerous strings before persisting and rendering them.

### 5) Password change flow has weak protection against missing validation and accidental overwrite paths
- File: `server/controllers/auth-controller.js`
- Risk: `user.password = newPassword; await user.save();` updates the password without explicitly revalidating the new value beyond length. The pre-save hook will hash it, but this pattern still permits weak or uncommon password inputs and can overwrite data if the middleware is not strictly controlling the object shape.
- Impact: Weak passwords or accidental credential disruption.
- Recommendation: Require stronger password policy checks, confirm password confirmation if relevant, and ensure the update path is restricted to the authenticated user.

## Overall Assessment
The project does not appear to include obvious critical vulnerabilities such as SQL injection or direct remote code execution, but it does have several important hardening gaps. The main concerns are weak/ambiguous auth configuration, permissive CORS, insufficient input validation, and lack of role-based authorization. These are the highest-priority areas to address before deployment to production.

## Suggested Priorities
1. Enforce strong JWT secret configuration and restrict CORS to trusted origins.
2. Add explicit admin-role checks on all management endpoints.
3. Validate and sanitize user-provided input and enforce password policy.
4. Review any admin UI rendering to ensure user-controlled strings are escaped safely.
