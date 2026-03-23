import emailjs from "@emailjs/browser";

type SendParams = {
  templateId?: string;
  variables: Record<string, any>;
};

export async function sendEmail({ templateId, variables }: SendParams) {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  if (!serviceId || !publicKey || !templateId) {
    // EmailJS not configured; silently skip.
    return null;
  }
  return emailjs.send(serviceId, templateId, variables, publicKey);
}
