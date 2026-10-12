# Client integration guide

## One rule for every app

Use OAuth 2.1 **authorization code with PKCE (`S256`)** for every interactive
client. Do not use the password grant, implicit flow, embedded web views, or a
client secret in a browser/mobile app.

| Client          | Redirect URI                                            | Token storage                    | Refresh strategy                                             |
| --------------- | ------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------ |
| Web SPA         | Exact HTTPS callback on the app origin                  | Memory only; prefer a BFF cookie | BFF refreshes server-side, or rotate refresh token in memory |
| Web backoffice  | Exact HTTPS callback                                    | Server-side/BFF session          | BFF only; HttpOnly Secure SameSite cookie                    |
| Android         | Claimed HTTPS App Link or loopback development redirect | Android Keystore                 | Refresh token in Keystore; rotate on every use               |
| iOS             | Universal Link or loopback development redirect         | Keychain                         | Refresh token in Keychain; rotate on every use               |
| Backend service | No user redirect                                        | Secret manager                   | Use `client_credentials`; never a user refresh token         |

## Browser authorization request

Generate one verifier/state/nonce per attempt. Keep them in short-lived
session storage keyed to the transaction, then redirect the browser:

```text
GET /oauth2/authorize?
  response_type=code&
  client_id=YOUR_CLIENT_ID&
  redirect_uri=https%3A%2F%2Fapp.example.com%2Foauth%2Fcallback&
  scope=openid%20profile%20api.read&
  state=RANDOM_CSRF_VALUE&
  nonce=RANDOM_OIDC_NONCE&
  code_challenge=BASE64URL_SHA256_VERIFIER&
  code_challenge_method=S256
```

On callback, verify `state` before doing anything else. Exchange the code from
a BFF whenever possible:

```text
POST /oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
client_id=YOUR_PUBLIC_CLIENT_ID&
redirect_uri=THE_SAME_REGISTERED_URI&
code=CODE_FROM_CALLBACK&
code_verifier=ORIGINAL_VERIFIER
```

For a confidential BFF, authenticate the client at this token request. Public
SPA/native clients send no secret and rely on PKCE.

## Refresh and logout

Use the refresh token only at `/oauth2/token`:

```text
grant_type=refresh_token&refresh_token=CURRENT_REFRESH_TOKEN
```

Replace the old refresh token atomically with the returned token. If refresh
fails, erase local tokens and begin a fresh authorization request. Never send a
refresh token to an unrelated resource API. Use the OIDC end-session endpoint
when registered/logout behaviour is configured; also clear the product app’s
own session.

## Validate tokens at resource APIs

Resource APIs must validate signature from `/oauth2/jwks`, issuer, expiry,
audience, and required scopes. Cache keys by `kid`; do not call the identity
web app to validate each request. Treat the `roles` claim as authorization
data only after issuer/signature validation.

## Client registration checklist

Register each app separately with exact redirect/logout URIs, minimal scopes,
`authorization_code` and `refresh_token` grants, and PKCE required. Public
clients have no secret. Backend-only clients use `client_credentials` and keep
their secret in a secret manager. Registration is an administrator operation;
do not build public dynamic client registration.
