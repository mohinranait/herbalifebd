import "dotenv/config";
import path from "node:path";
import fs from "node:fs";
import { definePrismaConfig } from "prisma/config";
import { defineConfig as ormConfig } from "@prisma/orm-mongo/config";
import { mongoContract } from "@prisma/orm-family-mongo/contract-psl/provider";
import mongoTargetPack from "@prisma/orm-target-mongo/target/pack";
import { MONGO_INT32_CODEC_ID, MONGO_STRING_CODEC_ID } from "@prisma/orm-target-mongo/target/codec-ids";

const schemaDir = path.resolve(process.cwd(), "src/prisma/schema");
const schemaFiles = fs
  .readdirSync(schemaDir)
  .filter((f) => f.endsWith(".prisma"))
  .map((f) => path.join(schemaDir, f));

const baseContract = mongoContract(schemaFiles[0], {
  target: mongoTargetPack,
  output: path.resolve(process.cwd(), "src/prisma/contract.json"),
  enumInferenceCodecs: {
    text: MONGO_STRING_CODEC_ID,
    int: MONGO_INT32_CODEC_ID,
  },
});

const contract = {
  ...baseContract,
  source: {
    ...baseContract.source,
    inputs: schemaFiles,
  },
};

export default definePrismaConfig({
  orm: ormConfig({
    contract,
    db: {
      connection: process.env["DATABASE_URL"] || "",
    },
  }),
});
