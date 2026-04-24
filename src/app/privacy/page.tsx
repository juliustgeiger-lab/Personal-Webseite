export const metadata = {
  title: "Privacy — Julius",
};

// TODO before go-live: replace [BRACKETED] placeholders and confirm hosting details.
// This template assumes: no analytics, no cookies, no forms, static site hosted on Vercel.
// If you add analytics, forms, or cookies later, update this page accordingly.

export default function Privacy() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Privacy Policy</h1>

      <section className="space-y-3 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          1. Controller
        </h2>
        <p>
          The controller within the meaning of the GDPR is:<br />
          Julius [LASTNAME]<br />
          [STREET AND NUMBER]<br />
          [ZIP] [CITY]<br />
          Austria<br />
          Email:{" "}
          <a
            href="mailto:[EMAIL]"
            className="underline underline-offset-4 decoration-zinc-400"
          >
            [EMAIL]
          </a>
        </p>
      </section>

      <section className="space-y-3 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          2. Overview
        </h2>
        <p>
          This is a static personal website. There are no sign-ups, no forms, and no
          tracking cookies.
        </p>
      </section>

      <section className="space-y-3 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          3. Server log files (hosting)
        </h2>
        <p>
          This website is hosted by Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789,
          USA. When you access the site, the hosting provider processes the following
          technical information on a temporary basis:
        </p>
        <ul>
          <li>IP address of the requesting device</li>
          <li>Date and time of the request</li>
          <li>URL accessed</li>
          <li>HTTP status code and amount of data transferred</li>
          <li>Referrer and user-agent string</li>
        </ul>
        <p>
          The legal basis is Art. 6(1)(f) GDPR (legitimate interest in stable and secure
          delivery of the website). This processing is technically necessary to serve
          the site at all.
        </p>
        <p>
          Since Vercel is based in the United States, a transfer of data to a third
          country may occur. Vercel is certified under the EU-U.S. Data Privacy Framework
          and provides Standard Contractual Clauses. Details:{" "}
          <a
            href="https://vercel.com/legal/privacy-policy"
            className="underline underline-offset-4 decoration-zinc-400"
            rel="noopener noreferrer"
            target="_blank"
          >
            vercel.com/legal/privacy-policy
          </a>
          .
        </p>
      </section>

      <section className="space-y-3 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          4. Cookies
        </h2>
        <p>This site currently sets no cookies.</p>
      </section>

      <section className="space-y-3 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          5. Contact by email
        </h2>
        <p>
          If you contact me by email, your message and the data provided (name, email
          address) will be processed to handle your request. Legal basis: Art. 6(1)(b)
          or (f) GDPR. The data will be deleted as soon as it is no longer needed for
          the purpose for which it was collected.
        </p>
      </section>

      <section className="space-y-3 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          6. Your rights
        </h2>
        <p>
          Under the GDPR you have the following rights: access (Art. 15), rectification
          (Art. 16), erasure (Art. 17), restriction of processing (Art. 18), data
          portability (Art. 20), and objection (Art. 21). Please send requests to the
          email address above.
        </p>
        <p>
          You also have the right to lodge a complaint with the Austrian Data Protection
          Authority:{" "}
          <a
            href="https://www.dsb.gv.at"
            className="underline underline-offset-4 decoration-zinc-400"
            rel="noopener noreferrer"
            target="_blank"
          >
            dsb.gv.at
          </a>
          .
        </p>
      </section>

      <section className="space-y-3 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          7. Changes to this policy
        </h2>
        <p>
          This policy will be updated if data processing changes (e.g. when analytics
          or forms are added). Last updated: [DATE].
        </p>
      </section>
    </div>
  );
}
