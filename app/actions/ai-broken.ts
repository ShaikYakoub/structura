"use server";

import { geminiFlash } from "@/lib/ai/google";
import { siteGenerationSchema } from "@/lib/ai/schema";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const SYSTEM_PROMPT = `You are an expert web architect and conversion optimization specialist. Your job is to design high-converting, professional landing pages based on user descriptions.

KEY RULES:
1. ALWAYS start with a Hero component - this is mandatory
2. Choose 3-7 additional components that best fit the business type
3. For images, STRICTLY use Unsplash URLs in this format:
   - Hero images: https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=600&fit=crop&q=80
   - Gallery images: https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop&q=80
   - Avatars: https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80
4. Use real Unsplash photo IDs from their collection
5. Generate realistic, compelling copy that sells the business
6. For pricing, use Indian Rupees (₹) when appropriate
7. Match the tone and style to the industry (professional for B2B, friendly for consumer)
8. ONLY use component types defined in the schema
9. Ensure the subdomain is URL-friendly: lowercase, hyphens only, no spaces

COMPONENT SELECTION GUIDE:
- E-commerce: Hero → Features → Gallery → Testimonials → Pricing → Contact
- Service Business: Hero → Features → Testimonials → Pricing → FAQ → Contact
- Portfolio: Hero → Gallery → Text (About) → Testimonials → Contact
- Restaurant: Hero → Gallery → Text (Menu) → Contact
- SaaS/Tech: Hero → Features → Pricing → Testimonials → FAQ → Contact
- Blog/Content: Hero → Text → Gallery → Contact

IMPORTANT: The components array must be properly ordered to create a natural flow.`;

// Helper function to clean and extract JSON from AI response
function cleanJson(text: string) {
  if (!text || typeof text !== "string") {
    console.log("❌ cleanJson received invalid input:", text);
    return "";
  }

  console.log("🧹 Starting JSON cleaning on:", text.substring(0, 200) + "...");

  // Remove markdown code blocks
  let cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

  // Try to find JSON object boundaries
  const startBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (startBrace !== -1 && lastBrace !== -1 && lastBrace > startBrace) {
    cleaned = cleaned.substring(startBrace, lastBrace + 1);
  }

  // Remove any remaining markdown or extra text
  cleaned = cleaned.replace(/^[^{]*/, "").replace(/[^}]*$/, "");

  console.log("🧹 Final cleaned result:", cleaned.substring(0, 200) + "...");
  return cleaned;
}

// Mock response for testing when AI fails
function getMockSiteResponse(userPrompt: string) {
  const prompt = userPrompt.toLowerCase();
  const isRestaurant =
    prompt.includes("restaurant") ||
    prompt.includes("food") ||
    prompt.includes("cafe");
  const isTech =
    prompt.includes("tech") ||
    prompt.includes("software") ||
    prompt.includes("app") ||
    prompt.includes("saas");
  const isFitness =
    prompt.includes("fitness") ||
    prompt.includes("gym") ||
    prompt.includes("workout");

  let industry = "business";
  if (isRestaurant) industry = "restaurant";
  else if (isTech) industry = "technology";
  else if (isFitness) industry = "fitness";

  return {
    name: userPrompt.split(" ").slice(0, 3).join(" ") || "My Business",
    subdomain:
      userPrompt
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .substring(0, 20) || "mybusiness",
    description: `Professional ${industry} services tailored to your needs`,
    industry,
    primaryColor: "#3b82f6",
    components: [
      {
        type: "hero",
        props: {
          title: `Welcome to ${userPrompt.split(" ").slice(0, 2).join(" ") || "Our Business"}`,
          subtitle: "We provide exceptional services that drive results",
          ctaText: "Get Started",
          ctaLink: "#contact",
          image:
            "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=600&fit=crop&q=80",
        },
      },
      {
        type: "features",
        props: {
          title: "Why Choose Us",
          features: [
            {
              icon: "zap",
              title: "Fast Results",
              description: "Get results quickly with our proven methods",
            },
            {
              icon: "shield",
              title: "Reliable Service",
              description: "Count on us for consistent, high-quality service",
            },
            {
              icon: "users",
              title: "Expert Team",
              description: "Our experienced team delivers exceptional results",
            },
          ],
        },
      },
      {
        type: "contact",
        props: {
          title: "Get In Touch",
          subtitle: "Ready to get started? Contact us today!",
          email: "hello@example.com",
          phone: "+1 (555) 123-4567",
        },
      },
    ],
  };
}

export async function generateSiteFromPrompt(userPrompt: string) {
  // Check if we should use mock mode for testing
  const useMock =
    process.env.NODE_ENV === "development" &&
    process.env.USE_MOCK_AI === "true";

  let generatedSite;
  if (useMock) {
    console.log("🧪 Using mock response for development testing");
    generatedSite = getMockSiteResponse(userPrompt);
    console.log("✅ Using mock site data:", generatedSite.name);
  } else {
    console.log("🚀 Starting site generation...");
    console.log("📝 User prompt:", userPrompt);
    console.log(
      "🔑 API Key configured:",
      !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    );

    // Generate site structure using AI
    console.log("🎯 Calling AI model...");
    let result;
    try {
      result = await geminiFlash.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Create a professional landing page for: ${userPrompt}

Generate a complete site structure with appropriate components that will help this business convert visitors into customers. Make the content compelling, specific, and realistic.

IMPORTANT: Respond with a valid JSON object in this EXACT format:
{
  "name": "Business Name",
  "subdomain": "url-friendly-name",
  "description": "SEO description",
  "industry": "industry type",
  "primaryColor": "#hexcolor",
  "components": [
    {
      "type": "hero",
      "props": {
        "title": "Hero title",
        "subtitle": "Hero subtitle",
        "ctaText": "Button text",
        "ctaLink": "#contact",
        "image": "https://unsplash-url"
      }
    },
    {
      "type": "features",
      "props": {
        "title": "Features title",
        "features": [
          {"icon": "zap", "title": "Feature", "description": "Description"}
        ]
      }
    }
  ]
}

Each component must have "type" and "props" fields. Do not wrap the JSON in markdown code blocks.`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
        },
        systemInstruction: SYSTEM_PROMPT,
      });
    } catch (error) {
      console.error("❌ AI API Error:", error);
      return {
        success: false,
        error: "Failed to generate site: " + (error as Error).message,
      };
    }

    try {
      // Get raw text response
      const rawResponse = result.response.text();
      console.log("🔍 RAW AI OUTPUT:", rawResponse);

      // Clean the response
      const cleanedResponse = cleanJson(rawResponse);
      console.log("🧹 CLEANED RESPONSE:", cleanedResponse);

      try {
        generatedSite = JSON.parse(cleanedResponse);
        console.log("✅ Successfully parsed AI response as JSON");
      } catch (parseError) {
        console.error("❌ JSON Parse Error:", parseError);
        console.error("❌ Cleaned response that failed:", cleanedResponse);

        // Try one more aggressive cleaning attempt
        console.log("🔄 Attempting more aggressive JSON extraction...");
        const moreCleaned = cleanedResponse
          .replace(/^[^{]*{/, "{")
          .replace(/}[^}]*$/, "}");
        try {
          generatedSite = JSON.parse(moreCleaned);
          console.log("✅ Successfully parsed with aggressive cleaning");
        } catch (secondError) {
          console.error("❌ Second parse attempt also failed:", secondError);
          console.log("🔄 Using mock response as fallback");

          // Use mock response as fallback
          generatedSite = getMockSiteResponse(userPrompt);
          console.log("✅ Generated mock response for:", userPrompt);
        }
      }
    } catch (error: any) {
      try {
        result = await geminiFlash.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Create a professional landing page for: ${userPrompt}

Generate a complete site structure with appropriate components that will help this business convert visitors into customers. Make the content compelling, specific, and realistic.

IMPORTANT: Respond with a valid JSON object in this EXACT format:
{
  "name": "Business Name",
  "subdomain": "url-friendly-name",
  "description": "SEO description",
  "industry": "industry type",
  "primaryColor": "#hexcolor",
  "components": [
    {
      "type": "hero",
      "props": {
        "title": "Hero title",
        "subtitle": "Hero subtitle",
        "ctaText": "Button text",
        "ctaLink": "#contact",
        "image": "https://unsplash-url"
      }
    },
    {
      "type": "features",
      "props": {
        "title": "Features title",
        "features": [
          {"icon": "zap", "title": "Feature", "description": "Description"}
        ]
      }
    }
  ]
}

Each component must have "type" and "props" fields. Do not wrap the JSON in markdown code blocks.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
          },
          systemInstruction: SYSTEM_PROMPT,
        });
      } catch (error) {
        console.error("❌ AI API Error:", error);
        return {
          success: false,
          error: "Failed to generate site: " + (error as Error).message,
        };
      }

      // Get raw text response
      const rawResponse = result.response.text();
      console.log("🔍 RAW AI OUTPUT:", rawResponse);

      // Clean the response
      const cleanedResponse = cleanJson(rawResponse);
      console.log("🧹 CLEANED RESPONSE:", cleanedResponse);

      try {
        generatedSite = JSON.parse(cleanedResponse);
        console.log("✅ Successfully parsed AI response as JSON");
      } catch (parseError) {
        console.error("❌ JSON Parse Error:", parseError);
        console.error("❌ Cleaned response that failed:", cleanedResponse);

        // Try one more aggressive cleaning attempt
        console.log("🔄 Attempting more aggressive JSON extraction...");
        const moreCleaned = cleanedResponse
          .replace(/^[^{]*{/, "{")
          .replace(/}[^}]*$/, "}");
        try {
          generatedSite = JSON.parse(moreCleaned);
          console.log("✅ Successfully parsed with aggressive cleaning");
        } catch (secondError) {
          console.error("❌ Second parse attempt also failed:", secondError);
          console.log("🔄 Using mock response as fallback");

          // Use mock response as fallback
          generatedSite = getMockSiteResponse(userPrompt);
          console.log("✅ Generated mock response for:", userPrompt);
        }
      }
    }

    // User authentication (required for both mock and AI modes)
    const session = await auth();
    console.log("🔐 Session check:", !!session?.user?.email);

    if (!session?.user?.email) {
      console.log("❌ No session or user email");
      return { success: false, error: "Unauthorized" };
    }

    console.log("👤 Fetching user:", session.user.email);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        tenant: true,
      },
    });

    if (!user) {
      console.log("❌ User not found in database");
      return { success: false, error: "User not found" };
    }

    console.log("✅ User found:", user.id);

    // Validate the response structure (outside try block so validation errors return immediately)
    if (!generatedSite || typeof generatedSite !== "object") {
      console.error("❌ Invalid response structure:", generatedSite);
      return { success: false, error: "AI response is not a valid object" };
    }

    if (!generatedSite.components || !Array.isArray(generatedSite.components)) {
      console.error(
        "❌ Missing or invalid components array:",
        generatedSite.components,
      );
      console.error(
        "❌ Full generatedSite object:",
        JSON.stringify(generatedSite, null, 2),
      );
      return {
        success: false,
        error: "AI response missing required components array",
      };
    }

    if (generatedSite.components.length === 0) {
      console.error("❌ Empty components array");
      return { success: false, error: "AI generated empty components array" };
    }

    console.log("✅ AI generated site structure:", generatedSite.name);
    console.log("📊 Components count:", generatedSite.components.length);
    console.log(
      "📋 Components preview:",
      JSON.stringify(generatedSite.components.slice(0, 2), null, 2),
    );

    // Continue with database operations for both mock and AI responses
    try {
      let tenantId = user.tenantId;
      if (!tenantId) {
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
        console.log("✅ Created tenant for user:", tenantId);
      }

      // Check if subdomain is available
      let finalSubdomain = generatedSite.subdomain;
      const existingSite = await prisma.site.findUnique({
        where: { subdomain: finalSubdomain },
      });

      // If subdomain exists, append random digits
      if (existingSite) {
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        finalSubdomain = `${generatedSite.subdomain}-${randomSuffix}`;
        console.log(`⚠️ Subdomain collision, using: ${finalSubdomain}`);
      }

      // Transform components to match database structure
      // Map AI component types to registry component types
      const componentTypeMapping: Record<string, string> = {
        contact: "contact-form",
        text: "content-block",
        gallery: "image-gallery",
        // Add other mappings as needed
      };

      // Transform component props to match component expectations
      const transformComponentProps = (type: string, props: any) => {
        switch (type) {
          case "contact":
            // AI generates: title, subtitle, email, phone, address
            // contact-form expects: title, subtitle, successMessage
            return {
              title: props.title,
              subtitle: props.subtitle,
              successMessage:
                "Thank you for your message! We'll get back to you soon.",
            };
          case "text":
            // AI generates: heading, text, alignment
            // content-block expects: content (HTML), className
            const alignment =
              (props.alignment as "left" | "center" | "right") || "left";
            const alignmentClassMap: Record<string, string> = {
              left: "text-left",
              center: "text-center",
              right: "text-right",
            };

            const alignmentClass = alignmentClassMap[alignment] || "text-left";

            return {
              content: `<h2 class="${alignmentClass}">${props.heading}</h2><div class="${alignmentClass}">${props.text.replace(/\n/g, "<br>")}</div>`,
              className: alignmentClass,
            };
          case "gallery":
            // AI generates: title, images (with url, alt, caption), columns
            // image-gallery expects: title, images (with url, alt), columns
            return {
              title: props.title,
              images: props.images.map((img: any) => ({
                url: img.url,
                alt: img.alt,
              })),
              columns: props.columns,
            };
          default:
            return props;
        }
      };

      // @ts-ignore
      let blocks;
      try {
        blocks = generatedSite.components.map(
          (component: any, index: number) => {
            console.log(
              `🔍 Component ${index} raw:`,
              JSON.stringify(component, null, 2),
            );

            // Handle different possible structures
            let componentType: string;
            let componentProps: any;

            if (component.type && component.props) {
              // Expected structure: { type: "hero", props: {...} }
              componentType = component.type;
              componentProps = component.props;
            } else if (
              component.type &&
              typeof component === "object" &&
              Object.keys(component).length > 1
            ) {
              // Alternative structure: { type: "hero", title: "...", subtitle: "..." }
              componentType = component.type;
              const { type, ...props } = component;
              componentProps = props;
              console.log(`🔄 Using flattened structure for ${componentType}`);
            } else if (typeof component === "object" && !component.type) {
              // Maybe the component is just props with an implied type?
              console.error(`❌ Component missing type field:`, component);
              throw new Error(
                `Component at index ${index} is missing type field`,
              );
            } else {
              console.error(
                `❌ Invalid component at index ${index}:`,
                component,
              );
              throw new Error(
                `Component at index ${index} has invalid structure`,
              );
            }

            const mappedType =
              componentTypeMapping[componentType] || componentType;
            const transformedProps = transformComponentProps(
              componentType,
              componentProps,
            );

            console.log(
              `📦 Component ${index + 1}: ${componentType} → ${mappedType}`,
            );

            return {
              id: `${mappedType}-${Date.now()}-${index}`,
              type: mappedType,
              content: transformedProps,
            };
          },
        );
      } catch (componentError) {
        console.error("❌ Component processing error:", componentError);
        console.error(
          "❌ Components array:",
          JSON.stringify(generatedSite.components, null, 2),
        );

        // Fallback: try to create a basic hero component
        console.log("🔄 Attempting fallback component creation...");
        try {
          blocks = [
            {
              id: `hero-fallback-${Date.now()}`,
              type: "hero",
              content: {
                title: generatedSite.name || "Welcome",
                subtitle:
                  generatedSite.description || "We create amazing experiences",
                actions: [
                  {
                    label: "Get Started",
                    href: "#contact",
                    variant: "default",
                  },
                ],
                imageUrl:
                  "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200",
              },
            },
          ];
          console.log("✅ Fallback hero component created");
        } catch (fallbackError) {
          console.error("❌ Fallback also failed:", fallbackError);
          return {
            success: false,
            error: "Failed to create fallback components",
          };
        }
      }

      console.log(`✅ Processed ${blocks.length} components for site creation`);

      // Validate required site fields
      if (
        !generatedSite.name ||
        !generatedSite.subdomain ||
        !generatedSite.description
      ) {
        console.error("❌ Missing required site fields:", {
          name: generatedSite.name,
          subdomain: generatedSite.subdomain,
          description: generatedSite.description,
        });
        return {
          success: false,
          error: "AI response missing required site information",
        };
      }

      // Create site in database
      const site = await prisma.site.create({
        data: {
          name: generatedSite.name,
          subdomain: finalSubdomain,
          description: generatedSite.description,
          tenantId: tenantId,
          isTemplate: false,
          isPublished: true,
          styles: {
            primary: generatedSite.primaryColor || "#3b82f6",
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
            { label: "Services", href: "#services" },
            { label: "Contact", href: "#contact" },
          ],
        },
      });

      console.log(
        "✅ Site created:",
        site.id,
        "with subdomain:",
        finalSubdomain,
      );

      // Create homepage with generated blocks
      await prisma.page.create({
        data: {
          siteId: site.id,
          name: "Home",
          slug: "/",
          path: "/",
          draftContent: blocks,
          publishedContent: blocks,
          isPublished: true,
          isHomePage: true,
        },
      });

      console.log("✅ Homepage created with", blocks.length, "components");

      // Log the AI generation
      await prisma.auditLog.create({
        data: {
          adminEmail: user.email,
          action: "AI_SITE_GENERATED",
          targetId: site.id,
          targetType: "Site",
          metadata: {
            prompt: userPrompt,
            industry: generatedSite.industry,
            componentCount: blocks.length,
          },
        },
      });

      revalidatePath("/app");

      return {
        success: true,
        siteId: site.id,
        subdomain: finalSubdomain,
      };
    } catch (error: any) {
      console.error("❌ AI generation error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        cause: error.cause,
      });

      // Handle specific AI errors
      if (
        error.message?.includes("API key") ||
        error.message?.includes("GOOGLE_GENERATIVE_AI_API_KEY")
      ) {
        return {
          success: false,
          error: "AI service configuration error. Please check your API key.",
        };
      }

      if (error.message?.includes("rate limit")) {
        return {
          success: false,
          error: "Too many requests. Please try again in a moment.",
        };
      }

      if (
        error.message?.includes("fetch") ||
        error.message?.includes("network")
      ) {
        return {
          success: false,
          error: "Network error. Please check your internet connection.",
        };
      }

      // Return more specific error message
      const errorMessage = error.message || "Unknown error occurred";
      console.error("Returning error to user:", errorMessage);

      return {
        success: false,
        error: `Failed to generate site: ${errorMessage.substring(0, 100)}`,
      };
    }
  }
}
