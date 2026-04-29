export const metadata = {
  title: "About — Julius",
};

export default function About() {
  return (
    <main className="about-root">
      <div className="about-grid">
        <div className="about-text">
          <span className="about-rule" aria-hidden="true" />
          <h1 className="about-title">ABOUT.</h1>
          <p className="about-subtitle">
            I&apos;m passionate about innovation and driven by impact.
          </p>
          <div className="about-body">
            <p>
              Most decisions get made as if the future could be predicted. I find that
              assumption worth questioning. Not because the future is totally unknowable,
              but because how you frame uncertainty determines what kinds of decisions you
              can confidently make.
            </p>
            <p>
              How decision makers make decisions when the future is genuinely uncertain.
              When a single wrong move can permanently eliminate future options. When
              outcomes do not simply average out over time. The core tension is simple to
              state and very hard to resolve. You need to be cautious enough to survive
              and bold enough to matter. Those two impulses demand opposite instincts.
              And most people, most organizations, most institutions end up collapsing
              into one at the expense of the other.
            </p>
            <p>
              I see this tension everywhere. Careers that played it safe and stalled.
              People who bet everything on one move and broke. Companies that protected
              what they had until there was nothing worth protecting. The question is
              never whether to be cautious or bold. It is how to be both at once.
            </p>
            <p>
              I started thinking seriously about this after a conversation with the
              Italian author Luca Dellanna on my podcast &ldquo;Entertaining
              Ideas.&rdquo; Dellanna writes about ergodicity and winning long-term games.
              Our conversation made me realize that the frameworks most leaders use are
              designed for a world far more predictable than the one we actually live in.
              That conversation shaped thoughts I had been circling for years. How do you
              make decisions when your time horizon itself is uncertain?
            </p>
            <p>
              That question is not purely intellectual for me. At nineteen, a
              life-threatening medical event forced me to think about my own time horizon
              in a way most people my age never have to. When nobody can tell you how
              much time you have left, you learn very fast that survival alone is not
              enough, but neither is reckless ambition. You need both. And you need the
              judgment to know which one to lean on when. That experience shaped
              everything that came after. It became a master thesis and still shapes my
              writing here.
            </p>
          </div>
        </div>
        <div className="about-photo">
          <img
            src="/profile-picture-julius/me-smiling.png"
            alt="Portrait of Julius"
            width={2048}
            height={2048}
          />
        </div>
      </div>
    </main>
  );
}
