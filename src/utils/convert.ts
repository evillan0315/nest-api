import yaml from 'js-yaml';
import ts from 'typescript';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Readable } from 'stream';
/**
 * Converts a JSON object to Markdown format.
 * @param {object} data - The JSON object to convert.
 * @returns {string} - The formatted Markdown string.
 */
function jsonToMarkdown(data: object) {
  let markdown = '';
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'object' && value !== null) {
      markdown += `## ${key}\n`;
      markdown += jsonToMarkdown(value);
    } else {
      markdown += `- **${key}**: ${value}\n`;
    }
  }
  return markdown;
}

/**
 * Converts a YAML string to a JSON object and then to Markdown.
 * @param {string} yamlString - The YAML string to convert.
 * @returns {string} - The formatted Markdown string.
 */
function yamlToMarkdown(yamlString: string) {
  const jsonData = yaml.load(yamlString);
  return jsonToMarkdown(jsonData as object);
}

/**
 * Converts TypeScript code to Markdown format by extracting comments and function signatures.
 * @param {string} tsCode - The TypeScript code as a string.
 * @returns {string} - The formatted Markdown documentation.
 */
function typescriptToMarkdown(tsCode: string) {
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    tsCode,
    ts.ScriptTarget.Latest,
    true,
  );
  let markdown = '';

  function extractComments(node: ts.Node) {
    const fullText = node.getFullText(sourceFile);
    const commentRegex = /\/\*\*(.*?)\*\//gs;
    const matches = fullText.match(commentRegex);
    if (matches) {
      for (const match of matches) {
        markdown += `${match.replace(/\*\//g, '').replace(/\/\*/g, '').trim()}\n\n`;
      }
    }
    ts.forEachChild(node, extractComments);
  }

  extractComments(sourceFile);
  return markdown;
}

/**
 * Converts Markdown format back to a JSON object.
 * @param {string} markdown - The Markdown string to convert.
 * @returns {object} - The parsed JSON object.
 */
function markdownToJson(markdown: string) {
  const lines = markdown.split('\n');
  const jsonObject: any = {};
  let currentKey = '';

  for (const line of lines) {
    if (line.startsWith('## ')) {
      currentKey = line.replace('## ', '').trim();
      jsonObject[currentKey] = {};
    } else if (line.startsWith('- **')) {
      const match = line.match(/- \*\*(.*?)\*\*: (.*)/);
      if (match && currentKey) {
        jsonObject[currentKey][match[1]] = match[2];
      }
    }
  }

  return jsonObject;
}

/**
 * Reads a JSON, YAML, Markdown, or TypeScript file and converts it to Markdown or JSON.
 * @param {string} filePath - The path to the file.
 * @returns {string | object} - The formatted Markdown string or JSON object.
 */
export function convertFile(filePath: string): string | object {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  //const fileContent = await fs.promises.readFile(filePath, 'utf-8');
  //return { content: fileContent, type: 'text' };
  if (filePath.endsWith('.json')) {
    return jsonToMarkdown(JSON.parse(fileContent));
  } else if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
    return yamlToMarkdown(fileContent);
  } else if (filePath.endsWith('.ts')) {
    return typescriptToMarkdown(fileContent);
  } else if (filePath.endsWith('.md')) {
    console.log(fileContent, filePath);
    return markdownToJson(fileContent);
  } else {
    throw new Error(
      'Unsupported file format. Please provide a JSON, YAML, Markdown, or TypeScript file.',
    );
  }
}

/**
 * Example usage:
 * ```typescript
 * import { convertFile } from "./json_yaml_to_markdown";
 *
 * const markdownOutput = convertFile("data.json");
 * console.log(markdownOutput);
 *
 * const jsonOutput = convertFile("data.md");
 * console.log(jsonOutput);
 * ```
 */
