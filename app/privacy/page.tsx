import type { Metadata } from "next";
import Link from "next/link";
import { SUPPORT_DISCORD_URL } from "@/lib/app-url";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "MCMerchant Privacy Policy."
};

export default function PrivacyPolicyPage() {
  return (
    <div className="relative mx-auto w-full max-w-3xl px-6 py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(55%_45%_at_50%_0%,rgba(16,185,129,0.18),rgba(15,23,42,0))]"
      />

      <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">Legal</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-50">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-400">Last updated: March 22, 2026</p>

      <article className="mt-10 space-y-8 text-sm leading-relaxed text-gray-300">
        <section className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
          <h2 className="text-base font-semibold text-gray-100">1. Who we are</h2>
          <p className="mt-3">
            This Privacy Policy describes how MCMerchant (&quot;we,&quot; &quot;us&quot;) collects, uses, and shares
            information when you use our website and related services (the &quot;Service&quot;).
          </p>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
          <h2 className="text-base font-semibold text-gray-100">2. Information we collect</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <span className="text-gray-200">Account data:</span> such as email address and authentication
              identifiers when you register or sign in.
            </li>
            <li>
              <span className="text-gray-200">Transaction and licensing data:</span> records related to purchases,
              license keys, downloads, and seller activity needed to operate the marketplace.
            </li>
            <li>
              <span className="text-gray-200">Technical data:</span> such as IP address, device and browser
              information, and logs used for security, debugging, and service improvement.
            </li>
            <li>
              <span className="text-gray-200">Communications:</span> messages you send us through support channels (for
              example Discord tickets) and transactional emails we send you.
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
          <h2 className="text-base font-semibold text-gray-100">3. How we use information</h2>
          <p className="mt-3">We use information to:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Provide, secure, and improve the Service</li>
            <li>Process payments and payouts, verify licenses, and deliver downloads or updates</li>
            <li>Send transactional messages (such as confirmations, security notices, and product updates)</li>
            <li>Comply with law and respond to lawful requests</li>
            <li>Detect, prevent, and address fraud, abuse, and technical issues</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
          <h2 className="text-base font-semibold text-gray-100">4. Sharing</h2>
          <p className="mt-3">
            We share information with service providers that help us run the Service (for example payment
            processing, authentication, email delivery, hosting, and analytics where used). We may disclose
            information if required by law or to protect rights, safety, and integrity of the Service and users.
            Business transfers (such as a merger) may involve transfer of information subject to appropriate
            safeguards.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
          <h2 className="text-base font-semibold text-gray-100">5. Cookies and similar technologies</h2>
          <p className="mt-3">
            We use cookies and similar technologies to keep you signed in, maintain session security, remember
            preferences, and understand how the Service is used. You can control cookies through your browser
            settings; disabling some cookies may limit certain features.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
          <h2 className="text-base font-semibold text-gray-100">6. Retention</h2>
          <p className="mt-3">
            We retain information for as long as needed to provide the Service, meet legal obligations, resolve
            disputes, and enforce our agreements.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
          <h2 className="text-base font-semibold text-gray-100">7. Your choices and rights</h2>
          <p className="mt-3">
            Depending on where you live, you may have rights to access, correct, delete, or export certain personal
            information, or to object to or restrict certain processing. To make a request, open a support ticket in
            our Discord server (see Contact below). We will respond consistent with applicable law.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
          <h2 className="text-base font-semibold text-gray-100">8. Security</h2>
          <p className="mt-3">
            We implement reasonable technical and organizational measures to protect information. No method of
            transmission or storage is completely secure.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
          <h2 className="text-base font-semibold text-gray-100">9. Children</h2>
          <p className="mt-3">
            The Service is not directed to children under 13 (or the minimum age required in your jurisdiction), and
            we do not knowingly collect personal information from children.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
          <h2 className="text-base font-semibold text-gray-100">10. International transfers</h2>
          <p className="mt-3">
            We may process information in countries other than your own. Where required, we use appropriate safeguards
            for cross-border transfers.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
          <h2 className="text-base font-semibold text-gray-100">11. Changes</h2>
          <p className="mt-3">
            We may update this Privacy Policy from time to time. We will post the updated policy on this page and
            revise the &quot;Last updated&quot; date.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
          <h2 className="text-base font-semibold text-gray-100">12. Contact</h2>
          <p className="mt-3">
            Privacy questions: join our Discord and{" "}
            <a
              href={SUPPORT_DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 underline-offset-4 hover:text-brand-300 hover:underline"
            >
              open a support ticket
            </a>
            .
          </p>
        </section>

        <p className="text-center text-sm text-gray-500">
          <Link href="/" className="text-brand-400 hover:underline">
            Back to home
          </Link>
          {" · "}
          <Link href="/tos" className="text-brand-400 hover:underline">
            Terms of Service
          </Link>
        </p>
      </article>
    </div>
  );
}
