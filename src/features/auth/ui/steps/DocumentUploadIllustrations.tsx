interface IllustrationProps {
  className?: string;
}

export function IdCardFrontIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 88 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="1"
        y="1"
        width="86"
        height="52"
        rx="5"
        className="stroke-primary/35"
        strokeWidth="1.5"
      />
      <rect
        x="7"
        y="8"
        width="22"
        height="28"
        rx="2"
        className="fill-primary/10 stroke-primary/25"
        strokeWidth="1"
      />
      <circle cx="18" cy="18" r="6" className="fill-primary/20" />
      <path
        d="M12 30c2-4 12-4 14 0"
        className="stroke-primary/30"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect
        x="34"
        y="10"
        width="42"
        height="3"
        rx="1.5"
        className="fill-primary/15"
      />
      <rect
        x="34"
        y="17"
        width="36"
        height="2.5"
        rx="1.25"
        className="fill-primary/10"
      />
      <rect
        x="34"
        y="23"
        width="40"
        height="2.5"
        rx="1.25"
        className="fill-primary/10"
      />
      <rect
        x="34"
        y="29"
        width="30"
        height="2.5"
        rx="1.25"
        className="fill-primary/10"
      />
      <ellipse
        cx="68"
        cy="38"
        rx="10"
        ry="8"
        className="stroke-primary/20"
        strokeWidth="1"
      />
      <path
        d="M64 38c2-3 8-3 10 0M66 41c1.5-2 5-2 6 0"
        className="stroke-primary/25"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IdCardBackIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 88 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="1"
        y="1"
        width="86"
        height="52"
        rx="5"
        className="stroke-primary/35"
        strokeWidth="1.5"
      />
      <rect
        x="8"
        y="8"
        width="72"
        height="18"
        rx="2"
        className="fill-primary/8 stroke-primary/20"
        strokeWidth="1"
      />
      {Array.from({ length: 14 }).map((_, index) => (
        <rect
          key={index}
          x={12 + index * 4.8}
          y="12"
          width="2.5"
          height="10"
          className="fill-primary/20"
        />
      ))}
      <rect
        x="8"
        y="32"
        width="72"
        height="14"
        rx="2"
        className="fill-primary/12"
      />
      <rect
        x="12"
        y="36"
        width="64"
        height="2"
        rx="1"
        className="fill-primary/25"
      />
      <rect
        x="12"
        y="40"
        width="58"
        height="2"
        rx="1"
        className="fill-primary/20"
      />
      <rect
        x="12"
        y="44"
        width="52"
        height="2"
        rx="1"
        className="fill-primary/20"
      />
    </svg>
  );
}

export function GenericDocumentIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 88 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="1"
        y="1"
        width="86"
        height="52"
        rx="5"
        className="stroke-primary/35"
        strokeWidth="1.5"
      />
      <rect
        x="20"
        y="8"
        width="48"
        height="38"
        rx="3"
        className="fill-primary/8 stroke-primary/25"
        strokeWidth="1"
      />
      <rect
        x="26"
        y="14"
        width="28"
        height="3"
        rx="1.5"
        className="fill-primary/15"
      />
      <rect
        x="26"
        y="21"
        width="36"
        height="2.5"
        rx="1.25"
        className="fill-primary/10"
      />
      <rect
        x="26"
        y="27"
        width="32"
        height="2.5"
        rx="1.25"
        className="fill-primary/10"
      />
      <rect
        x="26"
        y="33"
        width="24"
        height="2.5"
        rx="1.25"
        className="fill-primary/10"
      />
    </svg>
  );
}
