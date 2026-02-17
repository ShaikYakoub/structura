# Password Reset Feature - Setup Instructions

## ✅ Implementation Complete

The complete password reset flow has been successfully implemented with all security best practices.

## 📦 Install Dependencies

Run the following command to install required dependencies:

```bash
npm install resend @react-email/components zod
```

## 🗄️ Database Migration

Run the Prisma migration to add the `PasswordResetToken` model:

```bash
npx prisma migrate dev --name add_password_reset_tokens
npx prisma generate
```

## 🔐 Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Resend API Key (get from https://resend.com/api-keys)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# From email address (must be verified in Resend)
RESEND_FROM_EMAIL=Structura <noreply@yourdomain.com>

# App URL (used in password reset links)
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Cron job secret (generate with: openssl rand -base64 32)
CRON_SECRET=your-cron-secret-key
```

### Getting Resend API Key

1. Go to [https://resend.com](https://resend.com)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Create a new API key
5. Copy the key and add it to your `.env` file

### Verify Your Domain in Resend

1. Go to **Domains** in Resend dashboard
2. Add your domain (e.g., `yourdomain.com`)
3. Add DNS records as instructed by Resend
4. Wait for verification (usually takes a few minutes)
5. Update `RESEND_FROM_EMAIL` with your verified domain

## 🚀 Usage

### 1. User Flow

1. User clicks **"Forgot password?"** on the login page
2. User enters their email address
3. System sends password reset email
4. User clicks the link in the email
5. User enters a new password
6. User is redirected to login page

### 2. Testing Locally

```bash
# Start development server
npm run dev

# Navigate to the reset page
http://localhost:3000/auth/reset
```

### 3. Email Preview (Development)

During development, password reset emails will be logged to the console:

```
📧 Sending password reset email to: user@example.com
🔗 Reset URL: http://localhost:3000/auth/new-password?token=abc123...
```

## 🔒 Security Features

✅ **Token Expiration**: Reset tokens expire after 1 hour
✅ **One-Time Use**: Tokens are deleted after successful password reset
✅ **Email Enumeration Prevention**: Always returns success message
✅ **Password Validation**: Minimum 8 characters with Zod schema
✅ **Audit Trail**: All password reset actions are logged
✅ **Token Uniqueness**: UUID v4 tokens
✅ **Replay Attack Prevention**: Tokens deleted after use

## 🧹 Token Cleanup (Optional)

### Manual Cleanup

You can manually clean up expired tokens using the cron endpoint:

```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://yourdomain.com/api/cron/cleanup-tokens
```

### Automated Cleanup (Vercel)

Add a cron job in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-tokens",
      "schedule": "0 0 * * *"
    }
  ]
}
```

This will run daily at midnight UTC.

### Other Platforms

- **Netlify**: Use Netlify Functions with scheduled triggers
- **AWS Lambda**: Set up CloudWatch Events
- **Self-hosted**: Use system cron or PM2 cron

## 📧 Email Customization

Edit `emails/password-reset.tsx` to customize the email template:

```tsx
export function PasswordResetEmail({
  userName,
  resetUrl,
}: PasswordResetEmailProps) {
  return <Html>{/* Customize your email here */}</Html>;
}
```

## 🎨 UI Customization

The password reset pages use your existing design system:

- **Reset Page**: `app/auth/reset/page.tsx`
- **New Password Page**: `app/auth/new-password/page.tsx`
- **Reset Form**: `components/auth/reset-password-form.tsx`
- **New Password Form**: `components/auth/new-password-form.tsx`

## 🐛 Troubleshooting

### Emails Not Sending

1. Verify `RESEND_API_KEY` is correct
2. Verify `RESEND_FROM_EMAIL` domain is verified in Resend
3. Check Resend dashboard for error logs
4. Make sure you're not in Resend sandbox mode (only allows sending to verified emails)

### Token Errors

1. Check database connection
2. Ensure Prisma schema is migrated
3. Verify `NEXT_PUBLIC_APP_URL` is set correctly

### Reset Link Not Working

1. Ensure `NEXT_PUBLIC_APP_URL` matches your actual domain
2. Check that the token hasn't expired (1 hour validity)
3. Verify the token exists in the database

## 📊 Database Schema

```prisma
model PasswordResetToken {
  id        String   @id @default(uuid()) @db.Uuid
  email     String
  token     String   @unique
  expires   DateTime
  createdAt DateTime @default(now())

  user      User     @relation(fields: [email], references: [email], onDelete: Cascade)

  @@unique([email, token])
  @@index([token])
  @@index([email])
}
```

## 🔄 Updating Existing Users

No action needed! The password reset feature works with your existing user accounts.

## 📝 Testing Checklist

- [ ] User can request password reset
- [ ] Email is received with reset link
- [ ] Reset link opens the new password page
- [ ] User can set a new password
- [ ] User is redirected to login
- [ ] User can login with new password
- [ ] Expired tokens show error message
- [ ] Used tokens cannot be reused
- [ ] Non-existent emails still show success message (security)

## 🚀 Deployment

1. Add environment variables to your hosting provider
2. Run database migration on production
3. Deploy your application
4. Test the complete flow
5. (Optional) Set up automated token cleanup

---

## 🎉 Done!

Your password reset feature is now fully implemented and ready to use. Users can now recover their accounts securely through email verification.

For any issues or questions, check the troubleshooting section above or review the implementation files.
