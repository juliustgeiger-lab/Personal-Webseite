export const metadata = {
  title: "Impressum — Julius",
};

// TODO before go-live: replace every [BRACKETED] placeholder with real data.
// Legal basis: ECG §5, Mediengesetz §24 & §25 (Offenlegung), UGB §14.

export default function Impressum() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Impressum</h1>

      <section className="space-y-3 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Medieninhaber, Herausgeber und für den Inhalt verantwortlich
        </h2>
        <p>
          Julius [NACHNAME]<br />
          [STRASSE UND HAUSNUMMER]<br />
          [PLZ] [ORT]<br />
          Österreich
        </p>
        <p>
          E-Mail:{" "}
          <a
            href="mailto:[EMAIL]"
            className="underline underline-offset-4 decoration-zinc-400"
          >
            [EMAIL]
          </a>
          <br />
          Telefon: [OPTIONAL TELEFON]
        </p>
      </section>

      <section className="space-y-3 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Unternehmensgegenstand / Tätigkeit
        </h2>
        <p>
          Private Website mit persönlichen Texten zu Entscheidungsfindung, Value Investing
          und verwandten Themen. Keine gewerbliche Tätigkeit.
        </p>
      </section>

      <section className="space-y-3 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Grundlegende Richtung (§25 Mediengesetz)
        </h2>
        <p>
          Persönliche Notizen und Essays zu Themen rund um Entscheidungsfindung unter
          Unsicherheit und Value Investing. Die Inhalte geben ausschließlich die
          persönliche Meinung des Medieninhabers wieder.
        </p>
      </section>

      <section className="space-y-3 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Haftungsausschluss
        </h2>
        <p>
          Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt, erheben
          aber keinen Anspruch auf Richtigkeit, Vollständigkeit oder Aktualität. Es wird
          keine Haftung für Schäden übernommen, die aus der Nutzung der hier bereitgestellten
          Informationen entstehen. Insbesondere stellen Inhalte zu Finanz- oder
          Investitionsthemen keine Anlageberatung dar.
        </p>
        <p>
          Für Inhalte externer Links wird keine Haftung übernommen. Verantwortlich für den
          Inhalt verlinkter Seiten sind deren Betreiber.
        </p>
      </section>

      <section className="space-y-3 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Urheberrecht
        </h2>
        <p>
          Alle Texte auf dieser Website sind urheberrechtlich geschützt. Nutzung,
          Vervielfältigung oder Weiterverbreitung nur mit Zustimmung des Autors.
        </p>
      </section>
    </div>
  );
}
