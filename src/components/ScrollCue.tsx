"use client";

export default function ScrollCue() {
  const onClick = () => {
    if (typeof window !== "undefined") {
      window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
    }
  };

  return (
    <button
      type="button"
      className="scroll-cue"
      onClick={onClick}
      aria-label="Scroll to the next section"
    >
      <svg
        viewBox="0 0 24 24"
        className="scroll-cue__arrow"
        aria-hidden="true"
      >
        <path
          d="M 6 9 L 12 15 L 18 9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
