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

interface BookingAcceptedTemplateData {
    customerName: string;
    vendorBusinessName: string;
    eventDate: string;
    eventAddress: string;
    guestCount: number;
}

export function generateBookingAcceptedTemplate({
    customerName,
    vendorBusinessName,
    eventDate,
    eventAddress,
    guestCount,
}: BookingAcceptedTemplateData) {
    return (
        <Html>
            <Head />
            <Preview>Your booking with {vendorBusinessName} has been confirmed</Preview>

            <Tailwind>
                <Body className="bg-[#f5f5f5] m-0 font-sans">
                    <Container className="max-w-150 mx-auto my-10 bg-white rounded-[8px] overflow-hidden">
                        {/* HEADER */}
                        <Section className="bg-[#28a745] py-10 px-5 text-center">
                            <Heading className="text-white text-[24px] font-semibold m-0">
                                Booking Confirmed!
                            </Heading>
                        </Section>

                        {/* CONTENT */}
                        <Section className="px-7.5 py-10 text-[#333]">
                            <Text className="text-[18px] mb-5">
                                Hi {customerName},
                            </Text>

                            <Text className="text-[16px] leading-6 mb-5">
                                Great news! <strong>{vendorBusinessName}</strong>{' '}
                                has accepted your booking request. Your event is
                                now confirmed.
                            </Text>

                            {/* BOOKING DETAILS */}
                            <Section className="bg-[#d4edda] border-l-4 border-[#28a745] px-3.75 py-3.75 my-5">
                                <Text className="text-[14px] text-[#155724] m-0 font-semibold">
                                    Confirmed Booking Details
                                </Text>
                                <Text className="text-[14px] text-[#155724] m-0">
                                    • <strong>Vendor:</strong>{' '}
                                    {vendorBusinessName}
                                </Text>
                                <Text className="text-[14px] text-[#155724] m-0">
                                    • <strong>Event Date:</strong> {eventDate}
                                </Text>
                                <Text className="text-[14px] text-[#155724] m-0">
                                    • <strong>Location:</strong> {eventAddress}
                                </Text>
                                <Text className="text-[14px] text-[#155724] m-0">
                                    • <strong>Guest Count:</strong> {guestCount}
                                </Text>
                            </Section>

                            <Text className="text-[16px] leading-6">
                                You can view your booking details anytime from
                                your dashboard.
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