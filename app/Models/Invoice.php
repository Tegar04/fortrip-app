<?php

namespace App\Models;

use Database\Factories\InvoiceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    /** @use HasFactory<InvoiceFactory> */
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'booking_id',
        'amount',
        'issued_date',
        'due_date',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'issued_date' => 'date',
            'due_date' => 'date',
        ];
    }

    /** @return BelongsTo<Booking, $this> */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /** @return HasMany<Payment, $this> */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function paidAmount(): string
    {
        if (array_key_exists('paid_amount', $this->attributes)) {
            return number_format((float) $this->attributes['paid_amount'], 2, '.', '');
        }

        $paidAmount = $this->relationLoaded('payments')
            ? $this->payments->where('status', 'paid')->sum('amount')
            : $this->payments()->where('status', 'paid')->sum('amount');

        return number_format((float) $paidAmount, 2, '.', '');
    }

    public function remainingAmount(): string
    {
        return number_format(max(0, (float) $this->amount - (float) $this->paidAmount()), 2, '.', '');
    }

    public function calculatedStatus(): string
    {
        if ((float) $this->remainingAmount() <= 0) {
            return 'paid';
        }

        if ($this->due_date?->isBefore(today())) {
            return 'overdue';
        }

        return 'unpaid';
    }

    public function synchronizeStatus(): void
    {
        $status = $this->calculatedStatus();

        if ($this->status !== $status) {
            $this->update(['status' => $status]);
        }
    }
}
