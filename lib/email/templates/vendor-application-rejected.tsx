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

interface VendorApplicationRejectedTemplateData {
  name: string;
  businessName: string;
  rejectionReason: string;
}

export function generateVendorApplicationRejectedTemplate({
  name,
  businessName,
  rejectionReason,
}: VendorApplicationRejectedTemplateData) {
  return (
    <Html>
      <Head />
      <Preview>Vendor Application Update</Preview>

      <Tailwind>
        <Body className="bg-[#f5f5f5] m-0 font-sans">
          <Container className="max-w-[600px] mx-auto my-[40px] bg-white rounded-[8px] overflow-hidden">
            {/* HEADER */}
            <Section className="bg-[#7f8c8d] py-[40px] px-[20px] text-center">
              <Heading className="text-white text-[24px] font-semibold m-0">
                Application Status Update
              </Heading>
            </Section>

            {/* CONTENT */}
            <Section className="px-[30px] py-[40px] text-[#333]">
              <Text className="text-[18px] mb-[20px]">Hi {name},</Text>

              <Text className="text-[16px] leading-[24px] mb-[20px]">
                Thank you for your interest in becoming a vendor on
                CaterConnect. We have carefully reviewed your application for:
              </Text>

              <Text className="text-[18px] mb-[20px]">{businessName}</Text>

              <Text className="text-[16px] mb-[20px]">
                After careful consideration, we are unable to approve your
                application at this time. This decision was made based on our
                current vendor requirements and platform standards.
              </Text>

              <Text className="text-[16px] mb-[20px]">
                <h3>Feedback from Our Review Team:</h3>
              </Text>
              <Text className="text-[16px] mb-[20px]">
                <h3>{rejectionReason}</h3>
              </Text>

              <Section className="bg-[#fff3cd] border-l-[4px] border-[#ffc107] px-[15px] py-[15px] my-[20px]">
                <Text className="text-[14px] text-[#856404] m-0">
                  <h3>What You Can Do:</h3>
                </Text>

                <Section className="pl-[20px]">
                  <Text className="text-[14px] text-[#856404] m-0">
                    • Review the feedback provided above
                  </Text>

                  <Text className="text-[14px] text-[#856404] m-0">
                    • Address the mentioned concerns
                  </Text>

                  <Text className="text-[14px] text-[#856404] m-0">
                    • You are welcome to reapply after making improvements
                  </Text>

                  <Text className="text-[14px] text-[#856404] m-0">
                    • Contact our vendor relations team if you have questions
                  </Text>
                </Section>

                <Text className="text-[14px] text-[#856404] m-0">
                  We appreciate the time you took to apply and encourage you to
                  reapply once you have addressed the feedback. Our goal is to
                  maintain a high-quality marketplace that serves our customers
                  well.
                </Text>

                <Text className="text-[14px] text-[#856404] m-0">
                  If you have any questions about this decision or would like
                  clarification on our requirements, please do not hesitate to
                  reach out to our team.
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
