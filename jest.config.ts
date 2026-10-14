import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "node",
  roots: ["<rootDir>/tests/unit"],
  setupFilesAfterEnv: ["<rootDir>/tests/unit/setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^server-only$": "<rootDir>/tests/unit/empty.ts",
  },
};

export default createJestConfig(config);
