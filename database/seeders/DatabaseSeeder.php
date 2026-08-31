<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Package;
use App\Models\Payment;
use App\Models\SiteSetting;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | USER ADMIN
        |--------------------------------------------------------------------------
        */

        User::factory()->create([
            'name' => 'Admin Travel',
            'email' => 'admin@travel.com',
        ]);


        /*
        |--------------------------------------------------------------------------
        | SITE SETTINGS
        |--------------------------------------------------------------------------
        */

        SiteSetting::create([
            'key' => 'company_name',
            'value' => 'Arcadia Travel',
        ]);

        SiteSetting::create([
            'key' => 'company_email',
            'value' => 'info@arcadiatravel.com',
        ]);

        SiteSetting::create([
            'key' => 'company_phone',
            'value' => '081234567890',
        ]);

        SiteSetting::create([
            'key' => 'company_address',
            'value' => 'Indonesia',
        ]);

        SiteSetting::create([
            'key' => 'hero_title',
            'value' => 'Explore Indonesia Bersama Kami',
        ]);

        SiteSetting::create([
            'key' => 'hero_subtitle',
            'value' => 'Nikmati pengalaman liburan terbaik dengan paket wisata pilihan.',
        ]);


        /*
        |--------------------------------------------------------------------------
        | BANNERS
        |--------------------------------------------------------------------------
        */

        Banner::factory()->count(3)->create();


        /*
        |--------------------------------------------------------------------------
        | PACKAGES
        |--------------------------------------------------------------------------
        */

        $packages = Package::factory()
            ->count(10)
            ->create();


        /*
        |--------------------------------------------------------------------------
        | TESTIMONIALS
        |--------------------------------------------------------------------------
        */

        Testimonial::factory()
            ->count(6)
            ->create();


        /*
        |--------------------------------------------------------------------------
        | CUSTOMERS
        |--------------------------------------------------------------------------
        */

        $customers = Customer::factory()
            ->count(15)
            ->create();


        /*
        |--------------------------------------------------------------------------
        | BOOKINGS + INVOICES + PAYMENTS
        |--------------------------------------------------------------------------
        */

        foreach ($customers as $customer) {

            $bookingCount = fake()->numberBetween(1, 3);

            for ($i = 0; $i < $bookingCount; $i++) {

                $package = $packages->random();

                $participantCount = fake()->numberBetween(1, 6);

                $totalPrice = $package->price * $participantCount;

                $booking = Booking::create([
                    'customer_id' => $customer->id,
                    'package_id' => $package->id,
                    'departure_date' => fake()->dateTimeBetween(
                        '+1 week',
                        '+6 months'
                    ),
                    'participant_count' => $participantCount,
                    'total_price' => $totalPrice,
                    'status' => fake()->randomElement([
                        'pending',
                        'confirmed',
                        'cancelled',
                        'completed',
                    ]),
                ]);


                $invoice = Invoice::create([
                    'invoice_number' => 'INV-' . now()->format('Y') . '-' .
                        str_pad(
                            $booking->id,
                            5,
                            '0',
                            STR_PAD_LEFT
                        ),

                    'booking_id' => $booking->id,

                    'amount' => $booking->total_price,

                    'issued_date' => now(),

                    'due_date' => now()->addDays(7),

                    'status' => fake()->randomElement([
                        'unpaid',
                        'paid',
                        'overdue',
                    ]),
                ]);


                /*
                |--------------------------------------------------------------------------
                | PAYMENT
                |--------------------------------------------------------------------------
                */

                if ($invoice->status === 'paid') {

                    Payment::create([
                        'invoice_id' => $invoice->id,

                        'payment_reference' =>
                            'PAY-' . fake()->unique()->numerify('########'),

                        'amount' => $invoice->amount,

                        'payment_method' => fake()->randomElement([
                            'cash',
                            'bank_transfer',
                            'ewallet',
                            'payment_gateway',
                        ]),

                        'status' => 'paid',

                        'paid_at' => now(),

                        'notes' => 'Pembayaran berhasil.',
                    ]);
                }
            }
        }
    }
}