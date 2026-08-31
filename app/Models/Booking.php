<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Booking extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'customer_id',
        'package_id',
        'departure_date',
        'participant_count',
        'total_price',
        'status',
    ];

    protected $casts = [
        'departure_date' => 'date',
        'participant_count' => 'integer',
        'total_price' => 'decimal:2',
    ];

    /**
     * Booking dimiliki oleh satu Customer.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Booking menggunakan satu Package.
     */
    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    /**
     * Satu Booking memiliki satu Invoice.
     */
    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class);
    }
}