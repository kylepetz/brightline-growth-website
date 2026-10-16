# Handoff: Brightline Growth website

## Goal
Publish this static site to a new public GitHub repo (`brightline-growth-website`) and serve it with GitHub Pages. Domain later: brightlinegrowth.com.

## State
- Site is complete and tested at desktop (1280px) and phone (390px) widths, no horizontal scroll.
- Local git repo on `main` with one commit. No remote yet.
- Built on the Brightline Growth design system (navy `#071d3e`, lime `#86cd03`, Barlow / Barlow Condensed, square corners, no gradients/shadows/photos).

## Files
| File | Purpose |
|---|---|
| `index.html` | Home: hero, 3 service cards, "rules we don't bend", CTA band |
| `contact.html` | Contact form (validation, honeypot, FormSubmit AJAX, mailto fallback on error) |
| `privacy.html` | Privacy policy (CA/CCPA section, no analytics) |
| `terms.html` | Terms of service (CA law, San Diego County venue) |
| `404.html` | Not-found page |
| `assets/styles.css` | All styles, tokens as CSS variables |
| `assets/*.svg` | Official logo lockups and BG mark (full color + reversed) |
| `.nojekyll` | Tells Pages to serve files as-is |

## Steps for Claude Code
1. `gh repo create brightline-growth-website --public --source . --push`
2. Enable Pages from `main` / root:
   `gh api -X POST repos/{owner}/brightline-growth-website/pages -f "source[branch]=main" -f "source[path]=/"`
3. Wait ~1 min, confirm `https://{owner}.github.io/brightline-growth-website/` returns 200 and all four pages load.
4. Submit a test through the contact form, then click FormSubmit's activation email.

## Open decisions
- **Contact email:** `hi@brightlinegrowth.com` is a placeholder in `contact.html` (`CONTACT_EMAIL` constant + mailto link), `privacy.html` and `terms.html`. Replace in all files if a different inbox is used: `grep -rl hi@brightlinegrowth.com . | xargs sed -i '' 's/hi@brightlinegrowth.com/NEW@ADDRESS/g'` (macOS sed).
- **Custom domain:** when DNS is ready, add a `CNAME` file containing `brightlinegrowth.com`, point DNS at GitHub Pages (A records 185.199.108-111.153 for apex, CNAME `www` to `{owner}.github.io`), then enable "Enforce HTTPS".
- **Legal review:** privacy/terms are accurate for the site as built (no analytics, pixels or cookies). Update the privacy policy before adding any tracking.

## Known limits
- `404.html` uses relative asset paths, so deep bad URLs (e.g. `/a/b/c`) render unstyled. Switch to absolute paths once the custom domain is live.
- Fonts load from Google Fonts (disclosed in the privacy policy). Self-host to drop that dependency.
