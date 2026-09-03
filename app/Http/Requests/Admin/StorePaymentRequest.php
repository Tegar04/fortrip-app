<?php

namespace App\Http\Requests\Admin;

use App\Models\Invoice;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StorePaymentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('edit invoices') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'payment_reference' => ['nullable', 'string', 'max:255', Rule::unique('payments', 'payment_reference')],
            'amount' => ['required', 'numeric', 'decimal:0,2', 'min:0.01', 'max:9999999999.99'],
            'payment_method' => ['required', Rule::in(['cash', 'bank_transfer', 'ewallet', 'payment_gateway'])],
            'status' => ['required', Rule::in(['pending', 'paid', 'failed'])],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /** @return array<int, callable(Validator): void> */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->has('amount')) {
                    return;
                }

                $invoice = $this->route('invoice');

                if (! $invoice instanceof Invoice) {
                    return;
                }

                if ((float) $this->input('amount') > (float) $invoice->remainingAmount()) {
                    $validator->errors()->add('amount', __('The payment amount cannot exceed the remaining invoice balance.'));
                }
            },
        ];
    }
}
