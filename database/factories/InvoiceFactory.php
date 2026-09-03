<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Invoice;
use Illuminate\Database\Eloquent\Factories\Factory;

class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    public function definition(): array
    {
        return [
            'invoice_number' => 'INV-'.now()->format('Ymd').'-'.$this->faker->unique()->numerify('####'),
            'booking_id' => Booking::factory(),
            'amount' => $this->faker->numberBetween(500000, 10000000),
            'issued_date' => now()->toDateString(),
            'due_date' => now()->addDays(7)->toDateString(),
            'status' => $this->faker->randomElement([
                'unpaid',
                'paid',
                'overdue',
            ]),
        ];
    }
}
