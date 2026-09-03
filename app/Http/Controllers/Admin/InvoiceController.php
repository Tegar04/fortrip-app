<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreInvoiceRequest;
use App\Models\Booking;
use App\Models\Invoice;
use App\Models\SiteSetting;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function index(): Response
    {
        $invoices = Invoice::query()
            ->with(['booking.customer', 'booking.package'])
            ->withSum(['payments as paid_amount' => fn ($query) => $query->where('status', 'paid')], 'amount')
            ->latest('id')
            ->get()
            ->map(fn (Invoice $invoice): array => $this->invoiceData($invoice));

        return Inertia::render('admin/invoices/index', [
            'invoices' => $invoices,
        ]);
    }

    public function create(Request $request): Response
    {
        $bookings = Booking::query()
            ->where('status', '!=', 'cancelled')
            ->whereDoesntHave('invoice')
            ->with(['customer:id,name', 'package:id,title'])
            ->latest('id')
            ->get()
            ->map(fn (Booking $booking): array => [
                'id' => $booking->id,
                'customer_name' => $booking->customer->name,
                'package_title' => $booking->package->title,
                'departure_date' => $booking->departure_date->toDateString(),
                'total_price' => $booking->total_price,
            ]);

        return Inertia::render('admin/invoices/create', [
            'bookings' => $bookings,
            'default_due_date' => now()->addDays(7)->toDateString(),
            'selected_booking_id' => $bookings->contains('id', $request->integer('booking_id'))
                ? $request->integer('booking_id')
                : null,
        ]);
    }

    public function store(StoreInvoiceRequest $request): RedirectResponse
    {
        $invoice = DB::transaction(function () use ($request): Invoice {
            $booking = Booking::query()->lockForUpdate()->findOrFail($request->integer('booking_id'));

            if ($booking->status === 'cancelled') {
                throw ValidationException::withMessages([
                    'booking_id' => __('Cancelled bookings cannot be invoiced.'),
                ]);
            }

            if ($booking->invoice()->exists()) {
                throw ValidationException::withMessages([
                    'booking_id' => __('This booking already has an invoice.'),
                ]);
            }

            $issuedDate = today();

            return $booking->invoice()->create([
                'invoice_number' => sprintf('INV-%s-%04d', $issuedDate->format('Ymd'), $booking->id),
                'amount' => $booking->total_price,
                'issued_date' => $issuedDate,
                'due_date' => $request->validated('due_date') ?: null,
                'status' => 'unpaid',
            ]);
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Invoice created.'),
        ]);

        return to_route('admin.invoices.show', $invoice);
    }

    public function show(Invoice $invoice): Response
    {
        $invoice->load(['booking.customer', 'booking.package', 'payments' => fn ($query) => $query->latest('id')]);
        $invoice->synchronizeStatus();

        return Inertia::render('admin/invoices/show', [
            'invoice' => $this->invoiceData($invoice),
        ]);
    }

    public function destroy(Invoice $invoice): RedirectResponse
    {
        if ($invoice->payments()->exists()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('Invoices with payment history cannot be deleted.'),
            ]);

            return back();
        }

        $invoice->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Invoice deleted.'),
        ]);

        return to_route('admin.invoices.index');
    }

    public function download(Invoice $invoice): HttpResponse
    {
        $invoice->load(['booking.customer', 'booking.package', 'payments' => fn ($query) => $query->where('status', 'paid')->oldest('paid_at')]);
        $invoice->synchronizeStatus();
        $settings = SiteSetting::query()
            ->whereIn('key', ['company_name', 'company_address', 'company_phone', 'company_email'])
            ->pluck('value', 'key')
            ->all();

        return Pdf::loadView('pdf.invoice', [
            'invoice' => $invoice,
            'settings' => $settings,
            'paidAmount' => $invoice->paidAmount(),
            'remainingAmount' => $invoice->remainingAmount(),
        ])->setPaper('a4')->download($invoice->invoice_number.'.pdf');
    }

    /** @return array<string, mixed> */
    private function invoiceData(Invoice $invoice): array
    {
        $paidAmount = $invoice->paidAmount();
        $remainingAmount = number_format(max(0, (float) $invoice->amount - (float) $paidAmount), 2, '.', '');

        return [
            'id' => $invoice->id,
            'invoice_number' => $invoice->invoice_number,
            'amount' => $invoice->amount,
            'paid_amount' => $paidAmount,
            'remaining_amount' => $remainingAmount,
            'issued_date' => $invoice->issued_date->toDateString(),
            'due_date' => $invoice->due_date?->toDateString(),
            'status' => (float) $remainingAmount <= 0
                ? 'paid'
                : ($invoice->due_date?->isBefore(today()) ? 'overdue' : 'unpaid'),
            'booking' => [
                'id' => $invoice->booking->id,
                'departure_date' => $invoice->booking->departure_date->toDateString(),
                'participant_count' => $invoice->booking->participant_count,
                'customer' => [
                    'name' => $invoice->booking->customer->name,
                    'email' => $invoice->booking->customer->email,
                    'phone' => $invoice->booking->customer->phone,
                    'address' => $invoice->booking->customer->address,
                ],
                'package' => [
                    'title' => $invoice->booking->package->title,
                    'destination' => $invoice->booking->package->destination,
                    'price' => $invoice->booking->package->price,
                ],
            ],
            'payments' => $invoice->relationLoaded('payments')
                ? $invoice->payments->map(fn ($payment): array => [
                    'id' => $payment->id,
                    'payment_reference' => $payment->payment_reference,
                    'amount' => $payment->amount,
                    'payment_method' => $payment->payment_method,
                    'status' => $payment->status,
                    'paid_at' => $payment->paid_at?->toIso8601String(),
                    'notes' => $payment->notes,
                ])->values()->all()
                : [],
        ];
    }
}
