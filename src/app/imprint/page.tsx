export const metadata = {
  title: "Imprint — Julius",
};

// TODO before go-live: replace every [BRACKETED] placeholder with real data.
// Legal basis (Austria): ECG §5, Mediengesetz §24 & §25, UGB §14.

export default function Imprint() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Imprint</h1>

      <section className="space-y-3 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Publisher and responsible for the content
        </h2>
        <p>
          Julius [LASTNAME]<br />
          [STREET AND NUMBER]<br />
          [ZIP] [CITY]<br />
          Austria
        </p>
        <p>
          Email:{" "}
          <a
            href="mailto:[EMAIL]"
            className="underline underline-offset-4 decoration-zinc-400"
          >
            [EMAIL]
          </a>
          <br />
          Phone: [OPTIONAL PHONE]
        </p>
      </section>

      <section className="space-y-3 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Purpose of the site
        </h2>
        <p>
          Private website with personal notes on decision making, value investing and
          related topics. Not a commercial service.
        </p>
      </section>

      <section className="space-y-3 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Editorial line (§25 Austrian Media Act)
        </h2>
        <p>
          Personal notes and essays on decision making under uncertainty and value
          investing. The content reflects the personal opinion of the author only.
        </p>
      </section>

      <section className="space-y-3 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Disclaimer
        </h2>
        <p>
          The content on this site is provided with care but without any warranty of
          accuracy, completeness or timeliness. No liability is assumed for damages
          resulting from the use of the information provided. In particular, any content
          on financial or investment topics does not constitute investment advice.
        </p>
        <p>
          No liability is assumed for the content of external links. The operators of
          linked sites are solely responsible for their content.
        </p>
      </section>

      <section className="space-y-3 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Copyright
        </h2>
        <p>
          All texts on this site are protected by copyright. Any use, reproduction or
          redistribution requires the author&apos;s consent.
        </p>
      </section>
    </div>
  );
}
