<?php

namespace App\Http\Requests\Admin;

use App\Models\Banner;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class ReorderBannersRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('edit banners') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'banners' => ['required', 'array', 'min:1'],
            'banners.*' => ['required', 'integer', 'distinct', 'exists:banners,id'],
        ];
    }

    /**
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->has('banners') || $validator->errors()->has('banners.*')) {
                    return;
                }

                $submittedIds = collect($this->array('banners'))
                    ->map(fn (mixed $id): int => (int) $id)
                    ->sort()
                    ->values();
                $existingIds = Banner::query()
                    ->pluck('id')
                    ->sort()
                    ->values();

                if ($submittedIds->all() !== $existingIds->all()) {
                    $validator->errors()->add('banners', __('The banner order must include every banner.'));
                }
            },
        ];
    }
}
