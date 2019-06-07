import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const sendEmail = async (email: string, url: string) => {
  const msg = {
    to: email,
    from: 'postmodernly@gmail.com',
    subject: 'Confirm your Postmodernly account',
    html: `
    <h1>Click the link to confirm your account</h1>
    <a href="${url}">${url}</a>
    `
  };
  try {
    await sgMail.send(msg);

    console.log(`Message sent to ${email} with ${url}`);
  } catch (e) {
    console.error('Failed to send email');
    console.error(e);
  }
};
