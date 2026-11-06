interface PageHeroProps {
  eyebrow: string;
  title: string;
  description?: string;
}

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.18em] text-ink2 uppercase">{eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl font-normal text-ink sm:text-4xl">{title}</h2>
      {description && <p className="mt-2 max-w-2xl text-sm text-ink2">{description}</p>}
    </div>
  );
}
