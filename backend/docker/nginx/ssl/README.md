# TLS/SSL Certificates

Place your SSL certificates here:

- `fullchain.pem` — Full certificate chain
- `privkey.pem` — Private key

## For local development (self-signed)

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout privkey.pem -out fullchain.pem \
  -subj "/CN=localhost"
```

## For production

Use [Let's Encrypt](https://letsencrypt.org/) with certbot:

```bash
certbot certonly --webroot -w /var/www/certbot -d your-domain.com
```

Then uncomment the HTTPS server block in `nginx.conf`.
