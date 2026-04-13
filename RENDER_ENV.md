# Render Environment Variables Guide

To ensure everything works correctly on Render, please set the following environment variables in your Render Dashboard.

## Backend (Web Service)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment mode | `production` |
| `FRONTEND_URL` | Your frontend's URL | `https://transly-frontend.onrender.com` |
| `JWT_SECRET` | Secret for tokens | `your_super_secret_key` |
| `SESSION_SECRET` | Secret for sessions | `another_secret_key` |
| `DB_NAME` | Database name | `transly_db` |
| `DB_USER` | Database user | `ptb` |
| `DB_PASS` | Database password | `********` |
| `DB_HOST` | Database host | `dpg-xxx-a.render.com` |
| `REDIS_URL` | Redis internal URL | `redis://red-xxx:6379` |
| `SMTP_HOST` | SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `465` (Secure) or `587` |
| `SMTP_USER` | SMTP email | `your-email@gmail.com` |
| `SMTP_PASS` | **App Password** | `xxxx xxxx xxxx xxxx` (NOT your Gmail password) |
| `SMTP_FROM_EMAIL` | From address | `noreply@transly.com` |

## Frontend (Static Site/Web Service)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Backend URL | `https://transly-api.onrender.com` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | From Google Cloud | `xxx-yyy.apps.googleusercontent.com` |

> [!TIP]
> **Emails Not Sending?**
> If you are using Gmail, make sure you have **2-Step Verification** enabled and have created an **App Password** for the `SMTP_PASS` variable. Render might block standard connections on port 587; try port 465 with the updated code.
