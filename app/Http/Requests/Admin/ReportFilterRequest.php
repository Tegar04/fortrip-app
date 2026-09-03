<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ReportFilterRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->query() === []) {
            $this->merge([
                'start_date' => today()->startOfMonth()->toDateString(),
                'end_date' => today()->toDateString(),
            ]);
        }
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $permission = $this->routeIs('admin.reports.export')
            ? 'export reports'
            : 'view reports';

        return $this->user()?->can($permission) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
        ];
    }

    /** @return array{start_date: string, end_date: string} */
    public function filters(): array
    {
        /** @var array{start_date: string, end_date: string} $filters */
        $filters = $this->validated();

        return $filters;
    }
}
