# Contributing to FixNearby

We love your input! We want to make contributing to FixNearby as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features

## Our Development Process

We use GitHub issues to track public bugs and features. All active development happens in feature branches.
Before submitting code, please review the [API Specification](./API_SPECIFICATION.md) and [Real-Time Socket Protocols](./REALTIME_SOCKET_PROTOCOLS.md).

### Code Review Guidelines

#### Before Submitting
- Run `npm run build` in the `client` folder to verify no build errors
- Run `npm test` in the `server` folder to verify existing tests pass
- Ensure your code follows the existing style patterns (ES modules, async/await, etc.)
- Remove all `console.log` statements unless they are part of the feature
- Verify that all new dependencies are justified and documented

#### Review Checklist
Reviewers will check for:
- **Functionality**: Does the code do what it claims?
- **Security**: Are there injection vectors, XSS risks, or hardcoded secrets?
- **Performance**: Are there N+1 queries, missing indexes, or blocking operations?
- **Error Handling**: Are errors caught and logged appropriately?
- **Accessibility**: Do UI changes include proper ARIA attributes and keyboard navigation?
- **Internationalization**: Are user-facing strings wrapped in translation functions?

#### Review Process
1. At least one maintainer must approve the PR before merging
2. All CI checks must pass (lint, test, build)
3. Changes to `server/` require backend review; changes to `client/` require frontend review
4. Significant architectural changes require team discussion

### Branch Naming Conventions
- Features: `feat/short-description`
- Bug Fixes: `fix/short-description`
- Documentation: `docs/short-description`
- Refactoring: `refactor/short-description`
- Security: `security/short-description`
- Performance: `perf/short-description`

### Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `chore`, `security`
Scopes: `api`, `auth`, `booking`, `chat`, `ui`, `admin`, `deps`

Examples:
- `feat(chat): add typing indicators`
- `fix(booking): prevent double-booking race condition`
- `docs(api): update endpoint documentation`

### Pull Request Checklist

1. Fork the repo and create your branch from `master`.
2. Implement your changes following our [**Developer Guide**](./DEVELOPER_GUIDE.md).
3. Keep changes focused and isolated — one feature per PR.
4. Verify your changes with local tests (`npm test` and `npm run test:new` in `server/`).
5. Ensure the client builds without errors (`cd client && npm run build`).
6. Submit a pull request!

The CI pipeline (defined in `.github/workflows/`) will automatically run tests, linting, and a production build check against your PR. All checks must pass before merging.

### Getting Help

- Check our [FAQ](https://github.com/souma9830/FixNearby/discussions)
- Join our community discussions
- Tag maintainers for review requests
