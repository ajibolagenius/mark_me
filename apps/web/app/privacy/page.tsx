import { Logo } from "@markme/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — mark_me",
  description: "How mark_me collects, uses, and protects your data.",
};

const EFFECTIVE_DATE = "July 18, 2026";
const CONTACT_EMAIL = "ajiboladolapogenius@gmail.com";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-[17px] font-extrabold tracking-[-0.02em] text-mm-text">{title}</h2>
      <div className="mt-3 space-y-3 text-[14px] leading-relaxed text-mm-text-sec">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-mm-bg font-sans text-mm-text">
      <header className="mx-auto flex w-full max-w-[720px] items-center justify-between px-5 py-6">
        <a href="/" aria-label="mark_me home">
          <Logo size={26} />
        </a>
        <a
          href="/"
          className="text-[13px] font-bold text-mm-text-sec transition-colors hover:text-mm-text"
        >
          ← Back to mark_me
        </a>
      </header>

      <main className="mx-auto w-full max-w-[720px] px-5 pb-24 pt-8">
        <h1 className="text-[clamp(1.6rem,4vw,2rem)] font-extrabold tracking-[-0.04em]">
          Privacy Policy
        </h1>
        <p className="mt-2 text-[13px] text-mm-text-muted">Effective {EFFECTIVE_DATE}</p>

        <p className="mt-6 text-[15px] leading-relaxed text-mm-text-sec">
          mark_me is a bookmark manager. This policy explains what data the mark_me web app and
          browser extension handle, why, and what control you have over it. The short version: your
          bookmarks belong to you, we collect only what the product needs to work, and we never
          sell your data or show ads.
        </p>

        <Section title="What we collect">
          <p>
            <strong className="text-mm-text">Account information.</strong> When you sign up we
            store your email address, display name, and authentication credentials. Sign-in is
            handled by Neon Auth, our authentication provider.
          </p>
          <p>
            <strong className="text-mm-text">Bookmarks.</strong> The URLs, titles, tags, notes,
            categories, and pin state of pages you choose to save. Bookmarks are only ever saved by
            your explicit action — clicking the extension, using the context menu, or adding one in
            the app.
          </p>
          <p>
            <strong className="text-mm-text">What we do not collect.</strong> The extension does
            not read or transmit your browsing history. It accesses a page's URL and title only at
            the moment you ask it to save that page, and the new tab page only displays bookmarks
            you already saved.
          </p>
        </Section>

        <Section title="How we use your data">
          <p>
            Your data is used solely to provide mark_me: storing and syncing your bookmarks,
            signing you in, and powering features you invoke such as search, auto-tagging, and
            duplicate detection. We do not sell or rent your data, use it for advertising, or share
            it with third parties except the service providers listed below.
          </p>
        </Section>

        <Section title="AI features">
          <p>
            When you use AI features (auto-tagging, duplicate detection), the titles, URLs, and
            tags of the relevant bookmarks are sent to OpenRouter, an AI model gateway, to generate
            suggestions. Only the bookmark metadata needed for the feature is sent — never your
            account credentials. AI features run when you invoke them.
          </p>
        </Section>

        <Section title="Service providers">
          <p>We rely on a small set of infrastructure providers to run mark_me:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-mm-text">Vercel</strong> — application hosting.
            </li>
            <li>
              <strong className="text-mm-text">Neon</strong> — database (bookmark storage) and
              authentication.
            </li>
            <li>
              <strong className="text-mm-text">OpenRouter</strong> — AI model gateway, for the AI
              features described above.
            </li>
            <li>
              <strong className="text-mm-text">Google Favicon Service</strong> — the app displays
              site icons by requesting them from Google using the domain (not the full URL) of a
              saved bookmark.
            </li>
          </ul>
          <p>Each provider processes data only as needed to deliver its function.</p>
        </Section>

        <Section title="The browser extension">
          <p>
            After you connect the extension to your account, an access token is stored in your
            browser's extension storage (synced by your browser if you have browser sync enabled).
            Bookmarks saved while you're offline are queued in local extension storage and uploaded
            when you're back online. Disconnecting the extension deletes the token; uninstalling it
            deletes everything the extension stored.
          </p>
        </Section>

        <Section title="Data retention and deletion">
          <p>
            Your data is kept for as long as your account exists. You can delete individual
            bookmarks at any time, and they are removed from our database. To delete your account
            and all associated data, contact us at the address below and we'll complete the
            deletion within 30 days.
          </p>
        </Section>

        <Section title="Security">
          <p>
            All data is transmitted over HTTPS and stored with an infrastructure provider that
            encrypts data at rest. Extension access tokens are scoped to your account and expire
            automatically.
          </p>
        </Section>

        <Section title="Children">
          <p>
            mark_me is not directed at children under 13, and we do not knowingly collect personal
            information from them.
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            If we make material changes, we'll update this page and the effective date above.
            Continued use of mark_me after a change means you accept the updated policy.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions or requests:{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-semibold text-mm-primary underline"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </Section>
      </main>

      <footer className="border-t border-mm-border py-6 text-center text-[11px] text-mm-text-muted">
        Powered by mark<span className="text-mm-primary">_</span>me
      </footer>
    </div>
  );
}
