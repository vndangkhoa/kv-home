# Security & Anti-DDoS Guide

To fully protect your Synology NAS from DDoS attacks and hide your home IP address, you must use a reverse proxy service like **Cloudflare**. Frontend code alone cannot hide your server's IP.

## Step 1: Create a Cloudflare Account
1.  Go to [Cloudflare.com](https://www.cloudflare.com/) and sign up.
2.  Click **Add a Site** and enter your domain (e.g., `khoavo.i234.me`).

## Step 2: Update DNS Records
1.  Cloudflare will scan your existing DNS records.
2.  Ensure your `A` records (pointing to your home IP) are set to **Proxied** (Orange Cloud icon).
    *   **Orange Cloud**: Traffic goes through Cloudflare -> Your NAS. (IP Hidden, DDoS Protected)
    *   **Grey Cloud**: Traffic goes directly to your NAS. (IP Exposed, No Protection)

## Step 3: Configure SSL/TLS
1.  Go to the **SSL/TLS** tab in Cloudflare.
2.  Set the mode to **Full (Strict)** if your NAS has a valid certificate, or **Flexible** if it doesn't.

## Step 4: Firewall Rules (Optional but Recommended)
1.  Go to **Security > WAF**.
2.  Create a rule to **Block** traffic from countries you don't expect visitors from.
3.  Enable **Bot Fight Mode** to block automated attacks.

## Why this is necessary?
When you host a website on your NAS, your domain `khoavo.i234.me` translates directly to your home IP address. Anyone on the internet can see this IP. By using Cloudflare as a "middleman", visitors only see Cloudflare's IP, keeping your home network safe.
