<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePaymentRequest;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function store(StorePaymentRequest $request, Invoice $invoice): RedirectResponse
    {
        DB::transaction(function () use ($request, $invoice): void {
            $lockedInvoice = Invoice::query()->lockForUpdate()->findOrFail($invoice->id);
            $validated = $request->validated();

            if ((float) $validated['amount'] > (float) $lockedInvoice->remainingAmount()) {
                throw ValidationException::withMessages([
                    'amount' => __('The payment amount cannot exceed the remaining invoice balance.'),
                ]);
            }

            $lockedInvoice->payments()->create([
                ...$validated,
                'paid_at' => $validated['status'] === 'paid' ? now() : null,
            ]);

            $lockedInvoice->synchronizeStatus();
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Payment recorded.'),
        ]);

        return back();
    }

    public function destroy(Invoice $invoice, Payment $payment): RedirectResponse
    {
        $payment->delete();
        $invoice->synchronizeStatus();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Payment deleted.'),
        ]);

        return back();
    }
}
