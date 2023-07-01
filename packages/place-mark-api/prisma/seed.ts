import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const admin = await prisma.user.upsert({
    where: { email: "johann.schoen@st.oth-regensburg.de" },
    update: {},
    create: {
      firstName: "Johann",
      lastName: "Schön",
      email: "johann.schoen@st.oth-regensburg.de",
      password: "1234qwer",
      admin: true,
    },
  });
  console.log(admin);

  const categories: { [key: string]: string } = {
    "649fcd027782935c45c512d0": "Landscape feature",
    "649fcd0fa5b93c10ffa56110": "National monument",
    "649fcd13bb6cc88bd73b8657": "Walking Trail",
    "649fcd16c86e93c9b728b94f": "Bridge",
    "649fcd1987e9d857e53c7996": "Tree",
    "649fcd1dc0fc53ac78dd1a9e": "Island",
    "649fcd203ca921ccd91cc1f4": "Town",
    "649fcd23131c67a1e9b24896": "City",
    "649fcd27a1d0838ed1d86f49": "Forest",
    "649fcd2bbdab7a1747c9d722": "River",
    "649fcd2e0e98009ad04eef99": "Archaeological Feature",
  };

  for (let id of Object.keys(categories)) {
    const designation = categories[id];
    const entity = await prisma.category.upsert({
      where: { id: id },
      update: {},
      create: {
        id: id,
        designation: designation,
        createdById: admin.id,
      },
    });
    console.log(entity);
  }

  const placeMarks: { [key: string]: { designation: string; description?: string; latitude: number; longitude: number; categoryId: string } } = {
    "649fd16632659f82095028d3": {
      designation: "Bachmühlbach",
      description: 'A small brook that passes a mill called "Bachmühle" (which translates to "a mill at the brook"), where I do not know to this day what was named first 😲',
      latitude: 49.032032,
      longitude: 11.884858,
      categoryId: "649fcd2bbdab7a1747c9d722",
    },
    "649fd1794ff6209cd1cd3f37": {
      designation: "Regensburg",
      description: "A bavarian city which is next to the Donau",
      latitude: 49.01305,
      longitude: 12.101696,
      categoryId: "649fcd23131c67a1e9b24896",
    },
    "649fd22fe06c2ac319a7b040": {
      designation: "Holzerlebniskugel (Steinberg am See)",
      description: "A huge wooden sphere on which you can walk up and get down on a slide.",
      latitude: 49.286549,
      longitude: 12.15485,
      categoryId: "649fcd027782935c45c512d0", // ??
    },
  };

  for (let id of Object.keys(placeMarks)) {
    const data = placeMarks[id];
    const entity = await prisma.placeMark.upsert({
      where: { id: id },
      update: {},
      create: {
        id: id,
        createdById: admin.id,
        ...data,
      },
    });
    console.log(entity);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
