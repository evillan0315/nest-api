import * as fs from 'fs';

import * as path from 'path';
export interface ParsedField {
  name: string;
  prismaType: string;
  tsType: string;
  type: string;
  isOptional: boolean;
  isRelation: boolean;
  relationType: "one-to-many" | "many-to-one" | null;
  validators: string[];
}

export interface ScalarField extends ParsedField {
  isRelation: false;
  relationType: null;
}

export function parseModel(modelName: string): ScalarField[] {
  const schemaPath = path.resolve(process.cwd(), 'prisma/schema.prisma');
  console.log(schemaPath, 'schemaPath');
  const content = fs.readFileSync(schemaPath, 'utf8');
  //const content = fs.readFileSync("prisma/schema.prisma", "utf8");
  const modelRegex = new RegExp(`model\\s+${modelName}\\s+{([\\s\\S]*?)}`, "m");
  const match = content.match(modelRegex);
  if (!match) throw new Error(`Model ${modelName} not found.`);

  const SCALAR_TYPES = [
    "String",
    "Int",
    "Float",
    "Boolean",
    "DateTime",
    "Json",
    "Bytes",
    "Decimal",
    "BigInt",
  ];

  const fields = match[1]
    .trim()
    .split("\n")
    .map((line) => {
      const cleanedLine = line.trim().replace(/\/\/.*/, "");
      if (!cleanedLine) return null;

      const parts = cleanedLine.split(/\s+/);
      if (parts.length < 2) return null;

      const [name, rawType] = parts;
      const isOptional = rawType.endsWith("?");
      const isArray = rawType.includes("[]");
      const cleanType = rawType.replace("?", "").replace("[]", "");

      const isRelation = !SCALAR_TYPES.includes(cleanType);
      const relationType: ParsedField["relationType"] =
        isRelation && isArray
          ? "one-to-many"
          : isRelation && !isArray
            ? "many-to-one"
            : null;

      // Skip relation fields
      if (relationType !== null) {
        return null;
      }

      const { tsType, validators } = mapPrismaTypeToTsType(
        cleanType,
        isOptional,
        isArray,
        name,
      );

      return {
        name,
        prismaType: cleanType,
        tsType: isArray ? `${tsType}[]` : tsType,
        type: isArray ? `${tsType}[]` : tsType,
        isOptional,
        isRelation: false,
        relationType: null,
        validators,
      } satisfies ScalarField;
    })
    .filter((field): field is ScalarField => field !== null);

  return fields;
}

function mapPrismaTypeToTsType(
  prismaType: string,
  isOptional: boolean,
  isArray: boolean,
  fieldName: string,
): {
  tsType: string;
  validators: string[];
} {
  let tsType = "any";
  let validators: string[] = [];

  const label = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  const isEmailField = fieldName.toLowerCase().includes("email");

  const decorate = (decorator: string, msg: string): string =>
    [
      "IsString",
      "IsOptional",
      "IsDate",
      "IsInt",
      "IsNumber",
      "IsBoolean",
      "IsObject",
      "IsEmail",
    ].includes(decorator)
      ? `@${decorator}()`
      : `@${decorator}({ message: '${msg}' })`;

  switch (prismaType) {
    case "String":
      tsType = "string";
      if (isEmailField) {
        validators.push(
          decorate(
            "IsEmail",
            `${label} must be a valid email address, sweetpea.`,
          ),
        );
      } else {
        validators.push(
          decorate("IsString", `${label} must be text, darlin'!`),
        );
      }
      break;
    case "Int":
      tsType = "number";
      validators.push(decorate("IsInt", `${label} must be a number, sugar.`));
      break;
    case "Float":
      tsType = "number";
      validators.push(
        decorate("IsNumber", `${label} should be a floatin’ number, hun.`),
      );
      break;
    case "Boolean":
      tsType = "boolean";
      validators.push(
        decorate("IsBoolean", `${label} must be true or false, hon.`),
      );
      break;
    case "DateTime":
      tsType = "Date";
      validators.push(
        decorate("IsDate", `${label} must be a proper date, sweetheart.`),
      );
      break;
    case "Json":
      tsType = "any";
      validators.push(
        decorate("IsObject", `${label} must be a valid object, sugarplum.`),
      );
      break;
    default:
      tsType = "string";
      validators.push(decorate("IsString", `${label} must be text, darlin'!`));
      break;
  }

  if (isOptional) {
    validators.unshift(decorate("IsOptional", `${label} is optional, sugar.`));
  }

  return { tsType, validators };
}
