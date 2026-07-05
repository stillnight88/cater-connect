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
import { formatOTPForDisplay } from "@/lib/auth/otp";

interface PasswordResetTemplateData {
  name: string;
  otp: string;
}

export function generatePasswordResetTemplate({
  name,
  otp,
}: PasswordResetTemplateData) {
  const formattedOTP = formatOTPForDisplay(otp);

  return (
    <Html>
      <Head />
      <Preview>Your Reset Code</Preview>

      <Tailwind>
        <Body className="bg-[#f5f5f5] m-0 font-sans">
          <Container className="max-w-[600px] mx-auto my-[40px] bg-white rounded-[8px] overflow-hidden">
            {/* HEADER */}
            <Section className="bg-[#f5576c] py-[40px] px-[20px] text-center">
              <Heading className="text-white text-[24px] font-semibold m-0">
                Password Reset Request
              </Heading>
            </Section>

            {/* CONTENT */}
            <Section className="px-[30px] py-[40px] text-[#333]">
              <Text className="text-[18px] mb-[20px]">Hi {name},</Text>

              <Text className="text-[16px] leading-[24px] mb-[20px]">
                We received a request to reset your password for your
                CaterConnect account. Use the verification code below to proceed
                with resetting your password.
              </Text>

              {/* OTP BOX */}
              <Section className="bg-[#f8f9fa] border-2 border-dashed border-[#667eea] rounded-[8px] py-[30px] px-[20px] text-center my-[30px]">
                <Text className="text-[12px] text-[#666] uppercase tracking-[1px] mb-[10px]">
                  Your Reset Code
                </Text>

                <Text className="text-[32px] font-bold tracking-[6px] text-[#667eea] my-[10px]">
                  {formattedOTP}
                </Text>

                <Text className="text-[14px] text-[#666]">
                  This code expires in 10 minutes
                </Text>
              </Section>

              <Text className="text-[16px] mb-[20px]">
                Enter this code on the password reset page to create a new
                password for your account.
              </Text>

              {/* WARNING */}
              <Section className="bg-[#fff3cd] border-l-[4px] border-[#ffc107] px-[15px] py-[15px] my-[20px]">
                <Text className="text-[14px] text-[#856404] m-0">
                  <strong>Important Security Notice:</strong>
                </Text>

                <Text className="text-[14px] text-[#856404] mt-[8px] mb-[10px]">
                  If you did n0t request a password reset, someone may be trying
                  to access your account. Please:
                </Text>

                <Section className="pl-[20px]">
                  <Text className="text-[14px] text-[#856404] m-0">
                    • Do not share this code with anyone
                  </Text>

                  <Text className="text-[14px] text-[#856404] m-0">
                    • Contact our support team immediately
                  </Text>

                  <Text className="text-[14px] text-[#856404] m-0">
                    • Consider changing your password if you suspect
                    unauthorized access
                  </Text>
                </Section>

                <Text className="text-[14px] text-[#856404] m-0">
                  <strong>⚠️ Reminder:</strong> CaterConnect will never ask you
                  for your password or verification code via email or phone.
                </Text>
              </Section>
            </Section>

            {/* FOOTER */}
            <Section className="bg-[#f8f9fa] px-[30px] py-[30px] text-center border-t border-[#e9ecef]">
              <Text className="text-[14px] text-[#666] m-0">
                Need help? support@caterconnect.com
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
