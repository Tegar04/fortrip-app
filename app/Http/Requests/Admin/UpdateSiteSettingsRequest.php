<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSiteSettingsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('manage site settings') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'company_name' => ['required', 'string', 'max:255'],
            'company_tagline' => ['nullable', 'string', 'max:255'],
            'company_address' => ['nullable', 'string', 'max:2000'],
            'company_phone' => ['nullable', 'string', 'max:30'],
            'company_email' => ['nullable', 'email', 'max:255'],
            'whatsapp_number' => ['nullable', 'string', 'max:30'],
            'facebook_url' => ['nullable', 'url:http,https', 'max:2048'],
            'instagram_url' => ['nullable', 'url:http,https', 'max:2048'],
            'youtube_url' => ['nullable', 'url:http,https', 'max:2048'],
            'hero_title' => ['required', 'string', 'max:255'],
            'hero_subtitle' => ['nullable', 'string', 'max:500'],
            'about_title' => ['required', 'string', 'max:255'],
            'about_description' => ['required', 'string', 'max:2000'],
            'home_packages_title' => ['required', 'string', 'max:255'],
            'home_packages_subtitle' => ['nullable', 'string', 'max:500'],
            'home_testimonials_title' => ['required', 'string', 'max:255'],
            'home_testimonials_subtitle' => ['nullable', 'string', 'max:500'],
            'home_cta_title' => ['required', 'string', 'max:255'],
            'home_cta_description' => ['nullable', 'string', 'max:500'],
            'home_cta_button_text' => ['required', 'string', 'max:100'],
            'seo_default_title' => ['required', 'string', 'max:255'],
            'seo_default_description' => ['required', 'string', 'max:500'],
        ];
    }
}
