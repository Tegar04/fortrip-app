import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import TestimonialForm, {
    type TestimonialData,
} from '@/pages/admin/testimonials/testimonial-form';
import { edit, index } from '@/routes/admin/testimonials';

export default function EditTestimonial({
    testimonial,
}: {
    testimonial: TestimonialData;
}) {
    return (
        <>
            <Head title={`Edit ${testimonial.name}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <Heading
                    title="Edit testimonial"
                    description="Perbarui ulasan, rating, foto, atau status testimonial."
                />
                <TestimonialForm testimonial={testimonial} />
            </div>
        </>
    );
}

EditTestimonial.layout = ({
    testimonial,
}: {
    testimonial: TestimonialData;
}) => ({
    breadcrumbs: [
        { title: 'Testimonials', href: index() },
        { title: testimonial.name, href: edit(testimonial.id) },
    ],
});
