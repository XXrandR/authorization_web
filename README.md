# Protector Identity Web

The account experience for the Protector OAuth 2.1 authorization server. It is
designed to be reverse-proxied on the **same public origin** as
`authorization_api`; this is required for secure browser login sessions and
CSRF protection.

## Implemented account flows

- username/email + password sign-in through the authorization server session;
- public account registration and email verification;
- password-reset request and confirmation;
- same-origin CSRF bootstrap for every state-changing browser request;
- local development rewrites for API, OAuth, OIDC discovery, and login routes.

The browser never stores OAuth access or refresh tokens. This site handles the
user’s authorization-server session. Each product application owns its own
OAuth authorization-code + PKCE callback and token lifecycle.

## Local development

Run the API on port `8080` and configure SMTP (Mailpit on port `1025` is a
convenient local option). Then run:

```bash
npm install
npm run dev
```

By default, Next proxies API requests to `http://localhost:8080`. Override that
with `AUTHORIZATION_API_URL` if necessary. In production, your edge/reverse
proxy must route `/api`, `/oauth2`, `/.well-known`, `/login`, and `/oauth2/jwks`
to the API while serving this Next application under the same HTTPS origin.

See [docs/client-integration.md](docs/client-integration.md) for web, mobile,
and backend integration contracts.