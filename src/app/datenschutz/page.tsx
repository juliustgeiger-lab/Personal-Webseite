export const metadata = {
  title: "Datenschutz — Julius",
};

// TODO before go-live: replace [BRACKETED] placeholders and confirm hosting details.
// This template assumes: no analytics, no cookies, no forms, static site hosted on Vercel.
// If you add analytics, forms, or cookies later, update this page accordingly.

export default function Datenschutz() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Datenschutzerklärung</h1>

      <section className="space-y-3 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          1. Verantwortlicher
        </h2>
        <p>
          Verantwortlicher im Sinne der DSGVO ist:<br />
          Julius [NACHNAME]<br />
          [STRASSE UND HAUSNUMMER]<br />
          [PLZ] [ORT]<br />
          Österreich<br />
          E-Mail:{" "}
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
          2. Allgemeines zur Datenverarbeitung
        </h2>
        <p>
          Diese Website ist eine statische, persönliche Seite. Es werden keine
          Registrierungen angeboten, keine Formulare ausgewertet und keine Cookies
          zu Tracking-Zwecken gesetzt.
        </p>
      </section>

      <section className="space-y-3 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          3. Server-Logfiles (Hosting)
        </h2>
        <p>
          Diese Website wird bei Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789,
          USA gehostet. Beim Aufruf werden vom Hosting-Anbieter technische Informationen
          temporär verarbeitet, insbesondere:
        </p>
        <ul>
          <li>IP-Adresse des anfragenden Geräts</li>
          <li>Datum und Uhrzeit der Anfrage</li>
          <li>Aufgerufene URL</li>
          <li>HTTP-Statuscode und übertragene Datenmenge</li>
          <li>Referrer und User-Agent</li>
        </ul>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der
          stabilen, sicheren Auslieferung der Website). Die Verarbeitung ist technisch
          erforderlich, um die Website überhaupt auszuliefern.
        </p>
        <p>
          Da Vercel in den USA ansässig ist, kann eine Datenübermittlung in ein Drittland
          stattfinden. Vercel ist nach dem EU-U.S. Data Privacy Framework zertifiziert
          und stellt Standardvertragsklauseln bereit. Details:{" "}
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
        <p>
          Diese Website setzt derzeit keine Cookies.
        </p>
      </section>

      <section className="space-y-3 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          5. Kontaktaufnahme per E-Mail
        </h2>
        <p>
          Wenn du per E-Mail Kontakt aufnimmst, wird deine Nachricht einschließlich der
          mitgeteilten Daten (Name, E-Mail-Adresse) zum Zweck der Bearbeitung deiner Anfrage
          verarbeitet. Rechtsgrundlage: Art. 6 Abs. 1 lit. b bzw. lit. f DSGVO.
          Die Daten werden gelöscht, sobald sie für den Zweck der Erhebung nicht mehr
          erforderlich sind.
        </p>
      </section>

      <section className="space-y-3 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          6. Deine Rechte
        </h2>
        <p>
          Dir stehen nach DSGVO folgende Rechte zu: Auskunft (Art. 15), Berichtigung
          (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18),
          Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21). Anfragen richte bitte
          an die oben genannte E-Mail-Adresse.
        </p>
        <p>
          Du hast außerdem das Recht, dich bei der österreichischen Datenschutzbehörde
          zu beschweren:{" "}
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
          7. Änderungen dieser Datenschutzerklärung
        </h2>
        <p>
          Diese Erklärung wird angepasst, sobald sich die Datenverarbeitung ändert
          (z.&nbsp;B. durch Einbindung von Analyse-Tools oder Formularen).
          Stand: [DATUM].
        </p>
      </section>
    </div>
  );
}
