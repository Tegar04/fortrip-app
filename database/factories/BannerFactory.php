<?php

namespace Database\Factories;

use App\Models\Banner;
use Illuminate\Database\Eloquent\Factories\Factory;

class BannerFactory extends Factory
{
    protected $model = Banner::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(4),
            'subtitle' => $this->faker->sentence(10),
            'button_text' => 'Lihat Paket',
            'button_url' => '/paket',
            'order' => $this->faker->numberBetween(1, 10),
            'is_active' => true,
        ];
    }
}