# Email & SEO System Documentation

## Overview

This implementation provides comprehensive Email Sending with Resend and Dynamic SEO capabilities for Structura. It includes real email delivery for contact forms and newsletters, plus dynamic metadata generation for optimal search engine and social media optimization.

## Features Implemented

### 1. Email Engine with Resend

**Real Email Sending:**
- Contact form submissions sent to site owners
- Newsletter subscription confirmations
- Professional HTML email templates
- Reply-to functionality for contact forms
- Multi-tenant email routing (emails sent to site owner's tenant email)

**Dependencies:**
- `resend` package installed
- Environment variables: `RESEND_API_KEY`, `SITE_OWNER_EMAIL`

### 2. Contact Form Enhancement

**Features:**
- Real email delivery to site owners
- Name, email, phone (optional), and message fields
- Form validation with Zod
- Server actions with loading states
- Success/error feedback
- Auto-populated siteId from server

**Flow:**
1. User fills out contact form
2. Validation runs (Zod schema)
3. Email sent via Resend to site owner
4. Success message displayed
5. Form remains visible for multiple submissions

### 3. Newsletter System

**Features:**
- Real email delivery for welcome messages
- Single email input field
- Server action submission
- Loading states
- Success/error feedback
- Auto-populated siteName from server

**Flow:**
1. User enters email
2. Validation runs
3. Welcome email sent via Resend
4. Success message displayed
5. Form replaced with success alert

### 4. SEO Database Schema

**Added to Page Model:**
- `seoTitle` (String?, max 60 chars) - Meta title for search results
- `seoDescription` (String?, max 160 chars) - Meta description
- `seoKeywords` (String?) - Comma-separated keywords
- `seoImage` (String?) - Open Graph image URL (1200x630px recommended)

**Migration:**
- Ran `npx prisma db push` successfully
- Fields are nullable for backward compatibility

### 5. Page Settings Panel

**Features:**
- General settings: page name, URL slug
- SEO settings: title, description, keywords, OG image
- Character counters (60/160 limits)
- Real-time slug validation (lowercase, alphanumeric + hyphens)
- Save button with loading state
- Toast notifications
- Responsive card-based layout

**Location:** `components/editor/panels/page-settings.tsx`

### 6. Dynamic Metadata Generation

**Implemented for:**
- Home pages (`app/_sites/[site]/page.tsx`)
- Slug pages (`app/_sites/[site]/[slug]/page.tsx`)

**Metadata Includes:**
- Title (SEO title or fallback)
- Description (SEO description or fallback)
- Keywords
- Open Graph tags (social sharing)
- Twitter Card tags
- Canonical URLs
- Robots meta (index, follow)

**Fallback Strategy:**
- SEO title → Page name + Site name
- SEO description → Generic welcome message
- SEO image → Site logo → Empty array

### 7. Page Update API

**Endpoint:** `PATCH /api/pages/[pageId]`

**Updates:**
- Page name
- URL slug
- SEO title
- SEO description
- SEO keywords
- SEO image

**Validation:**
- Checks page exists (404 if not)
- Accepts partial updates
- Returns updated page object

## File Structure

```
lib/
  resend.ts                              # Resend client initialization
app/
  actions/
    send-email.ts                         # Email server actions (new)
    contact.ts                            # Contact form validation (updated)
    newsletter.ts                         # Newsletter validation (updated)
  api/
    pages/
      [pageId]/
        route.ts                          # Page update API (new)
  _sites/
    [site]/
      page.tsx                            # Home page with metadata (updated)
      [slug]/
        page.tsx                          # Slug page with metadata (updated)
components/
  sections/
    contact-form.tsx                      # Contact form (updated)
    newsletter-section.tsx                # Newsletter (updated)
  editor/
    panels/
      page-settings.tsx                   # SEO settings panel (new)
prisma/
  schema.prisma                           # Added SEO fields (updated)
```

## Environment Variables

Add to `.env`:

```bash
# Resend API Key (get from resend.com)
RESEND_API_KEY=re_your_api_key_here

# Fallback email (optional, uses tenant email by default)
SITE_OWNER_EMAIL=your@email.com

# App domain for metadata URLs
NEXT_PUBLIC_APP_DOMAIN=yourdomain.com
```

## Usage Guide

### For Site Owners (Creating Sites)

**Setting Up Contact Forms:**
1. Add contact form block to any page
2. Contact form will automatically use site's tenant email
3. All submissions sent to tenant email via Resend
4. Reply-to set to submitter's email

**Setting Up Newsletter:**
1. Add newsletter section block to any page
2. Newsletter subscriptions send welcome email via Resend
3. Subscriber email saved (when database model added)

**Configuring SEO:**
1. Open editor for any page
2. Click page settings (if panel exists in UI)
3. Fill in SEO fields:
   - Title (60 chars max)
   - Description (160 chars max)
   - Keywords (comma-separated)
   - Social image URL (1200x630px)
4. Save settings
5. Metadata automatically applied to live site

### For Developers

**Email Templates:**
- Edit HTML in `app/actions/send-email.ts`
- Customize sender name/email (currently uses Resend test domain)
- Add more email types as needed

**Metadata Customization:**
- Edit `generateMetadata` in site pages
- Adjust fallback strategies
- Add more Open Graph tags
- Configure robots meta tags

**Page Settings Panel Integration:**
- Import `PageSettings` component
- Pass `pageId` and `initialData`
- Add to editor sidebar or modal

## API Reference

### Server Actions

**sendContactEmail(siteId, formData): Promise\<EmailResult\>**
- Sends contact form email to site owner
- Returns success/error result

**sendNewsletterEmail(email, siteName): Promise\<EmailResult\>**
- Sends welcome email to subscriber
- Returns success/error result

**submitContactForm(prevState, formData): Promise\<ContactFormState\>**
- Validates and processes contact form
- Calls sendContactEmail internally

**subscribeToNewsletter(prevState, formData): Promise\<NewsletterState\>**
- Validates and processes newsletter signup
- Calls sendNewsletterEmail internally

### API Endpoints

**PATCH /api/pages/[pageId]**

Request body:
```json
{
  "name": "Home",
  "slug": "home",
  "seoTitle": "My Site | Welcome",
  "seoDescription": "Welcome to my awesome site",
  "seoKeywords": "website, awesome, portfolio",
  "seoImage": "https://example.com/og-image.png"
}
```

Response:
```json
{
  "id": "uuid",
  "name": "Home",
  "slug": "home",
  "seoTitle": "My Site | Welcome",
  ...
}
```

## Component Props

### ContactForm

```tsx
<ContactForm
  data={{
    title: "Get in Touch",
    subtitle: "We'd love to hear from you",
    successMessage: "Thanks for reaching out!"
  }}
  siteId="site-uuid"  // Passed from server
/>
```

### NewsletterSection

```tsx
<NewsletterSection
  data={{
    title: "Subscribe to Our Newsletter",
    subtitle: "Get updates delivered to your inbox",
    buttonText: "Subscribe",
    disclaimer: "No spam, unsubscribe anytime"
  }}
  siteName="My Site"  // Passed from server
/>
```

### PageSettings

```tsx
<PageSettings
  pageId="page-uuid"
  initialData={{
    name: "Home",
    slug: "home",
    seoTitle: "...",
    seoDescription: "...",
    seoKeywords: "...",
    seoImage: "..."
  }}
/>
```

## SEO Best Practices

### Title Tags
- **Optimal length:** 50-60 characters
- **Format:** "Page Name | Site Name"
- **Include:** Primary keyword, brand name
- **Avoid:** Keyword stuffing, duplicate titles

### Meta Descriptions
- **Optimal length:** 150-160 characters
- **Include:** Call to action, key benefits
- **Make:** Compelling and unique per page
- **Avoid:** Duplicate descriptions

### Open Graph Images
- **Dimensions:** 1200x630px (1.91:1 ratio)
- **File size:** Under 8MB
- **Formats:** PNG, JPG (PNG recommended)
- **Content:** Text readable, high contrast

### Keywords
- **Format:** Comma-separated
- **Number:** 5-10 relevant keywords
- **Focus:** Long-tail keywords, user intent
- **Avoid:** Keyword stuffing, irrelevant terms

## Testing Checklist

### Email System
- [ ] Contact form sends emails to site owner
- [ ] Newsletter sends confirmation emails
- [ ] Email HTML renders correctly
- [ ] Reply-to addresses work
- [ ] Error handling shows user-friendly messages
- [ ] Loading states work correctly

### SEO System
- [ ] Page settings panel saves data
- [ ] Metadata appears in page source
- [ ] Open Graph tags validated (use debugger tools)
- [ ] Twitter Card preview works
- [ ] Character limits enforced
- [ ] Slug validation works

### Live Site
- [ ] Home page metadata correct
- [ ] Slug pages metadata correct
- [ ] Fallbacks work when SEO fields empty
- [ ] Contact form works on live site
- [ ] Newsletter works on live site

## Troubleshooting

### Emails Not Sending

**Check:**
1. RESEND_API_KEY is set in .env
2. Resend API key is valid
3. Server logs for error messages
4. Resend dashboard for delivery status
5. Tenant email is set for site owner

**Common Issues:**
- Test domain (onboarding@resend.dev) has limits
- Need verified domain for production
- Rate limits on free tier

### Metadata Not Appearing

**Check:**
1. SEO fields saved in database
2. generateMetadata function running
3. Page source has meta tags
4. Rebuild site after schema changes
5. Clear cache and hard refresh

**Common Issues:**
- Next.js cached old metadata
- Database fields null (fallbacks used)
- Environment variables not set

### Form Props Not Working

**Check:**
1. siteId/siteName passed from server
2. Props match component interface
3. Hidden fields have values
4. Block data structure correct

**Common Issues:**
- Props not passed through block registry
- Client component can't access server data
- Typo in prop names

## Production Setup

### Resend Configuration

1. **Get API Key:**
   - Sign up at resend.com
   - Create API key in dashboard
   - Add to production .env

2. **Verify Domain:**
   - Add DNS records for your domain
   - Verify ownership
   - Update `from` addresses in code

3. **Update Email Templates:**
   - Replace "onboarding@resend.dev" with your verified domain
   - Customize branding and styling
   - Add unsubscribe links (newsletter)

### Environment Variables

Set in production:
```bash
RESEND_API_KEY=re_live_key_here
NEXT_PUBLIC_APP_DOMAIN=yourdomain.com
```

### Database Migration

For production, use proper migrations:
```bash
npx prisma migrate deploy
```

## Future Enhancements

### Email System
- [ ] Email templates with React Email
- [ ] Newsletter subscriber database
- [ ] Unsubscribe functionality
- [ ] Email rate limiting
- [ ] Spam protection (reCAPTCHA)
- [ ] Email analytics
- [ ] Auto-responder emails

### SEO System
- [ ] Bulk SEO updates
- [ ] SEO audit tool
- [ ] Sitemap generation
- [ ] Robots.txt management
- [ ] Schema.org markup
- [ ] Page speed insights
- [ ] SEO score calculator

### Page Settings
- [ ] Image upload for OG images
- [ ] Preview social cards
- [ ] SEO recommendations
- [ ] Keyword research tools
- [ ] Competitor analysis

## Resources

- [Resend Documentation](https://resend.com/docs)
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
