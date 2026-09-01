import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import TestimonialForm from '@/pages/admin/testimonials/testimonial-form';
import { create, index } from '@/routes/admin/testimonials';

export default function CreateTestimonial() {
    return (
        <>
            <Head title="Buat testimonial" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <Heading
                    title="Buat testimonial"
                    description="Tambahkan ulasan pelanggan baru untuk website."
                />
                <TestimonialForm />
            </div>
        </>
    );
}

CreateTestimonial.layout = {
    breadcrumbs: [
        { title: 'Testimonials', href: index() },
        { title: 'Buat testimonial', href: create() },
    ],
};
