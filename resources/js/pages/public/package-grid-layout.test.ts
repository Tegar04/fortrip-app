import { describe, expect, it } from 'vite-plus/test';
import { getPackageGridItemClassName } from './package-grid-layout';

describe('package grid', () => {
    it('centers one package in the final desktop row', () => {
        expect(getPackageGridItemClassName(3, 4)).toContain('lg:col-start-3');
    });

    it('centers two packages in the final desktop row', () => {
        expect(getPackageGridItemClassName(3, 5)).toContain('lg:col-start-2');
        expect(getPackageGridItemClassName(4, 5)).not.toContain(
            'lg:col-start-',
        );
    });

    it('keeps complete desktop rows aligned to three columns', () => {
        expect(getPackageGridItemClassName(3, 6)).not.toContain(
            'lg:col-start-',
        );
        expect(getPackageGridItemClassName(4, 6)).not.toContain(
            'lg:col-start-',
        );
        expect(getPackageGridItemClassName(5, 6)).not.toContain(
            'lg:col-start-',
        );
    });
});
