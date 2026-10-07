interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ variant = 'dark', size = 'md' }: LogoProps) {
  const textColor = variant === 'light' ? 'text-white' : 'text-brand-800';
  const subColor = variant === 'light' ? 'text-brand-100/80' : 'text-slate-500';
  const sizes = {
    sm: { box: 'h-9 w-9', title: 'text-lg', sub: 'text-[10px]' },
    md: { box: 'h-11 w-11', title: 'text-xl', sub: 'text-xs' },
    lg: { box: 'h-14 w-14', title: 'text-2xl', sub: 'text-sm' },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${s.box} flex flex-col items-center justify-center rounded-lg bg-brand-700 shadow-sm`}
        aria-hidden="true"
      >
        <span className="text-sm font-bold leading-none text-accent-500">P4L</span>
        <span className="mt-0.5 text-[8px] font-medium leading-none text-white">NOTARY</span>
      </div>
      <div className="flex flex-col">
        <span className={`${s.title} font-bold leading-tight ${textColor}`}>P4L Mobile Notary</span>
        <span className={`${s.sub} font-medium leading-tight ${subColor}`}>Services LLC</span>
      </div>
    </div>
  );
}
