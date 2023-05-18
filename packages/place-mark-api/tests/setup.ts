import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
import chai from "chai";
import { before, after } from "mocha";
import chaiAsPromised from "chai-as-promised";

// @prisma/migrate seems to not export their types properly!
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line
import { DbPush } from "@prisma/migrate";

/**
 * Enable Promise Support for chai
 */
chai.use(chaiAsPromised);

/**
 * Global Setup
 */
before(async () => {
  console.log("Global Setup");
  const filename: string = fileURLToPath(import.meta.url);
  const dirname: string = path.dirname(filename);
  const configFile: string = path.resolve(dirname, "..", ".env.testing");

  // Load and override configuration from .env.testing - File
  const dotenvResult = dotenv.config({
    path: configFile,
    override: true,
  });

  if (dotenvResult.error) {
    throw new Error(dotenvResult.error.message);
  }

  // Db Push Command creates the collections and unique indexes!
  // The DATABASE_URL will be determined through .env file and environment variables.
  const pushCommand: DbPush = DbPush.new();
  await pushCommand.parse([]);
  console.log("Global Setup finished");
});

/**
 * Global Teardown
 */
after(async () => {
  console.log("GLOBAL TEARDOWN");
});
