import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';
import { parseModel } from './parser';

export async function generateResource(modelName: string, outDir?: string) {
  const className = capitalize(modelName);
  const fileName = modelName.charAt(0).toLowerCase() + modelName.slice(1); // ✅ camelCase filenames
  const folderName = toDashCase(modelName); // ✅ dash-case folder
  const fields = parseModel(modelName);

  const templates = [
    { name: 'controller', out: `${folderName}.controller.ts` },
    { name: 'service', out: `${folderName}.service.ts` },
    { name: 'module', out: `${folderName}.module.ts` },
    { name: 'create-dto', out: `dto/create-${folderName}.dto.ts` },
    { name: 'update-dto', out: `dto/update-${folderName}.dto.ts` },
  ];

  const targetDir = path.join(outDir || 'output', folderName); // ✅ using dash-case for folder only
  const dtoDir = path.join(targetDir, 'dto');

  fs.mkdirSync(dtoDir, { recursive: true });

  for (const tpl of templates) {
    const template = fs.readFileSync(
      path.join(__dirname, 'templates', `${tpl.name}.ts.ejs`),
      'utf8',
    );
    const result = ejs.render(template, { className, fileName, fields, folderName });
    const outPath = path.join(targetDir, tpl.out);
    fs.writeFileSync(outPath, result);
    console.log(`✔ Generated: ${outPath}`);
  }
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toDashCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

