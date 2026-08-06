const { PrismaClient } = require('@prisma/client');
const { createHash, randomBytes } = require('crypto');

const prisma = new PrismaClient();

function createApiKey() {
  const token = randomBytes(24).toString("base64url");
  const secret = `tl_live_${token}`;
  return { secret, prefix: secret.slice(0, 13), secretHash: createHash("sha256").update(secret).digest("hex") };
}

async function main() {
  const org = await prisma.organization.create({
    data: {
      name: "Test Organization",
      slug: "test-org"
    }
  });

  const generated = createApiKey();
  const apiKey = await prisma.apiKey.create({
    data: {
      organizationId: org.id,
      name: "Test Key",
      prefix: generated.prefix,
      secretHash: generated.secretHash
    }
  });

  console.log("Created Organization:", org.slug);
  console.log("Created API Key Secret (SAVE THIS):", generated.secret);
}

main().catch(console.error).finally(() => prisma.$disconnect());
