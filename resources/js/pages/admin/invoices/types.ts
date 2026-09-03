export type InvoiceData = {
    id: number;
    invoice_number: string;
    amount: string;
    paid_amount: string;
    remaining_amount: string;
    issued_date: string;
    due_date: string | null;
    status: "unpaid" | "paid" | "overdue";
    booking: {
        id: number;
        departure_date: string;
        participant_count: number;
        customer: {
            name: string;
            email: string | null;
            phone: string;
            address: string | null;
        };
        package: {
            title: string;
            destination: string;
            price: string;
        };
    };
    payments: PaymentData[];
};

export type PaymentData = {
    id: number;
    payment_reference: string | null;
    amount: string;
    payment_method: string;
    status: string;
    paid_at: string | null;
    notes: string | null;
};

export type BookingOption = {
    id: number;
    customer_name: string;
    package_title: string;
    departure_date: string;
    total_price: string;
};
