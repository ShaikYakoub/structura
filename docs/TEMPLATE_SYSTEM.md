# Template System Documentation

## Overview

The Template System enables users to create new sites from pre-built templates through a guided onboarding flow. It supports atomic site cloning with all pages and content, ensuring data consistency.

## Architecture

### Database Schema

Added to `Site` model:
- `isTemplate: Boolean` - Marks site as a template
- `templateCategory: String?` - Category (business, portfolio, ecommerce, blog)
- `templateDescription: String?` - Template description for gallery
- `thumbnailUrl: String?` - Preview image URL (recommended: 1200x630px)
- Indexes on `isTemplate` and `templateCategory` for fast queries

### Components

#### Server Actions (`app/actions/templates.ts`)

**Core Functions:**
- `getTemplates(category?)` - Fetch templates with optional filtering
- `getTemplateCategories()` - Get distinct template categories
- `createSiteFromTemplate(templateId, tenantId, newName, newSubdomain)` - Clone template atomically
- `checkSubdomainAvailability(subdomain)` - Validate subdomain uniqueness
- `getTemplatePreviewUrl(subdomain)` - Build preview URL

**Cloning Strategy:**
- Uses Prisma `$transaction` for atomic all-or-nothing operation
- Deep copies site metadata (logo, navColor, navigation, styles)
- Clones all pages with `publishedContent` → `draftContent` mapping
- Creates default home page if template has no pages
- New sites start as drafts (`isTemplate: false`, `isPublished: false`)

#### UI Components

**Template Gallery (`components/dashboard/template-picker.tsx`)**
- Category-based tab filtering (all + dynamic categories)
- Responsive grid layout (1/2/3 columns)
- Template cards with thumbnails, descriptions, preview links
- Loading states with skeleton placeholders
- Empty state handling

**Onboarding Wizard (`app/onboarding/page.tsx`)**

4-step flow with progress tracking:

1. **Category Selection** (25%)
   - 4 cards: business, portfolio, ecommerce, blog
   - Icon-based visual selection

2. **Template Gallery** (50%)
   - Shows filtered templates by selected category
   - Back button to change category
   - Preview and "Use Template" actions

3. **Customization** (75%)
   - Site name input (defaults to "My {template.name}")
   - Subdomain input with validation (lowercase, alphanumeric + hyphens)
   - Real-time availability checking
   - Displays selected template info

4. **Success** (100%)
   - Confirmation screen with site details
   - Links to dashboard and editor

**Admin Management (`app/admin/templates/page.tsx`)**
- Mark existing sites as templates
- Set category, description, thumbnail URL
- Toggle template status
- 5-step instructions for creating templates

#### API Endpoint

**PATCH `/api/sites/[siteId]/template`**
- Updates template metadata for a site
- Body: `{ isTemplate, templateCategory, templateDescription, thumbnailUrl }`
- Returns updated site object

## Usage

### Creating Templates

1. Build a site with your desired design
2. Publish the site to make content visible
3. Copy the site ID from the database
4. Go to `/admin/templates`
5. Enter site ID and set template metadata
6. Template appears in onboarding gallery

### User Onboarding Flow

1. User visits `/onboarding`
2. Selects a category (business/portfolio/ecommerce/blog)
3. Browses templates in that category
4. Clicks "Use Template"
5. Customizes site name and subdomain
6. System clones template atomically
7. User redirected to dashboard or editor

### Technical Implementation

**Atomic Cloning Process:**
```typescript
await prisma.$transaction(async (tx) => {
  // 1. Create new site with template data
  const site = await tx.site.create({
    data: {
      name: newName,
      subdomain: newSubdomain,
      logo: template.logo,
      navColor: template.navColor,
      navigation: template.navigation as any,
      styles: template.styles as any,
      tenantId,
      isTemplate: false,
      isPublished: false,
    },
  });

  // 2. Clone all pages
  if (template.pages.length > 0) {
    await Promise.all(template.pages.map(page =>
      tx.page.create({
        data: {
          siteId: site.id,
          slug: page.slug,
          name: page.name,
          path: page.path,
          draftContent: (page.publishedContent || page.draftContent) as any,
          publishedContent: page.publishedContent as any,
          isHomePage: page.isHomePage,
        },
      })
    ));
  } else {
    // 3. Create default home page if empty
    await tx.page.create({
      data: {
        siteId: site.id,
        slug: "home",
        name: "Home",
        path: "/",
        draftContent: [] as any,
        publishedContent: null as any,
        isHomePage: true,
      },
    });
  }

  return site;
});
```

## Data Flow

1. **Template Creation**
   - Admin marks site as template via admin UI
   - API endpoint updates site record
   - Template appears in gallery automatically

2. **Template Discovery**
   - User visits onboarding
   - `getTemplates()` fetches templates by category
   - Gallery displays with thumbnails and descriptions

3. **Template Cloning**
   - User selects template and customizes
   - `checkSubdomainAvailability()` validates subdomain
   - `createSiteFromTemplate()` performs atomic clone
   - User receives new site ID

4. **Post-Clone**
   - New site is a draft (unpublished)
   - User can edit before publishing
   - All content preserved from template

## Categories

Pre-defined categories:
- **business** - Corporate, agency, company websites
- **portfolio** - Personal, creative, showcase sites
- **ecommerce** - Online stores, product catalogs
- **blog** - Content-focused, article sites

## Security Considerations

- Subdomain validation prevents SQL injection
- Atomic transactions prevent partial cloning
- Template sites remain unchanged (read-only during clone)
- Tenant isolation ensures sites belong to correct user
- **TODO**: Replace hardcoded tenant ID with session.user.tenantId

## Known Limitations

1. **Tenant ID Placeholder**: Line 125 of `app/onboarding/page.tsx` uses `"tenant-id-placeholder"`. Must be replaced with actual session tenant ID before production.

2. **No Image Upload**: Template thumbnails require manual URL entry. Consider adding S3 integration.

3. **No Template Analytics**: No tracking of template usage or popularity.

4. **Fixed Categories**: Categories are hardcoded. Consider making them dynamic.

## Future Enhancements

- [ ] Image upload for template thumbnails
- [ ] Template preview modal in gallery
- [ ] Search/filter functionality in template gallery
- [ ] Template usage analytics dashboard
- [ ] User-contributed templates (marketplace)
- [ ] Template ratings and reviews
- [ ] Template version management
- [ ] Custom template categories
- [ ] Template import/export

## Dependencies

- `@radix-ui/react-progress` - Progress bar component
- Prisma transactions - Atomic cloning
- Next.js Image - Thumbnail loading

## Testing Checklist

- [ ] Create template from existing site
- [ ] Verify template appears in gallery
- [ ] Clone template via onboarding flow
- [ ] Verify all pages copied correctly
- [ ] Verify content preserved (publishedContent → draftContent)
- [ ] Test subdomain validation
- [ ] Test category filtering
- [ ] Test empty template (creates default home page)
- [ ] Test admin template management
- [ ] Test API endpoint error handling

## Troubleshooting

**Template not appearing in gallery:**
- Verify `isTemplate: true` in database
- Check templateCategory is set
- Ensure site is published (for preview links)

**Subdomain already exists error:**
- Subdomain validation is case-insensitive
- Check database for existing sites
- Suggest alternative subdomains to user

**Clone transaction failed:**
- Check database connection
- Verify tenant ID exists
- Check page content is valid JSON
- Review transaction logs for specific error

**TypeScript errors after schema update:**
- Run `npx prisma generate` to regenerate client
- Restart TypeScript server in VS Code
- Clear build cache: `rm -rf .next`
