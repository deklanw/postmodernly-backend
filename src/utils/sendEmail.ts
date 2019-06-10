import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const sendEmail = async (
  email: string,
  subject: string,
  template: string
) => {
  const msg = {
    to: email,
    from: 'postmodernly@gmail.com',
    subject,
    html: template
  };
  try {
    await sgMail.send(msg);

    console.log(`Message sent to ${email} with ${template}`);
  } catch (e) {
    console.error('Failed to send email');
    console.error(e);
  }
};
