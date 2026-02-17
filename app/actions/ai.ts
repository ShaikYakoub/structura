"use server";

import { geminiFlash } from "@/lib/ai/google";
import { siteGenerationSchema } from "@/lib/ai/schema";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Toggle for mock mode when API quota is exceeded
const USE_MOCK_AI = process.env.USE_MOCK_AI === "true";

// Log mock mode status on module load
console.log("🔧 AI Module Configuration:");
console.log("  USE_MOCK_AI env var:", process.env.USE_MOCK_AI);
console.log("  Mock mode active:", USE_MOCK_AI);

// STRICT SYSTEM PROMPT - JSON ONLY
const SYSTEM_PROMPT = `You are a JSON API. Return ONLY valid JSON. No markdown, no explanations, no code blocks.

⚠️ CRITICAL: All text must be on a SINGLE LINE. Use \\n for line breaks (NOT actual newlines).

Structure REQUIRED:
{
  "name": "Business Name",
  "subdomain": "url-friendly-name",
  "description": "SEO description 100-160 chars",
  "industry": "industry type",
  "primaryColor": "#3b82f6",
  "components": [
    {
      "type": "hero",
      "props": {
        "title": "Main headline",
        "subtitle": "Supporting text",
        "ctaText": "Get Started",
        "ctaLink": "#contact",
        "image": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=600&fit=crop&q=80",
        "alignment": "center"
      }
    }
  ]
}

RULES:
- Always start with hero component
- Use 3-7 components total
- Valid types: hero, features, pricing, testimonials, faq, contact, text, gallery
- Use Unsplash URLs for images
- subdomain: lowercase, hyphens only, 3-30 chars
- NO NEWLINES in strings - use \\n instead
- NO TABS in strings - use \\t instead
- Return ONLY the JSON object, nothing else`;

// MOCK RESPONSE GENERATOR (for testing when API quota exceeded)
function generateMockResponse(userPrompt: string): string {
  console.log("🎭 MOCK MODE: Generating mock response for:", userPrompt);

  const businessName =
    userPrompt.split(" ").slice(0, 3).join(" ") || "Sample Business";
  const subdomain = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .substring(0, 30);

  const mockData = {
    name: businessName,
    subdomain: subdomain,
    description: `Professional ${businessName} services and solutions. Get started today with our expert team.`,
    industry: "technology",
    primaryColor: "#3b82f6",
    components: [
      {
        type: "hero",
        props: {
          title: `Welcome to ${businessName}`,
          subtitle: "Transform your business with our innovative solutions",
          ctaText: "Get Started",
          ctaLink: "#contact",
          image:
            "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=600&fit=crop&q=80",
          alignment: "center",
        },
      },
      {
        type: "features",
        props: {
          title: "Our Features",
          subtitle: "Everything you need to succeed",
          features: [
            {
              icon: "zap",
              title: "Fast Performance",
              description:
                "Lightning-fast load times and optimal user experience",
            },
            {
              icon: "shield",
              title: "Secure & Reliable",
              description:
                "Enterprise-grade security and 99.9% uptime guarantee",
            },
            {
              icon: "users",
              title: "Beautiful Design",
              description:
                "Modern, responsive designs that look great on all devices",
            },
          ],
        },
      },
      {
        type: "pricing",
        props: {
          title: "Simple Pricing",
          subtitle: "Choose the plan that fits your needs",
          plans: [
            {
              name: "Starter",
              price: "$29",
              description: "Perfect for small businesses getting started",
              features: ["Feature 1", "Feature 2", "Feature 3"],
              ctaText: "Get Started",
              featured: false,
            },
            {
              name: "Professional",
              price: "$79",
              description: "Everything you need to scale your business",
              features: [
                "Everything in Starter",
                "Feature 4",
                "Feature 5",
                "Priority Support",
              ],
              ctaText: "Go Pro",
              featured: true,
            },
            {
              name: "Enterprise",
              price: "$199",
              description: "Advanced features for large organizations",
              features: [
                "Everything in Professional",
                "Feature 6",
                "Feature 7",
                "Dedicated Manager",
              ],
              ctaText: "Contact Sales",
              featured: false,
            },
          ],
        },
      },
      {
        type: "testimonials",
        props: {
          title: "What Our Clients Say",
          testimonials: [
            {
              quote:
                "This service transformed our business. Highly recommended!",
              author: "John Smith",
              role: "CEO, Tech Corp",
              avatar:
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
            },
            {
              quote: "Outstanding quality and support. Worth every penny.",
              author: "Sarah Johnson",
              role: "Marketing Director, StartupCo",
              avatar:
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
            },
            {
              quote:
                "The best investment we've made this year. Exceptional results.",
              author: "Mike Chen",
              role: "Founder, InnovateLabs",
              avatar:
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
            },
          ],
        },
      },
      {
        type: "faq",
        props: {
          title: "Frequently Asked Questions",
          faqs: [
            {
              question: "How do I get started?",
              answer:
                "Simply sign up for an account and follow our quick setup guide.",
            },
            {
              question: "What payment methods do you accept?",
              answer:
                "We accept all major credit cards, PayPal, and bank transfers.",
            },
            {
              question: "Can I cancel anytime?",
              answer:
                "Yes, you can cancel your subscription at any time with no penalties.",
            },
            {
              question: "Do you offer refunds?",
              answer:
                "We offer a 30-day money-back guarantee on all paid plans.",
            },
          ],
        },
      },
      {
        type: "contact",
        props: {
          title: "Get In Touch",
          subtitle: "We'd love to hear from you",
          email: "contact@example.com",
          phone: "+1 (555) 123-4567",
          address: "123 Business St, Suite 100, City, State 12345",
        },
      },
    ],
  };

  return JSON.stringify(mockData);
}

// FORENSIC LOGGING: Step 1 - Aggressive JSON Cleaning
function cleanJsonResponse(rawText: string): string {
  console.log("=== STEP 1: JSON CLEANING STARTED ===");
  console.log("1. Raw AI Response Length:", rawText.length);
  console.log(
    "1. Raw AI Response (First 500 chars):",
    rawText.substring(0, 500),
  );

  if (!rawText || typeof rawText !== "string") {
    console.error("❌ 1. FATAL: Raw text is invalid type:", typeof rawText);
    throw new Error("Step 1 Failed: Received non-string response from AI");
  }

  // Remove ALL markdown formatting
  let cleaned = rawText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .replace(/`/g, "")
    .trim();

  console.log("1. After markdown removal:", cleaned.substring(0, 300));

  // Find JSON object boundaries
  const startBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (startBrace === -1 || lastBrace === -1) {
    console.error("❌ 1. FATAL: No JSON braces found in response");
    console.error("Full cleaned text:", cleaned);
    throw new Error(
      "Step 1 Failed: No valid JSON structure found in AI response",
    );
  }

  cleaned = cleaned.substring(startBrace, lastBrace + 1);
  console.log("1. After brace extraction:", cleaned.substring(0, 300));

  // Remove any remaining non-JSON text
  cleaned = cleaned
    .replace(/^[^{]*/, "")
    .replace(/[^}]*$/, "")
    .trim();

  // Fix common JSON issues with character-by-character parsing
  console.log("1. Fixing control characters and escaping strings...");

  let fixed = "";
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    const charCode = char.charCodeAt(0);

    if (escapeNext) {
      // Previous char was backslash, keep this char as-is
      fixed += char;
      escapeNext = false;
      continue;
    }

    if (char === "\\") {
      fixed += char;
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      // Toggle string mode
      inString = !inString;
      fixed += char;
      continue;
    }

    if (inString) {
      // Inside a string - escape control characters
      if (char === "\n") {
        fixed += "\\n";
      } else if (char === "\r") {
        fixed += "\\r";
      } else if (char === "\t") {
        fixed += "\\t";
      } else if (char === "\f") {
        fixed += "\\f";
      } else if (char === "\b") {
        fixed += "\\b";
      } else if (charCode < 32 || (charCode > 126 && charCode < 160)) {
        // Skip other control characters
        continue;
      } else {
        fixed += char;
      }
    } else {
      // Outside string - keep as-is
      fixed += char;
    }
  }

  cleaned = fixed;

  // Remove trailing commas in arrays and objects
  cleaned = cleaned.replace(/,(\s*[}\]])/g, "$1");

  // Remove comments (shouldn't be there but sometimes AI adds them)
  cleaned = cleaned.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");

  console.log("2. Cleaned JSON (First 500 chars):", cleaned.substring(0, 500));
  console.log(
    "2. Cleaned JSON (Last 300 chars):",
    cleaned.substring(Math.max(0, cleaned.length - 300)),
  );
  console.log("2. Cleaned JSON Length:", cleaned.length);
  console.log("=== STEP 1: JSON CLEANING COMPLETE ===\n");

  return cleaned;
}

// FORENSIC LOGGING: Step 2 - Parse and Validate JSON
function parseAndValidateJson(
  cleanedJson: string,
): z.infer<typeof siteGenerationSchema> {
  console.log("=== STEP 2: JSON PARSING & VALIDATION STARTED ===");

  let parsed: any;
  try {
    parsed = JSON.parse(cleanedJson);
    console.log("✅ 2. JSON.parse() successful");
    console.log("2. Parsed object keys:", Object.keys(parsed));
  } catch (parseError: any) {
    console.error("❌ 2. FATAL: JSON.parse() failed");
    console.error("Parse error:", parseError.message);

    // Extract position from error message
    const posMatch = parseError.message.match(/position (\d+)/);
    if (posMatch) {
      const pos = parseInt(posMatch[1]);
      const start = Math.max(0, pos - 100);
      const end = Math.min(cleanedJson.length, pos + 100);
      console.error("\n=== JSON CONTEXT AROUND ERROR ===");
      console.error("Position:", pos);
      console.error("Context (100 chars before and after):");
      console.error(cleanedJson.substring(start, end));
      console.error(
        "                                    ↑ ERROR HERE (approximately)",
      );
      console.error("=====================================\n");
    }

    console.error("Full JSON that failed to parse:");
    console.error(cleanedJson);

    // Try to salvage with more aggressive cleaning
    console.log("\n🔧 Attempting emergency JSON repair...");
    try {
      let repaired = "";
      let inString = false;
      let escapeNext = false;

      for (let i = 0; i < cleanedJson.length; i++) {
        const char = cleanedJson[i];
        const charCode = char.charCodeAt(0);

        if (escapeNext) {
          repaired += char;
          escapeNext = false;
          continue;
        }

        if (char === "\\") {
          repaired += char;
          escapeNext = true;
          continue;
        }

        if (char === '"') {
          inString = !inString;
          repaired += char;
          continue;
        }

        if (inString) {
          // Inside string - escape or remove problematic characters
          if (char === "\n") {
            repaired += "\\n";
          } else if (char === "\r") {
            repaired += "\\r";
          } else if (char === "\t") {
            repaired += "\\t";
          } else if (charCode < 32 || (charCode > 126 && charCode < 160)) {
            // Skip control characters
            continue;
          } else {
            repaired += char;
          }
        } else {
          repaired += char;
        }
      }

      // Check error position details
      if (posMatch) {
        const pos = parseInt(posMatch[1]);
        const char = repaired[pos];
        const prevChar = repaired[pos - 1];
        console.log(
          `Character at error position: '${char}' (code: ${char?.charCodeAt(0)})`,
        );
        console.log(
          `Previous character: '${prevChar}' (code: ${prevChar?.charCodeAt(0)})`,
        );
      }

      parsed = JSON.parse(repaired);
      console.log("✅ 2. Emergency repair successful!");
    } catch (repairError) {
      console.error("❌ 2. Emergency repair also failed");
      throw new Error(
        `Step 2 Failed: JSON parsing error - ${parseError.message}. The AI returned malformed JSON. Try regenerating the site.`,
      );
    }
  }

  // Check if components exist
  if (!parsed.components) {
    console.error("❌ 2. FATAL: Missing 'components' field");
    console.error("Received structure:", Object.keys(parsed));
    console.error("Full parsed object:", JSON.stringify(parsed, null, 2));
    throw new Error("Step 2 Failed: Missing required 'components' array");
  }

  if (!Array.isArray(parsed.components)) {
    console.error("❌ 2. FATAL: 'components' is not an array");
    console.error("components type:", typeof parsed.components);
    console.error("components value:", parsed.components);
    throw new Error("Step 2 Failed: 'components' must be an array");
  }

  console.log(
    "✅ 2. Components array found:",
    parsed.components.length,
    "items",
  );
  console.log(
    "2. Component types:",
    parsed.components.map((c: any) => c.type),
  );

  // Validate with Zod schema
  console.log("2. Starting Zod validation...");
  try {
    const validated = siteGenerationSchema.parse(parsed);
    console.log("✅ 3. Zod Validation PASSED");
    console.log("3. Validated site name:", validated.name);
    console.log("3. Validated subdomain:", validated.subdomain);
    console.log("3. Validated components:", validated.components.length);
    console.log("=== STEP 2: VALIDATION COMPLETE ===\n");
    return validated;
  } catch (zodError: any) {
    console.error("❌ 3. FATAL: Zod Validation FAILED");
    console.error("Zod errors:", JSON.stringify(zodError.errors, null, 2));
    console.error("Failed object:", JSON.stringify(parsed, null, 2));
    throw new Error(
      `Step 3 Failed: Schema validation error - ${zodError.message}`,
    );
  }
}

// FORENSIC LOGGING: Step 3 - Transform components for database
function transformComponentsForDB(components: any[]): any[] {
  console.log("=== STEP 3: COMPONENT TRANSFORMATION STARTED ===");
  console.log("3. Transforming", components.length, "components");

  const transformed = components.map((component, index) => {
    const { type, props } = component;

    // Map component props to match component expectations
    let content: any = {};

    switch (type) {
      case "hero":
        content = {
          title: props.title,
          subtitle: props.subtitle,
          actions: [
            {
              label: props.ctaText || "Get Started",
              href: props.ctaLink || "#contact",
              variant: "default" as const,
            },
          ],
          imageUrl: props.image,
          imagePosition: props.alignment === "center" ? "right" : "left",
          backgroundStyle: "solid" as const,
        };
        break;

      case "features":
        content = {
          title: props.title,
          features: props.features, // Keep as features for component
        };
        break;

      case "contact":
        content = {
          title: props.title,
          subtitle: props.subtitle,
          email: props.email,
          phone: props.phone,
          address: props.address,
          successMessage: "Thank you for your message! We'll be in touch soon.",
        };
        break;

      case "pricing":
        content = {
          title: props.title,
          subtitle: props.subtitle,
          plans: props.plans.map((plan: any) => ({
            name: plan.name,
            priceMonthly: parseInt(plan.price.replace("$", "")) || 0,
            priceYearly: (parseInt(plan.price.replace("$", "")) || 0) * 10, // Rough yearly estimate
            features: plan.features,
            buttonText: plan.ctaText,
            isPopular: plan.featured,
          })),
        };
        break;

      case "testimonials":
        content = {
          title: props.title,
          reviews: props.testimonials.map((t: any) => ({
            name: t.author,
            role: t.role,
            avatarUrl: t.avatar,
            content: t.quote,
            rating: 5, // Default rating
          })),
        };
        break;

      case "faq":
        content = {
          title: props.title,
          items: props.faqs, // Map faqs -> items for component
        };
        break;

      case "contact":
        content = {
          title: props.title,
          subtitle: props.subtitle,
          successMessage: "Thank you for your message! We'll be in touch soon.",
        };
        break;

      default:
        content = props;
    }

    // Map component types to database types
    const typeMapping: Record<string, string> = {
      contact: "contact-form",
      text: "content-block",
      gallery: "image-gallery",
    };

    const dbType = typeMapping[type] || type;

    console.log(`3. Component ${index + 1}: ${type} → ${dbType}`);

    return {
      id: `${dbType}-${Date.now()}-${index}`,
      type: dbType,
      content,
    };
  });

  console.log(
    "✅ 3. Transformation complete:",
    transformed.length,
    "components",
  );
  console.log("=== STEP 3: TRANSFORMATION COMPLETE ===\n");

  return transformed;
}

export async function generateSiteFromPrompt(userPrompt: string) {
  console.log("\n========================================");
  console.log("🚀 AI SITE GENERATION STARTED");
  console.log("User Prompt:", userPrompt);
  console.log("========================================\n");

  // Authentication
  const session = await auth();
  if (!session?.user?.email) {
    console.error("❌ AUTH FAILED: No session");
    return { success: false, error: "Unauthorized - Please sign in" };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenant: true },
  });

  if (!user) {
    console.error("❌ AUTH FAILED: User not found");
    return { success: false, error: "User not found in database" };
  }

  console.log("✅ AUTH: User authenticated:", user.email);

  // STEP 1: Generate raw text from AI (or use mock)
  let rawText: string;

  if (USE_MOCK_AI) {
    console.log("\n🎭 MOCK MODE ENABLED (USE_MOCK_AI=true)");
    console.log("=== GENERATING MOCK RESPONSE ===");
    rawText = generateMockResponse(userPrompt);
    console.log("✅ MOCK: Response generated, length:", rawText.length);

    // Skip the aggressive JSON cleaning for mock responses since they're already valid
    console.log("=== MOCK: Skipping JSON cleaning (already valid) ===");
    let validatedSite: z.infer<typeof siteGenerationSchema>;
    try {
      const parsed = JSON.parse(rawText);
      validatedSite = siteGenerationSchema.parse(parsed);
      console.log("✅ MOCK: Validation passed");
    } catch (mockError: any) {
      console.error("❌ MOCK: Validation failed:", mockError.message);
      return {
        success: false,
        error: `Mock validation error: ${mockError.message}`,
      };
    }

    // Skip to Step 4 (component transformation)
    const blocks = transformComponentsForDB(validatedSite.components);

    // Continue with database save...
    const defaultSubdomain = validatedSite.subdomain;
    let finalSubdomain = defaultSubdomain;
    let attemptCount = 0;

    while (attemptCount < 10) {
      const existingSubdomain = await prisma.site.findUnique({
        where: { subdomain: finalSubdomain },
      });

      if (!existingSubdomain) break;
      attemptCount++;
      finalSubdomain = `${defaultSubdomain}-${attemptCount}`;
    }

    console.log("\n=== STEP 5: SAVING TO DATABASE ===");
    console.log("5. Final subdomain:", finalSubdomain);
    console.log("5. Component blocks to save:", blocks.length);

    if (!user.tenantId) {
      console.log("❌ User has no tenantId");
      return {
        success: false,
        message: "User account is not properly configured",
      };
    }

    try {
      const site = await prisma.site.create({
        data: {
          name: validatedSite.name,
          subdomain: finalSubdomain,
          description: validatedSite.description || null,
          tenantId: user.tenantId,
          pages: {
            create: {
              name: "Home",
              slug: "index",
              path: "/",
              draftContent: blocks,
              publishedContent: blocks,
              isPublished: true,
            },
          },
        },
        include: {
          pages: true,
        },
      });

      console.log("✅ 5. SITE CREATED IN DATABASE");
      console.log("5. Site ID:", site.id);
      console.log("5. Site subdomain:", site.subdomain);
      console.log("5. Home page ID:", site.pages[0]?.id);
      console.log(
        "5. draftContent saved:",
        JSON.stringify(site.pages[0]?.draftContent).substring(0, 200),
        "...",
      );
      console.log("========================================");
      console.log("✅ SUCCESS: AI SITE GENERATION COMPLETE");
      console.log("========================================\n");

      revalidatePath("/dashboard/sites");
      revalidatePath(`/site/${site.subdomain}`);

      return {
        success: true,
        siteId: site.id,
        subdomain: site.subdomain,
      };
    } catch (dbError: any) {
      console.error("❌ 5. DATABASE ERROR:", dbError.message);
      return {
        success: false,
        error: `Step 5 Failed: Database error - ${dbError.message}`,
      };
    }
  } else {
    console.log("\n=== CALLING AI MODEL ===");

    try {
      const result = await geminiFlash.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Create a landing page for: ${userPrompt}

Return ONLY a JSON object with this exact structure:
{
  "name": "Business Name",
  "subdomain": "url-friendly-name",
  "description": "SEO description",
  "industry": "industry type",
  "primaryColor": "#hexcolor",
  "components": [
    { "type": "hero", "props": {...} },
    { "type": "features", "props": {...} }
  ]
}

NO markdown, NO explanations, ONLY the JSON.`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
        },
        systemInstruction: SYSTEM_PROMPT,
      });

      rawText = result.response.text();
      console.log("✅ AI MODEL: Response received");
    } catch (aiError: any) {
      console.error("❌ AI MODEL FAILED:", aiError.message);
      return {
        success: false,
        error: `Step 0 Failed: AI API error - ${aiError.message}. Try setting USE_MOCK_AI=true in .env.local to test without API.`,
      };
    }
  }

  // STEP 2: Clean JSON
  let cleanedJson: string;
  try {
    cleanedJson = cleanJsonResponse(rawText);
  } catch (cleanError: any) {
    console.error("❌ CLEANING FAILED:", cleanError.message);
    return {
      success: false,
      error: cleanError.message,
    };
  }

  // STEP 3: Parse and Validate
  let validatedSite: z.infer<typeof siteGenerationSchema>;
  try {
    validatedSite = parseAndValidateJson(cleanedJson);
  } catch (validateError: any) {
    console.error("❌ VALIDATION FAILED:", validateError.message);
    return {
      success: false,
      error: validateError.message,
    };
  }

  // STEP 4: Transform components for database
  let blocks: any[];
  try {
    blocks = transformComponentsForDB(validatedSite.components);
  } catch (transformError: any) {
    console.error("❌ TRANSFORMATION FAILED:", transformError.message);
    return {
      success: false,
      error: `Step 4 Failed: Component transformation error - ${transformError.message}`,
    };
  }

  // STEP 5: Save to database
  console.log("=== STEP 4: DATABASE TRANSACTION STARTED ===");
  console.log("4. Saving to database...");
  console.log("4. Site name:", validatedSite.name);
  console.log("4. Subdomain:", validatedSite.subdomain);
  console.log("4. Components to save:", blocks.length);
  console.log(
    "4. Component IDs:",
    blocks.map((b) => b.id),
  );

  try {
    // Ensure tenant exists
    let tenantId = user.tenantId;
    if (!tenantId) {
      console.log("4. Creating tenant for user...");
      const tenant = await prisma.tenant.create({
        data: {
          name: user.name || "My Workspace",
          email: user.email,
          slug: `user-${user.id.substring(0, 8)}`,
        },
      });
      await prisma.user.update({
        where: { id: user.id },
        data: { tenantId: tenant.id },
      });
      tenantId = tenant.id;
      console.log("✅ 4. Tenant created:", tenantId);
    }

    // Check subdomain availability
    let finalSubdomain = validatedSite.subdomain;
    const existing = await prisma.site.findUnique({
      where: { subdomain: finalSubdomain },
    });

    if (existing) {
      const suffix = Math.floor(1000 + Math.random() * 9000);
      finalSubdomain = `${validatedSite.subdomain}-${suffix}`;
      console.log("4. Subdomain collision, using:", finalSubdomain);
    }

    // CRITICAL: Create site with nested page creation
    console.log("4. Creating site in database...");
    console.log("4. draftContent to save:", JSON.stringify(blocks, null, 2));

    const site = await prisma.site.create({
      data: {
        name: validatedSite.name,
        subdomain: finalSubdomain,
        description: validatedSite.description,
        tenantId: tenantId,
        isTemplate: false,
        isPublished: true,
        styles: {
          primary: validatedSite.primaryColor || "#3b82f6",
          background: "#ffffff",
          foreground: "#000000",
          muted: "#f1f5f9",
          mutedForeground: "#64748b",
          fontHeading: "Inter",
          fontBody: "Inter",
          radius: "0.5",
        },
        navigation: [
          { label: "Home", href: "/" },
          { label: "About", href: "#about" },
          { label: "Contact", href: "#contact" },
        ],
        pages: {
          create: {
            name: "Home",
            slug: "/",
            path: "/",
            draftContent: blocks,
            publishedContent: blocks,
            isPublished: true,
            isHomePage: true,
          },
        },
      },
      include: {
        pages: true,
      },
    });

    console.log("✅ 4. Site created successfully!");
    console.log("4. Site ID:", site.id);
    console.log("4. Pages created:", site.pages.length);
    console.log(
      "4. Homepage draftContent length:",
      site.pages[0]?.draftContent
        ? (site.pages[0].draftContent as any).length
        : 0,
    );
    console.log("=== STEP 4: DATABASE TRANSACTION COMPLETE ===\n");

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        adminEmail: user.email,
        action: "AI_SITE_GENERATED",
        targetId: site.id,
        targetType: "Site",
        metadata: {
          prompt: userPrompt,
          industry: validatedSite.industry,
          componentCount: blocks.length,
        },
      },
    });

    revalidatePath("/app");

    console.log("\n========================================");
    console.log("✅ SUCCESS: Site generation complete!");
    console.log("Site ID:", site.id);
    console.log("Subdomain:", finalSubdomain);
    console.log("========================================\n");

    return {
      success: true,
      siteId: site.id,
      subdomain: finalSubdomain,
    };
  } catch (dbError: any) {
    console.error("❌ 4. DATABASE FAILED:", dbError);
    console.error("Error message:", dbError.message);
    console.error("Error stack:", dbError.stack);
    return {
      success: false,
      error: `Step 4 Failed: Database error - ${dbError.message}`,
    };
  }
}
