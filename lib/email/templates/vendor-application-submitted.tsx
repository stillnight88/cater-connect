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
} from "@react-email/components";

interface VendorApplicationSubmittedTemplateData {
  name: string;
  businessName: string;
}

export function generateVendorApplicationSubmittedTemplate({
  name,
  businessName,
}: VendorApplicationSubmittedTemplateData) {
  return (
    <Html>
      <Head />
      <Preview>Vendor Application Submitted</Preview>

      <Tailwind>
        <Body className="bg-[#f5f5f5] m-0 font-sans">
          <Container className="max-w-[600px] mx-auto my-[40px] bg-white rounded-[8px] overflow-hidden">
            {/* HEADER */}
            <Section className="bg-[#ffa751] py-[40px] px-[20px] text-center">
              <Heading className="text-white text-[24px] font-semibold m-0">
                Application Received!
              </Heading>
            </Section>

            {/* CONTENT */}
            <Section className="px-[30px] py-[40px] text-[#333]">
              <Text className="text-[18px] mb-[20px]">Hi {name},</Text>

              <Text className="text-[16px] leading-[24px] mb-[20px]">
                Thank you for submitting your vendor application to
                CaterConnect! We have successfully received your application
                for:
              </Text>

              <Text className="text-[18px] mb-[20px]">{businessName}</Text>

              <Text className="text-[16px] mb-[20px]">
                Your application is now under review by our team. We carefully
                evaluate each submission to ensure we partner with the best
                catering service providers.
              </Text>

              <Section className="bg-[#fff3cd] border-l-[4px] border-[#ffc107] px-[15px] py-[15px] my-[20px]">
                <Text className="text-[14px] text-[#856404] m-0">
                  <h3>What Happens Next?</h3>
                </Text>

                <Section className="pl-[20px]">
                  <Text className="text-[14px] text-[#856404] m-0">
                    • <strong>Review Process:</strong> Our team will review your
                    application within 2-3 business days
                  </Text>

                  <Text className="text-[14px] text-[#856404] m-0">
                    • <strong>Verification:</strong> We may contact you for
                    additional information if needed
                  </Text>

                  <Text className="text-[14px] text-[#856404] m-0">
                    • <strong>Decision:</strong> You will receive an email
                    notification once a decision is made
                  </Text>
                </Section>

                <Text className="text-[14px] text-[#856404] m-0">
                  In the meantime, feel free to explore our platform and see how
                  other vendors are succeeding with CaterConnect.
                </Text>

                <Text className="text-[14px] text-[#856404] m-0">
                  If you have any questions about your application, do not
                  hesitate to reach out to our support team.
                </Text>
              </Section>
            </Section>

            {/* FOOTER */}
            <Section className="bg-[#f8f9fa] px-[30px] py-[30px] text-center border-t border-[#e9ecef]">
              <Text className="text-[14px] text-[#666] m-0">
                Questions? Contact us at vendors@caterconnect.com
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
