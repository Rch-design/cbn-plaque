type IconProps = { name: string; className?: string };

const paths: Record<string, JSX.Element> = {
  wall: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="1" />
      <path d="M3 9h18M3 14h18M8 4v5M14 9v5M8 14v6M16 14v6" />
    </>
  ),
  trowel: (
    <>
      <path d="M14 3l7 7-4 4-7-7z" />
      <path d="M10 7L3 14l4 4 7-7" />
    </>
  ),
  paint: (
    <>
      <rect x="3" y="3" width="14" height="7" rx="1" />
      <path d="M17 6h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-6" />
      <path d="M12 13v3a2 2 0 0 1-2 2H9v3h3v-3" />
    </>
  ),
  deco: (
    <>
      <path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" />
    </>
  ),
  insulation: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="1" />
      <path d="M3 8c3 0 3 2 6 2s3-2 6-2 3 2 3 2M3 13c3 0 3 2 6 2s3-2 6-2 3 2 3 2" />
    </>
  ),
  default: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 12l2 2 4-4" />
    </>
  )
};

export default function ServiceIcon({ name, className }: IconProps) {
  const icon = paths[name] ?? paths.default;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icon}
    </svg>
  );
}
