type IconProps = { name: string; className?: string };

export const SERVICE_ICONS: Record<string, { label: string; el: JSX.Element }> = {
  wall: {
    label: 'Alçıpan',
    el: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="1" />
        <path d="M3 9h18M3 14h18M8 4v5M14 9v5M8 14v6M16 14v6" />
      </>
    )
  },
  trowel: {
    label: 'Alçı/Sıva',
    el: (
      <>
        <path d="M14 3l7 7-4 4-7-7z" />
        <path d="M10 7L3 14l4 4 7-7" />
      </>
    )
  },
  paint: {
    label: 'Boya',
    el: (
      <>
        <rect x="3" y="3" width="14" height="7" rx="1" />
        <path d="M17 6h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-6" />
        <path d="M12 13v3a2 2 0 0 1-2 2H9v3h3v-3" />
      </>
    )
  },
  deco: {
    label: 'Dekorasyon',
    el: (
      <>
        <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z" />
      </>
    )
  },
  insulation: {
    label: 'İzolasyon',
    el: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="1" />
        <path d="M3 8c3 0 3 2 6 2s3-2 6-2 3 2 3 2M3 13c3 0 3 2 6 2s3-2 6-2 3 2 3 2" />
      </>
    )
  },
  renovation: {
    label: 'Tadilat',
    el: (
      <>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <path d="M9 22V12h6v10" />
      </>
    )
  },
  ceiling: {
    label: 'Tavan',
    el: (
      <>
        <path d="M3 5h18M3 5l3 14h12l3-14" />
        <path d="M9 5v4M15 5v4M12 5v6" />
      </>
    )
  },
  floor: {
    label: 'Zemin',
    el: (
      <>
        <rect x="3" y="14" width="18" height="7" rx="1" />
        <path d="M6 14V9M10 14V7M14 14V9M18 14V7" />
      </>
    )
  },
  brush: {
    label: 'Fırça/Resim',
    el: (
      <>
        <path d="M9.06 11.9l8.07-8.07a2.85 2.85 0 114.03 4.03l-8.06 8.08" />
        <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1 1 2.48 1.94 4 2.02 2.2.1 4-.83 4-3.05C10.07 16.3 8.73 14.94 7.07 14.94z" />
      </>
    )
  },
  stairs: {
    label: 'Merdiven',
    el: (
      <>
        <path d="M3 20h4v-4h4v-4h4v-4h4V4" strokeLinecap="round" strokeLinejoin="round" />
      </>
    )
  },
  window: {
    label: 'Pencere/Kapı',
    el: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 12h18M12 3v18" />
      </>
    )
  },
  outdoor: {
    label: 'Dış Cephe',
    el: (
      <>
        <path d="M3 12L12 3l9 9" />
        <path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
      </>
    )
  },
  default: {
    label: 'Diğer',
    el: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9 12l2 2 4-4" />
      </>
    )
  }
};

export default function ServiceIcon({ name, className }: IconProps) {
  const icon = SERVICE_ICONS[name]?.el ?? SERVICE_ICONS.default.el;
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
