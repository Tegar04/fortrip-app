<?php

namespace Database\Factories;

use App\Models\Package;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PackageFactory extends Factory
{
    protected $model = Package::class;

    public function definition(): array
    {
        $title = $this->faker->randomElement([
            'Paket Wisata Bromo',
            'Paket Wisata Bali',
            'Paket Wisata Lombok',
            'Paket Wisata Labuan Bajo',
            'Paket Wisata Yogyakarta',
        ]);

        return [
            'title' => $title,

            'slug' => Str::slug($title) . '-' .
                $this->faker->unique()->numberBetween(1, 9999),

            'description' => $this->faker->paragraph(),

            'destination' => $this->faker->randomElement([
                'Bromo',
                'Bali',
                'Lombok',
                'Labuan Bajo',
                'Yogyakarta',
            ]),

            'duration_days' => $this->faker->numberBetween(2, 7),

            'price' => $this->faker->numberBetween(
                500000,
                5000000
            ),

            'is_featured' => $this->faker->boolean(30),

            'is_active' => true,
        ];
    }
}