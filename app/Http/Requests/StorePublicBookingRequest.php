<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePublicBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'regex:/^[1-9][0-9]{7,14}$/'],
            'email' => ['required', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:1000'],
            'departure_date' => ['required', 'date_format:Y-m-d', 'after_or_equal:'.today(config('app.timezone'))->toDateString()],
            'participant_count' => ['required', 'integer', 'min:1', 'max:50'],
            'submission_token' => ['required', 'uuid'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $phone = $this->input('phone');

        if (is_string($phone) && preg_match('/^\+?[0-9 ()-]+$/', $phone)) {
            $phone = preg_replace('/[ ()-]/', '', $phone);
            $phone = ltrim($phone, '+');

            if (str_starts_with($phone, '0')) {
                $phone = '62'.substr($phone, 1);
            }

            $this->merge(['phone' => $phone]);
        }
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'required' => ':attribute wajib diisi.',
            'string' => ':attribute harus berupa teks.',
            'name.max' => 'Nama maksimal 255 karakter.',
            'phone.regex' => 'Masukkan nomor telepon yang valid, misalnya 081234567890 atau +6281234567890.',
            'email.email' => 'Masukkan alamat email yang valid.',
            'email.max' => 'Email maksimal 255 karakter.',
            'address.max' => 'Alamat maksimal 1000 karakter.',
            'departure_date.date_format' => 'Masukkan tanggal keberangkatan yang valid.',
            'departure_date.after_or_equal' => 'Tanggal keberangkatan tidak boleh sebelum hari ini.',
            'participant_count.integer' => 'Jumlah peserta harus berupa bilangan bulat.',
            'participant_count.min' => 'Jumlah peserta minimal 1 orang.',
            'participant_count.max' => 'Jumlah peserta maksimal 50 orang.',
            'submission_token.uuid' => 'Form booking tidak valid. Muat ulang halaman lalu coba lagi.',
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return [
            'name' => 'Nama', 'phone' => 'Nomor telepon', 'email' => 'Email',
            'address' => 'Alamat', 'departure_date' => 'Tanggal keberangkatan',
            'participant_count' => 'Jumlah peserta', 'submission_token' => 'Token pengajuan',
        ];
    }
}
