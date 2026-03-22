import type { Metadata } from "next";
import Link from "next/link";
import { SUPPORT_DISCORD_URL } from "@/lib/app-url";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "MCMerchant Terms of Service."
};

export default function TermsOfServicePage() {
  return (
    <div className="relative mx-auto w-full max-w-3xl px-6 py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(55%_45%_at_50%_0%,rgba(16,185,129,0.18),rgba(15,23,42,0))]"
      />

      <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">Legal</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-50">Terms of Service</h1>
      <p className="mt-2 text-sm text-gray-400">Last updated: March 22, 2026</p>

      <article className="mt-10 space-y-8 text-sm leading-relaxed text-gray-300">
        <section className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
          <h2 className="text-base font-semibold text-gray-100">1. Agreement</h2>
          <p className="mt-3">
            These Terms of Service (&quot;Terms&quot;) govern your access to and use of MCMerchant (the
            &quot;Service&quot;), including our website, accounts, marketplace, licensing tools, and related
            features. By creating an account or using the Service, you agree to these Terms.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
          <h2 className="text-base font-semibold text-gray-100">2. The Service</h2>
          <p className="mt-3">
            MCMerchant provides infrastructure for discovering, purchasing, licensing, and distributing digital
            goods (such as Minecraft plugins), including seller storefronts, checkout facilitated through payment
            processors, license keys, and download or update mechanisms. We may modify, suspend, or discontinue
            parts of the Service with reasonable notice where practicable.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
          <h2 className="text-base font-semibold text-gray-100">3. Accounts</h2>
          <p className="mt-3">
            You must provide accurate information and keep your credentials secure. You are responsible for activity
            under your account. We may suspend or terminate accounts that violate these Terms or pose risk to the
            Service or other users.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
          <h2 className="text-base font-semibold text-gray-100">4. Marketplace, licenses, and digital goods</h2>
          <p className="mt-3">
            Listings, pricing, refunds, and support for purchased items may be offered by individual sellers.
            License keys and download entitlements are granted according to the seller&apos;s terms and product
            description, subject to technical enforcement through the Service. You agree not to circumvent license
            checks, redistribute paid goods without authorization, or misuse the Service to harm sellers or buyers.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
          <h2 className="text-base font-semibold text-gray-100">5. Acceptable use</h2>
          <p className="mt-3">
            You will not use the Service unlawfully, to distribute malware, to harass others, to scrape or overload
            systems beyond normal use, or to violate third-party rights (including intellectual property). We may
            remove content or restrict access when needed to protect users or comply with law.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
          <h2 className="text-base font-semibold text-gray-100">6. Third-party services</h2>
          <p className="mt-3">
            The Service may integrate with third parties (for example payment, email, authentication, or hosting).
            Your use of those services may be subject to their separate terms and privacy practices.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
          <h2 className="text-base font-semibold text-gray-100">7. Disclaimers</h2>
          <p className="mt-3">
            The Service is provided &quot;as is&quot; without warranties of any kind, to the fullest extent permitted
            by law. We do not guarantee uninterrupted or error-free operation or that any plugin or update is fit for
            a particular purpose.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
          <h2 className="text-base font-semibold text-gray-100">8. Limitation of liability</h2>
          <p className="mt-3">
            To the maximum extent permitted by law, MCMerchant and its operators will not be liable for indirect,
            incidental, special, consequential, or punitive damages, or for loss of profits, data, or goodwill,
            arising from your use of the Service. Our aggregate liability for claims relating to the Service is
            limited to the greater of amounts you paid to us for the Service in the twelve months before the claim
            or fifty U.S. dollars, unless applicable law requires otherwise.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
          <h2 className="text-base font-semibold text-gray-100">9. Changes</h2>
          <p className="mt-3">
            We may update these Terms from time to time. We will post the revised Terms on this page and update the
            &quot;Last updated&quot; date. Continued use after changes become effective constitutes acceptance of the
            revised Terms.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
          <h2 className="text-base font-semibold text-gray-100">10. Contact</h2>
          <p className="mt-3">
            Questions about these Terms: join our Discord and{" "}
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
          <Link href="/privacy" className="text-brand-400 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </article>
    </div>
  );
}
