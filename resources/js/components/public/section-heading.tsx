export default function SectionHeading({
    eyebrow,
    title,
    description,
    align = 'center',
}: {
    eyebrow: string;
    title: string;
    description: string | null;
    align?: 'left' | 'center';
}) {
    return (
        <div
            className={
                align === 'center'
                    ? 'mx-auto grid max-w-2xl gap-4 text-center'
                    : 'grid max-w-2xl gap-4'
            }
        >
            <p className="text-sm font-semibold tracking-[0.2em] text-emerald-700 uppercase">
                {eyebrow}
            </p>
            <h2 className="text-3xl leading-tight font-semibold tracking-tight text-balance text-slate-950 sm:text-4xl">
                {title}
            </h2>
            {description && (
                <p className="text-base leading-8 text-pretty text-slate-600 sm:text-lg">
                    {description}
                </p>
            )}
        </div>
    );
}
