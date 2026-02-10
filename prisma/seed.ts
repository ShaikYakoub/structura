import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create Tenant
  const tenant = await prisma.tenant.upsert({
    where: { email: "demo@structura.in" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@structura.in",
      slug: "demo-user",
    },
  });

  console.log("✓ Created tenant:", tenant.name);

  // Create Demo User
  const hashedPassword = await bcrypt.hash("password", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@structura.in" },
    update: {},
    create: {
      email: "demo@structura.in",
      name: "Demo User",
      password: hashedPassword,
      tenantId: tenant.id,
    },
  });

  console.log("✓ Created user:", user.email);

  // Create Bakery Site
  const bakerySite = await prisma.site.upsert({
    where: { subdomain: "bakery" },
    update: {},
    create: {
      name: "Bakery",
      subdomain: "bakery",
      description: "Fresh artisan bread and pastries made daily",
      tenantId: tenant.id,
      isPublished: true,
    },
  });

  console.log("✓ Created site:", bakerySite.name);

  // Create Gym Site
  const gymSite = await prisma.site.upsert({
    where: { subdomain: "gym" },
    update: {},
    create: {
      name: "Gym",
      subdomain: "gym",
      description: "Transform your body and mind with expert training",
      tenantId: tenant.id,
      isPublished: true,
    },
  });

  console.log("✓ Created site:", gymSite.name);

  // Create Bakery Home Page
  await prisma.page.upsert({
    where: {
      siteId_slug: {
        siteId: bakerySite.id,
        slug: "/",
      },
    },
    update: {},
    create: {
      name: "Home",
      slug: "/",
      path: "/",
      siteId: bakerySite.id,
      isPublished: true,
      isHomePage: true,
      content: {
        sections: [
          {
            type: "hero",
            data: {
              title: "Fresh Artisan Bakery",
              subtitle:
                "Handcrafted bread and pastries baked fresh every morning",
              image:
                "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200",
            },
          },
          {
            type: "features",
            data: {
              title: "Why Choose Us",
              features: [
                {
                  title: "Fresh Daily",
                  description:
                    "Everything is baked fresh every morning using traditional methods",
                },
                {
                  title: "Quality Ingredients",
                  description:
                    "We use only the finest organic flour and natural ingredients",
                },
                {
                  title: "Family Recipes",
                  description:
                    "Time-tested recipes passed down through generations",
                },
              ],
            },
          },
          {
            type: "cta",
            data: {
              title: "Visit Us Today",
              subtitle: "Experience the taste of fresh artisan baking",
              buttonText: "View Menu",
              buttonLink: "#menu",
              variant: "primary",
            },
          },
        ],
      },
    },
  });

  // Create Bakery About Page
  await prisma.page.upsert({
    where: {
      siteId_slug: {
        siteId: bakerySite.id,
        slug: "about",
      },
    },
    update: {},
    create: {
      name: "About Us",
      slug: "about",
      path: "/about",
      siteId: bakerySite.id,
      isPublished: true,
      isHomePage: false,
      content: {
        sections: [
          {
            type: "hero",
            data: {
              title: "Our Story",
              subtitle: "Four generations of baking excellence",
              image:
                "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=1200",
            },
          },
          {
            type: "features",
            data: {
              title: "Our Values",
              features: [
                {
                  title: "Tradition",
                  description:
                    "We honor time-tested baking methods passed down through our family",
                },
                {
                  title: "Quality",
                  description:
                    "Only the finest ingredients make it into our kitchen",
                },
                {
                  title: "Community",
                  description:
                    "We're proud to serve our neighbors with delicious baked goods",
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Create Gym Home Page
  await prisma.page.upsert({
    where: {
      siteId_slug: {
        siteId: gymSite.id,
        slug: "/",
      },
    },
    update: {},
    create: {
      name: "Home",
      slug: "/",
      path: "/",
      siteId: gymSite.id,
      isPublished: true,
      isHomePage: true,
      content: {
        sections: [
          {
            type: "hero",
            data: {
              title: "Transform Your Life",
              subtitle: "State-of-the-art fitness center with expert trainers",
              image:
                "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200",
            },
          },
          {
            type: "features",
            data: {
              title: "Our Facilities",
              features: [
                {
                  title: "Modern Equipment",
                  description: "Latest cardio and strength training machines",
                },
                {
                  title: "Expert Trainers",
                  description:
                    "Certified professionals to guide your fitness journey",
                },
                {
                  title: "Group Classes",
                  description: "Yoga, spinning, HIIT and more",
                },
              ],
            },
          },
          {
            type: "cta",
            data: {
              title: "Start Your Transformation",
              subtitle: "Join today and get your first month at 50% off",
              buttonText: "Get Started",
              buttonLink: "#pricing",
              variant: "primary",
            },
          },
        ],
      },
    },
  });

  // Create Gym About Page
  await prisma.page.upsert({
    where: {
      siteId_slug: {
        siteId: gymSite.id,
        slug: "about",
      },
    },
    update: {},
    create: {
      name: "About Us",
      slug: "about",
      path: "/about",
      siteId: gymSite.id,
      isPublished: true,
      isHomePage: false,
      content: {
        sections: [
          {
            type: "hero",
            data: {
              title: "Our Mission",
              subtitle: "Empowering communities through fitness",
              image:
                "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200",
            },
          },
          {
            type: "features",
            data: {
              title: "What We Offer",
              features: [
                {
                  title: "Personalized Training",
                  description: "Custom workout plans tailored to your goals",
                },
                {
                  title: "Nutritional Guidance",
                  description: "Expert advice on meal planning and supplements",
                },
                {
                  title: "Supportive Community",
                  description: "Join a motivated group of fitness enthusiasts",
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("✓ Created sample pages");
  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
