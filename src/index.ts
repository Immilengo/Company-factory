#!/usr/bin/env node
import { Command } from 'commander';
import dotenv from 'dotenv';
import { createCommand } from './commands/create.command.js';

dotenv.config();

const program = new Command();

program
  .name('mayongi-factory')
  .description('CLI para geração de projetos backend por templates corporativos')
  .version('1.0.0');

program
  .command('create <project-name> <template>')
  .description('Cria um novo projeto backend a partir de um template')
  .action(async (projectName: string, template: string) => {
    await createCommand(projectName, template);
  });

program.parseAsync(process.argv);
