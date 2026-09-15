import { getPackageGridItemClassName } from './package-grid-layout';

export function getFeaturedPackageGridItemClassName(
    index: number,
    totalPackages: number,
): string {
    return getPackageGridItemClassName(index, totalPackages);
}
