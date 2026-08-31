<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'invoice_id' => Invoice::factory(),
            'payment_reference' => 'PAY-' . $this->faker->unique()->numerify('########'),
            'amount' => $this->faker->numberBetween(500000, 5000000),
            'payment_method' => $this->faker->randomElement([
                'cash',
                'bank_transfer',
                'ewallet',
                'payment_gateway',
            ]),
            'status' => $this->faker->randomElement([
                'pending',
                'paid',
                'failed',
            ]),
            'paid_at' => $this->faker->optional()->dateTimeBetween('-1 month', 'now'),
            'notes' => $this->faker->optional()->sentence(),
        ];
    }
}