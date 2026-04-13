import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Link,
  Text,
} from "@react-email/components";

interface VendorApplicationApprovedTemplateData {
  name: string;
  businessName: string;
}

export function generateVendorApplicationApprovedTemplate({
  name,
  businessName,
}: VendorApplicationApprovedTemplateData) {
  const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL;
  return (
    <Html>
      <Head />
      <Preview>Vendor Application Approved</Preview>

      <Tailwind>
        <Body className="bg-[#f5f5f5] m-0 font-sans">
          <Container className="max-w-[600px] mx-auto my-[40px] bg-white rounded-[8px] overflow-hidden">
            {/* HEADER */}
            <Section className="bg-[#43e97b] py-[40px] px-[20px] text-center">
              <Heading className="text-white text-[24px] font-semibold m-0">
                Congratulations!
              </Heading>
            </Section>

            {/* CONTENT */}
            <Section className="px-[30px] py-[40px] text-[#333]">
              <Text className="text-[18px] mb-[20px]">Hi {name},</Text>

              <Text className="text-[16px] leading-[24px] mb-[20px]">
                Your Application Has Been Approved!
              </Text>

              <Text className="text-[18px] mb-[20px]">{businessName}</Text>

              <Text className="text-[16px] mb-[20px]">
                We are excited to welcome you to the CaterConnect vendor
                community! Your application has been reviewed and approved. You
                now have full access to our vendor dashboard.
              </Text>

              <Section className="text-center my-[30px]">
                <Link
                  href={`${dashboardUrl}/vendor/dashboard`}
                  className="inline-block bg-[#667eea] text-white px-[24px] py-[12px] rounded-[6px] text-[14px] font-semibold no-underline"
                >
                  Access Your Vendor Dashboard →
                </Link>
              </Section>

              <Section className="bg-[#fff3cd] border-l-[4px] border-[#ffc107] px-[15px] py-[15px] my-[20px]">
                <Text className="text-[14px] text-[#856404] m-0">
                  <h3>Getting Started</h3>
                </Text>

                <Section className="pl-[20px]">
                  <Text className="text-[14px] text-[#856404] m-0">
                    • <strong>Complete Your Profile:</strong> Add photos,
                    detailed descriptions, and service areas
                  </Text>

                  <Text className="text-[14px] text-[#856404] m-0">
                    • <strong>Create Your Menu:</strong> Showcase your offerings
                    with pricing and photos
                  </Text>

                  <Text className="text-[14px] text-[#856404] m-0">
                    • <strong>Set Your Availability:</strong> Let customers know
                    when you are available
                  </Text>

                  <Text className="text-[14px] text-[#856404] m-0">
                    • <strong>Start Receiving Bookings:</strong> Get notified
                    when customers request your services
                  </Text>
                </Section>

                <Text className="text-[14px] text-[#856404] m-0">
                  Our team is here to support you every step of the way.
                  Contact our vendor success team if you need any assistance.
                </Text>

                <Text className="text-[14px] text-[#856404] m-0">
                   Welcome aboard, and heres to your success with CaterConnect!
                </Text>
              </Section>
            </Section>

            {/* FOOTER */}
            <Section className="bg-[#f8f9fa] px-[30px] py-[30px] text-center border-t border-[#e9ecef]">
              <Text className="text-[14px] text-[#666] m-0">
                Need help getting started? Contact us at vendors@caterconnect.com
              </Text>

              <Text className="text-[12px] text-[#999] mt-[20px]">
                © {new Date().getFullYear()} CaterConnect. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
