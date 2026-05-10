import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import {
  applyTemplatePlaceholders,
  copyTemplate,
  validateProjectDoesNotExist,
  validateTemplate
} from '../services/template.service.js';

const SUPPORTED_TEMPLATES = ['springboot', 'express'];

function validateRequiredArg(value: string | undefined, fieldName: string): void {
  if (!value || !value.trim()) {
    throw new Error(`${fieldName} is required`);
  }
}

function validateTemplateArg(template: string): void {
  if (!SUPPORTED_TEMPLATES.includes(template)) {
    throw new Error('Template not found');
  }
}

export async function createCommand(projectName: string, template: string): Promise<void> {
  try {
    validateRequiredArg(projectName, 'Project name');
    validateRequiredArg(template, 'Template');
    validateTemplateArg(template.toLowerCase());
    const selectedTemplate = template.toLowerCase();

    const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Create project ${chalk.cyan(projectName)} using template ${chalk.yellow(selectedTemplate)}?`,
        default: true
      }
    ]);

    if (!confirm) {
      console.log(chalk.yellow('Operation cancelled.'));
      return;
    }

    const validateSpinner = ora('Validando argumentos e template...').start();
    await validateTemplate(selectedTemplate);
    await validateProjectDoesNotExist(projectName);
    validateSpinner.succeed('Validação concluída.');

    const copySpinner = ora('Copiando template...').start();
    const projectPath = await copyTemplate(selectedTemplate, projectName);
    copySpinner.succeed('Template copiado com sucesso.');

    const placeholderSpinner = ora('Substituindo placeholders...').start();
    await applyTemplatePlaceholders(projectPath, projectName, selectedTemplate);
    placeholderSpinner.succeed('Placeholders substituídos com sucesso.');

    console.log(chalk.green('\nProjeto criado com sucesso!'));
    console.log(chalk.white(`Local: ${projectPath}`));
    console.log(chalk.blue(`\nPróximo passo: cd ${projectName}`));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    console.error(chalk.red(`❌ ${message}`));
    process.exitCode = 1;
  }
}
