import { escapeHtml } from "../ui/components.js";

// Legal pages. "legal" is dosha's own privacy policy (the imprint is shared across anyma and
// lives at /imprint). "terms" is still a placeholder.
//
// TODO(legal): the privacy text below has not had a lawyer's review.
const PRIVACY_HTML = `
  <p>This policy covers <strong>dosha</strong>, the Ayurvedic reading at anyma.one/dosha. The
    controller is the operator named in the <a href="/imprint">imprint</a>; contact
    <a href="mailto:hello@anyma.one">hello@anyma.one</a>.</p>

  <h2>1. Your reading stays in your browser</h2>
  <p>Your answers and results for the Core and Full Readings are calculated in your browser and
    saved only there (local and session storage), so a reading survives a reload. They are never
    sent to us. You can delete them by clearing this site's data in your browser.</p>

  <h2>2. Full Reading sign-up</h2>
  <p>Before the Full Reading we ask for your email address. We store the address and the time you
    gave it — nothing from your answers. We use it to write to you about dosha, such as new
    readings and when the Individual Reading opens. No email is sent when you sign up.</p>
  <ul>
    <li><strong>Legal basis:</strong> your consent, given by submitting the form (Art. 6(1)(a)
      GDPR). You can withdraw it at any time by writing to
      <a href="mailto:hello@anyma.one">hello@anyma.one</a>, without affecting earlier
      processing.</li>
    <li>The address is stored with our database provider, Supabase, in the EU.</li>
  </ul>

  <h2>3. Individual Reading sign-up</h2>
  <p>If you ask to hear when the Individual Reading opens, we store your email address, the time
    you gave consent and whether you have confirmed it. We send one confirmation email with a link
    (double opt-in) and write to you again when the Individual Reading opens. Until you click the
    link, you receive nothing else.</p>
  <ul>
    <li><strong>Legal basis:</strong> your consent (Art. 6(1)(a) GDPR), which you can withdraw at
      any time as described above.</li>
    <li>The address is stored with Supabase (EU). Emails are delivered by our email provider,
      Resend, which also delivers a short notice of the sign-up to our own inbox.</li>
  </ul>

  <h2>4. Cookies, storage and analytics</h2>
  <p>dosha sets no cookies and runs no analytics or tracking. The browser storage described in
    section 1 is needed for the reading to work and is never read by us. Fonts are served from our
    own site, not from a third party.</p>

  <h2>5. Hosting and international transfers</h2>
  <p>The site is hosted by Vercel, whose server logs may include technical data such as your IP
    address (legal basis: our legitimate interest in operating the site securely, Art. 6(1)(f)
    GDPR). Supabase stores data in the EU. Vercel and Resend are located in or transfer data to the
    United States; these transfers are safeguarded under Chapter V GDPR, in particular by the EU
    Standard Contractual Clauses and, where the provider is certified, the EU-US Data Privacy
    Framework, as set out in each provider's Data Processing Agreement, which we have accepted.</p>

  <h2>6. How long we keep data</h2>
  <ul>
    <li><strong>Email addresses</strong> are kept until you withdraw consent or unsubscribe, or until
      we no longer need them for the purpose you gave them for — then deleted.</li>
    <li><strong>Your reading</strong> is never on our servers; it stays in your browser until you
      clear it.</li>
    <li><strong>Server logs</strong> are kept for the period set by our host.</li>
  </ul>

  <h2>7. Your rights</h2>
  <p>You have the right to access, rectification, erasure, restriction, data portability and
    objection, and to withdraw consent at any time. Contact
    <a href="mailto:hello@anyma.one">hello@anyma.one</a>. You may also complain to a supervisory
    authority; for North Rhine-Westphalia this is the Landesbeauftragte für Datenschutz und
    Informationsfreiheit Nordrhein-Westfalen (LDI NRW).</p>

  <h2>8. Changes</h2>
  <p>We may update this policy; the version published here, with the date above, is the current
    one.</p>
`;

const PAGES = {
  legal: {
    kicker: "Imprint & Privacy",
    title: "Privacy",
    updated: "Last updated: 31 October 2026",
    html: PRIVACY_HTML,
  },
  terms: {
    kicker: "Terms",
    title: "Terms of Use",
    body: "Placeholder. The terms of use for anyma — including the educational-only scope and limitation of liability — will live here.",
  },
};

export function renderPlaceholder(key) {
  return ({ app }) => {
    const p = PAGES[key] || PAGES.legal;
    const content = p.html
      ? `<p class="mlabel" style="color:var(--ink-muted);margin-bottom:24px">${escapeHtml(p.updated)}</p>
         <div class="legal-body prose-serif">${p.html}</div>`
      : `<p class="serif" style="font-size:17px;max-width:60ch">${escapeHtml(p.body)}</p>
         <p class="mlabel" style="margin-top:24px;color:var(--ink-muted)">Coming soon</p>`;
    app.innerHTML = `
    <div class="wrap">
      <a class="back-link" href="#/" data-link>← Home</a>
      <div class="kick">${escapeHtml(p.kicker)}</div>
      <h1 style="font-family:var(--font-display);font-weight:500;font-size:40px;margin:16px 0 12px">${escapeHtml(p.title)}</h1>
      ${content}
    </div>`;
  };
}
