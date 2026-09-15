export function getPackageGridItemClassName(
    index: number,
    totalPackages: number,
): string {
    const remainingPackages = totalPackages % 3;
    const firstIndexInLastRow = totalPackages - remainingPackages;
    const isFirstPackageInLastRow = index === firstIndexInLastRow;

    const desktopStartClass =
        isFirstPackageInLastRow && remainingPackages === 1
            ? 'lg:col-start-3'
            : isFirstPackageInLastRow && remainingPackages === 2
              ? 'lg:col-start-2'
              : '';

    return ['[&>article]:h-full lg:col-span-2', desktopStartClass]
        .filter(Boolean)
        .join(' ');
}
