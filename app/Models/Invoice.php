<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'invoice_number',
        'booking_id',
        'amount',
        'issued_date',
        'due_date',
        'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'issued_date' => 'date',
        'due_date' => 'date',
    ];

    /**
     * Invoice dimiliki oleh satu Booking.
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Satu Invoice dapat memiliki banyak Payment.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}