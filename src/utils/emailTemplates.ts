export const confirmEmailTemplate = (url: string) => `
    <h1>Click the link to confirm your account</h1>
    <a href="${url}">${url}</a>
`;

export const forgotPasswordTemplate = (url: string) => `
    <h1>Click the link to change your password</h1>
    <a href="${url}">${url}</a>
`;
