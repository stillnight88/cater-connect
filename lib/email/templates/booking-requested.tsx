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

interface BookingRequestedTemplateData {
    vendorName: string;
    customerName: string;
    eventDate: string;
    eventAddress: string;
    guestCount: number;
    notes?: string;
}

export function generateBookingRequestedTemplate({
    vendorName,
    customerName,
    eventDate,
    eventAddress,
    guestCount,
    notes,
}: BookingRequestedTemplateData) {
    return (
        <Html>
            <Head />
            <Preview>New Booking Request from {customerName}</Preview>

            <Tailwind>
                <Body className="bg-[#f5f5f5] m-0 font-sans">
                    <Container className="max-w-150 mx-auto my-10 bg-white rounded-[8px] overflow-hidden">
                        {/* HEADER */}
                        <Section className="bg-[#ffa751] py-10 px-5 text-center">
                            <Heading className="text-white text-[24px] font-semibold m-0">
                                New Booking Request
                            </Heading>
                        </Section>

                        {/* CONTENT */}
                        <Section className="px-7.5 py-10 text-[#333]">
                            <Text className="text-[18px] mb-5">
                                Hi {vendorName},
                            </Text>

                            <Text className="text-[16px] leading-6 mb-5">
                                You have received a new booking request from{' '}
                                <strong>{customerName}</strong>. Please review
                                the details below and accept or reject the
                                request from your dashboard.
                            </Text>

                            {/* BOOKING DETAILS */}
                            <Section className="bg-[#fff3cd] border-l-4 border-[#ffc107] px-3.75 py-3.75 my-5">
                                <Text className="text-[14px] text-[#856404] m-0 font-semibold">
                                    Booking Details
                                </Text>
                                <Text className="text-[14px] text-[#856404] m-0">
                                    • <strong>Customer:</strong> {customerName}
                                </Text>
                                <Text className="text-[14px] text-[#856404] m-0">
                                    • <strong>Event Date:</strong> {eventDate}
                                </Text>
                                <Text className="text-[14px] text-[#856404] m-0">
                                    • <strong>Location:</strong> {eventAddress}
                                </Text>
                                <Text className="text-[14px] text-[#856404] m-0">
                                    • <strong>Guest Count:</strong> {guestCount}
                                </Text>
                                {notes && (
                                    <Text className="text-[14px] text-[#856404] m-0">
                                        • <strong>Notes:</strong> {notes}
                                    </Text>
                                )}
                            </Section>

                            <Text className="text-[16px] leading-6">
                                Log in to your vendor dashboard to accept or
                                reject this request.
                            </Text>
                        </Section>

                        {/* FOOTER */}
                        <Section className="bg-[#f8f9fa] px-7.5 py-7.5 text-center border-t border-[#e9ecef]">
                            <Text className="text-[14px] text-[#666] m-0">
                                Questions? Contact us at vendors@caterconnect.com
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