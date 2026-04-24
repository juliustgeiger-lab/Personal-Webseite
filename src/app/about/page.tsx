export const metadata = {
  title: "About — Julius",
};

export default function About() {
  return (
    <main className="page-wrap space-y-8">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">About</h1>
      <div className="space-y-5 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <p>
          I&apos;m Julius. This is my corner of the internet — mostly notes to myself about
          decision making, value investing, and thinking clearly under uncertainty.
        </p>
        <p>
          Recurring themes: base rates, second-order thinking, asymmetric bets, and the
          difference between a good decision and a good outcome.
        </p>
        <p>
          Reach me at{" "}
          <a
            href="mailto:hello@example.com"
            className="underline underline-offset-4 decoration-zinc-400 hover:decoration-zinc-900 dark:hover:decoration-zinc-100"
          >
            hello@example.com
          </a>
          .
        </p>
      </div>
    </main>
  );
}
