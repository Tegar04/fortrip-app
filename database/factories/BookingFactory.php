<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Package;
use Illuminate\Database\Eloquent\Factories\Factory;

class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        $participantCount = $this->faker->numberBetween(1, 6);
        $pricePerPerson = $this->faker->numberBetween(500000, 3000000);

        return [
            'customer_id' => Customer::factory(),
            'package_id' => Package::factory(),
            'departure_date' => $this->faker->dateTimeBetween('+1 week', '+6 months'),
            'participant_count' => $participantCount,
            'total_price' => $participantCount * $pricePerPerson,
            'status' => $this->faker->randomElement([
                'pending',
                'confirmed',
                'cancelled',
                'completed',
            ]),
        ];
    }
}