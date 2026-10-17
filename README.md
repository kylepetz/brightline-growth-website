# Brightline Growth website

Static site for Brightline Growth, hosted on GitHub Pages.

- `index.html` home, `contact.html` contact form, `privacy.html`, `terms.html`, `404.html`
- Service pages: `paid-media.html`, `attribution.html`, `automation.html` (linked from the header Services menu, home cards, footer, and `sitemap.xml`)
- `assets/styles.css` uses the Brightline Growth design system tokens
- Contact form posts to [FormSubmit](https://formsubmit.co). Submissions pass through FormSubmit's reCAPTCHA before delivery, then return to `thanks.html`. Change the form `action` in `contact.html` to change the inbox. The first submission triggers a one-time activation email.
