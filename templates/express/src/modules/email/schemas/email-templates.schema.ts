export const verificationTemplate = (url: string) => `
<html>
  <body>
    <h2>Verify your email</h2>
    <p>Click the link below to verify your account:</p>
    <a href="${url}">${url}</a>
  </body>
</html>`;

export const resetPasswordTemplate = (url: string) => `
<html>
  <body>
    <h2>Reset your password</h2>
    <p>Click the link below to reset your password:</p>
    <a href="${url}">${url}</a>
  </body>
</html>`;
