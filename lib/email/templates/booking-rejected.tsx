import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Tailwind,
    Text,
} from '@react-email/components';

interface BookingRejectedTemplateData {
    customerName: string;
    vendorBusinessName: string;
    eventDate: string;
    rejectionReason: string;
}

export function generateBookingRejectedTemplate({
    customerName,
    vendorBusinessName,
    eventDate,
    rejectionReason,
}: BookingRejectedTemplateData) {
    return (
        <Html>
            <Head />
            <Preview>Update on your booking request with {vendorBusinessName}</Preview>

            <Tailwind>
                <Body className="bg-[#f5f5f5] m-0 font-sans">
                    <Container className="max-w-150 mx-auto my-10 bg-white rounded-[8px] overflow-hidden">
                        {/* HEADER */}
                        <Section className="bg-[#dc3545] py-10 px-5 text-center">
                            <Heading className="text-white text-[24px] font-semibold m-0">
                                Booking Request Update
                            </Heading>
                        </Section>

                        {/* CONTENT */}
                        <Section className="px-7.5 py-10 text-[#333]">
                            <Text className="text-[18px] mb-5">
                                Hi {customerName},
                            </Text>

                            <Text className="text-[16px] leading-6 mb-5">
                                Unfortunately, <strong>{vendorBusinessName}</strong>{' '}
                                was unable to accept your booking request for{' '}
                                <strong>{eventDate}</strong>.
                            </Text>

                            {/* REJECTION DETAILS */}
                            <Section className="bg-[#f8d7da] border-l-4 border-[#dc3545] px-3.75 py-3.75 my-5">
                                <Text className="text-[14px] text-[#721c24] m-0 font-semibold">
                                    Reason from vendor
                                </Text>
                                <Text className="text-[14px] text-[#721c24] m-0">
                                    {rejectionReason}
                                </Text>
                            </Section>

                            <Text className="text-[16px] leading-6">
                                Do not worry — there are many great vendors
                                available on CaterConnect. Browse other vendors
                                from your dashboard and find the perfect match
                                for your event.
                            </Text>
                        </Section>

                        {/* FOOTER */}
                        <Section className="bg-[#f8f9fa] px-7.5 py-7.5 text-center border-t border-[#e9ecef]">
                            <Text className="text-[14px] text-[#666] m-0">
                                Questions? Contact us at support@caterconnect.com
                            </Text>
                            <Text className="text-[12px] text-[#999] mt-5">
                                © {new Date().getFullYear()} CaterConnect. All
                                rights reserved.
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}