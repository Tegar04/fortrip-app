<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCustomerRequest;
use App\Http\Requests\Admin\UpdateCustomerRequest;
use App\Models\Customer;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(): Response
    {
        $customers = Customer::query()
            ->withCount('bookings')
            ->latest('id')
            ->get()
            ->map(fn (Customer $customer): array => $this->customerData($customer));

        return Inertia::render('admin/customers/index', [
            'customers' => $customers,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/customers/create');
    }

    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        Customer::query()->create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Customer created.'),
        ]);

        return to_route('admin.customers.index');
    }

    public function edit(Customer $customer): Response
    {
        $customer->loadCount('bookings');

        return Inertia::render('admin/customers/edit', [
            'customer' => $this->customerData($customer),
        ]);
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): RedirectResponse
    {
        $customer->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Customer updated.'),
        ]);

        return to_route('admin.customers.index');
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        if ($customer->bookings()->exists()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('Customers with bookings cannot be deleted.'),
            ]);

            return back();
        }

        $customer->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Customer deleted.'),
        ]);

        return to_route('admin.customers.index');
    }

    /** @return array{id: int, name: string, email: ?string, phone: string, address: ?string, bookings_count: int} */
    private function customerData(Customer $customer): array
    {
        return [
            'id' => $customer->id,
            'name' => $customer->name,
            'email' => $customer->email,
            'phone' => $customer->phone,
            'address' => $customer->address,
            'bookings_count' => $customer->bookings_count ?? $customer->bookings()->count(),
        ];
    }
}
