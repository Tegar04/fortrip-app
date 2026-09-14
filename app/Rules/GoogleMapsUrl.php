<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

class GoogleMapsUrl implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  Closure(string, ?string=): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! self::isValid($value)) {
            $fail('URL Google Maps harus menggunakan maps.app.goo.gl atau halaman Maps resmi Google.');
        }
    }

    public static function isValid(mixed $value): bool
    {
        if (! is_string($value) || filter_var($value, FILTER_VALIDATE_URL) === false) {
            return false;
        }

        $scheme = strtolower((string) parse_url($value, PHP_URL_SCHEME));

        if (! in_array($scheme, ['http', 'https'], true)) {
            return false;
        }

        $host = strtolower(rtrim((string) parse_url($value, PHP_URL_HOST), '.'));
        $path = (string) parse_url($value, PHP_URL_PATH);

        if ($host === 'maps.app.goo.gl') {
            return true;
        }

        if ($host === 'goo.gl') {
            return str_starts_with($path, '/maps');
        }

        if (in_array($host, ['maps.google.com', 'maps.google.co.id'], true)) {
            return true;
        }

        return in_array($host, ['google.com', 'www.google.com', 'google.co.id', 'www.google.co.id'], true)
            && str_starts_with($path, '/maps');
    }
}
