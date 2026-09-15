import { describe, expect, it } from 'vite-plus/test';
import { getFeaturedPackageGridItemClassName } from './home-layout';

describe('featured package grid', () => {
    it('centers one package in the final desktop row', () => {
        expect(getFeaturedPackageGridItemClassName(3, 4)).toContain(
            'lg:col-start-3',
        );
    });

    it('centers two packages in the final desktop row', () => {
        expect(getFeaturedPackageGridItemClassName(3, 5)).toContain(
            'lg:col-start-2',
        );
        expect(getFeaturedPackageGridItemClassName(4, 5)).not.toContain(
            'lg:col-start-',
        );
    });

    it('keeps complete desktop rows aligned to three columns', () => {
        expect(getFeaturedPackageGridItemClassName(3, 6)).not.toContain(
            'lg:col-start-',
        );
        expect(getFeaturedPackageGridItemClassName(4, 6)).not.toContain(
            'lg:col-start-',
        );
        expect(getFeaturedPackageGridItemClassName(5, 6)).not.toContain(
            'lg:col-start-',
        );
    });
});
