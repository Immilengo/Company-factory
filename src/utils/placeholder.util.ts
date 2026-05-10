import fs from 'fs-extra';
import path from 'path';
import { PLACEHOLDER_FILE_EXTENSIONS } from './constants.js';
import { PlaceholderValues } from '../types/template.types.js';

function shouldReplaceInFile(filePath: string): boolean {
  const extension = path.extname(filePath).toLowerCase();
  return PLACEHOLDER_FILE_EXTENSIONS.includes(extension);
}

function replacePlaceholders(content: string, placeholders: PlaceholderValues): string {
  let updatedContent = content;

  Object.entries(placeholders).forEach(([key, value]) => {
    const pattern = new RegExp(`{{${key}}}`, 'g');
    updatedContent = updatedContent.replace(pattern, value);
  });

  return updatedContent;
}

export async function replacePlaceholdersInDirectory(
  targetDir: string,
  placeholders: PlaceholderValues
): Promise<void> {
  const entries = (await fs.readdir(targetDir)) as string[];

  await Promise.all(
    entries.map(async (entry: string) => {
      const fullPath = path.join(targetDir, entry);
      const stats = await fs.stat(fullPath);

      if (stats.isDirectory()) {
        await replacePlaceholdersInDirectory(fullPath, placeholders);
        return;
      }

      if (!shouldReplaceInFile(fullPath)) {
        return;
      }

      const content = await fs.readFile(fullPath, 'utf8');
      const updatedContent = replacePlaceholders(content, placeholders);

      if (updatedContent !== content) {
        await fs.writeFile(fullPath, updatedContent, 'utf8');
      }
    })
  );
}
