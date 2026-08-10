# Security Policy

## Supported Versions

We release security patches for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | ✅ Active support  |
| < 1.0   | ❌ No longer supported |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in FixNearby, please follow these steps:

### Private Disclosure Process

1. **Do not** file a public GitHub issue. Instead, email us directly at **security@fixnearby.com** with:
   - A detailed description of the vulnerability
   - Steps to reproduce (PoC preferred)
   - Potential impact assessment
   - Your contact information

2. **Response Timeline:**
   - **24 hours**: Acknowledgment of receipt
   - **72 hours**: Initial assessment and severity classification
   - **7-14 days**: Patch development (critical issues)
   - **30 days**: Public disclosure after patch release

### What to Expect

- You will receive an acknowledgment within 24 hours.
- We will maintain open communication throughout the resolution process.
- You will be credited in our security advisories (unless you prefer anonymity).
- We will notify you when the fix is deployed.

## Security Measures

### IP Reputation Shield & Threat Inspection
- Real-time payload inspection for injection vectors (SQLi, XSS, Path Traversal)
- Dynamic client IP blocklisting with auto-expiring temporary window (10 minutes)
- Specialized authentication rate limiting (10 attempts / 15 minutes) to mitigate credential stuffing

### Authentication & Authorization
- JWT-based authentication with token expiration and blacklisting
- Role-based access control (User, Worker, Admin)
- CSRF protection on all state-changing requests
- Password hashing using bcryptjs with configurable salt rounds

### API Security
- Rate limiting on all endpoints with tiered thresholds
- Helmet.js for HTTP security headers
- CORS with whitelisted origins
- Request payload validation and sanitization
- MongoDB injection prevention through Mongoose schemas

### Data Protection
- All passwords hashed with bcryptjs
- Sensitive fields redacted in logs
- Environment variables for secrets (never hardcoded)
- HTTPS enforced in production
- File upload validation and size limits

### Infrastructure
- Background workers isolated from main process
- Redis-backed rate limiting and queues
- MongoDB connection with minimal privilege principle
- Automated dependency vulnerability scanning

## Security Checklist for Contributors

Before submitting a pull request, verify:

- [ ] No secrets, tokens, or credentials in code
- [ ] Input validation on all user-supplied data
- [ ] Proper authorization checks on protected routes
- [ ] No SQL/NoSQL injection vectors
- [ ] XSS prevention (React's built-in escaping is active)
- [ ] Rate limiting considered for new endpoints
- [ ] Error messages don't leak sensitive information

## Dependency Security

We recommend contributors run:

```bash
npm audit        # Check for known vulnerabilities
npm outdated     # Identify outdated dependencies
```

We also run automated dependency scanning in CI.

## Incident Response Plan

1. **Triage**: Security team confirms vulnerability and classifies severity
2. **Patch**: Fix developed in private fork with tests
3. **Release**: Patch published as hotfix release
4. **Disclosure**: Advisory published after users have time to update

## Bug Bounty

At this time, FixNearby does not offer a formal bug bounty program. However, we gratefully acknowledge security researchers in our release notes.

---

*Last updated: July 2026*
