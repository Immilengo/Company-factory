import path from 'path';
import fs from 'fs-extra';
import { PlaceholderValues, SupportedTemplate } from '../types/template.types.js';
import { TEMPLATE_PORT_MAP } from '../utils/constants.js';
import { replacePlaceholdersInDirectory } from '../utils/placeholder.util.js';

const ROOT_DIR = process.cwd();
const TEMPLATES_DIR = path.join(ROOT_DIR, 'templates');
const GENERATED_DIR = path.join(ROOT_DIR, 'generated-projects');

function getTemplatePath(template: string): string {
  return path.join(TEMPLATES_DIR, template);
}

function getProjectPath(projectName: string): string {
  return path.join(GENERATED_DIR, projectName);
}

export async function validateTemplate(template: string): Promise<void> {
  const templatePath = getTemplatePath(template);
  const exists = await fs.pathExists(templatePath);

  if (!exists) {
    throw new Error('Template not found');
  }
}

export async function validateProjectDoesNotExist(projectName: string): Promise<void> {
  const projectPath = getProjectPath(projectName);
  const exists = await fs.pathExists(projectPath);

  if (exists) {
    throw new Error('Project already exists');
  }
}

function buildPlaceholders(projectName: string, template: string): PlaceholderValues {
  const appPort = TEMPLATE_PORT_MAP[template as SupportedTemplate];

  return {
    PROJECT_NAME: projectName,
    APP_PORT: appPort || '3000',
    DB_NAME: projectName
  };
}

export async function applyTemplatePlaceholders(
  projectPath: string,
  projectName: string,
  template: string
): Promise<void> {
  const placeholders = buildPlaceholders(projectName, template);
  await replacePlaceholdersInDirectory(projectPath, placeholders);
}

export async function copyTemplate(template: string, projectName: string): Promise<string> {
  const templatePath = getTemplatePath(template);
  const projectPath = getProjectPath(projectName);

  await fs.ensureDir(GENERATED_DIR);
  await fs.copy(templatePath, projectPath);

  return projectPath;
}

export async function generateProject(projectName: string, template: string): Promise<string> {
  await validateTemplate(template);
  await validateProjectDoesNotExist(projectName);

  const generatedProjectPath = await copyTemplate(template, projectName);
  await applyTemplatePlaceholders(generatedProjectPath, projectName, template);

  return generatedProjectPath;
}
