import { prisma } from "../lib/db";

const categories = [
  { name: "Christian Living", slug: "christian-living" },
  { name: "Bible Study", slug: "bible-study" },
  { name: "Devotional", slug: "devotional" },
  { name: "Software Engineering", slug: "software-engineering" },
  { name: "APIs", slug: "apis" },
  { name: "Web Development", slug: "web-development" },
  { name: "Career", slug: "career" },
];

const tags = [
  { name: "Grace", slug: "grace" },
  { name: "Faith", slug: "faith" },
  { name: "Next.js", slug: "nextjs" },
  { name: "React", slug: "react" },
  { name: "TypeScript", slug: "typescript" },
  { name: "PostgreSQL", slug: "postgresql" },
  { name: "API Design", slug: "api-design" },
  { name: "Spiritual Growth", slug: "spiritual-growth" },
  { name: "Prayer", slug: "prayer" },
  { name: "System Architecture", slug: "system-architecture" },
];

async function main() {
  console.log("Seeding started...");

  // Seed Categories
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log(`Seeded ${categories.length} categories.`);

  // Seed Tags
  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: tag,
    });
  }
  console.log(`Seeded ${tags.length} tags.`);

  console.log("Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
