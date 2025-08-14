import fs from 'fs-extra';
import path from 'path';
import prompts from 'prompts';
import kleur from 'kleur';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log(kleur.bold().cyan('\n🚀 Create Remote App\n'));
  console.log('Barebones SvelteKit + Better Auth + Durable Objects starter\n');
  
  // Check for latest version
  try {
    const currentVersion = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')).version;
    console.log(kleur.gray(`v${currentVersion}\n`));
  } catch (e) {
    // Ignore version check errors
  }

  const args = process.argv.slice(2);
  let projectName = args[0];

  if (!projectName) {
    const response = await prompts({
      type: 'text',
      name: 'projectName',
      message: 'Project name:',
      initial: 'my-remote-app',
      validate: (name) => {
        if (!name.trim()) return 'Project name is required';
        if (!/^[a-z0-9-]+$/.test(name)) return 'Use lowercase letters, numbers, and dashes only';
        return true;
      }
    });

    if (!response.projectName) {
      console.log(kleur.red('✖ Cancelled'));
      process.exit(1);
    }

    projectName = response.projectName;
  }

  const targetDir = path.resolve(process.cwd(), projectName);

  // Check if directory exists
  if (fs.existsSync(targetDir)) {
    const response = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: `Directory ${projectName} already exists. Overwrite?`,
      initial: false
    });

    if (!response.overwrite) {
      console.log(kleur.red('✖ Cancelled'));
      process.exit(1);
    }

    fs.removeSync(targetDir);
  }

  // Package manager choice
  const pmResponse = await prompts({
    type: 'select',
    name: 'packageManager',
    message: 'Package manager:',
    choices: [
      { title: 'bun (recommended)', value: 'bun' },
      { title: 'npm', value: 'npm' },
      { title: 'pnpm', value: 'pnpm' }
    ],
    initial: 0
  });

  const packageManager = pmResponse.packageManager || 'bun';

  // Initialize git
  const gitResponse = await prompts({
    type: 'confirm',
    name: 'git',
    message: 'Initialize git repository?',
    initial: true
  });

  const initGit = gitResponse.git;

  // Install dependencies
  const installResponse = await prompts({
    type: 'confirm',
    name: 'install',
    message: 'Install dependencies?',
    initial: true
  });

  const installDeps = installResponse.install;

  console.log(kleur.gray('\n📁 Creating project...'));

  // Copy template
  const templateDir = path.join(__dirname, '../template');
  fs.copySync(templateDir, targetDir);

  // Generate secure secret
  const authSecret = crypto.randomBytes(32).toString('hex');

  // Replace placeholders in files
  await replaceInFile(path.join(targetDir, 'alchemy.run.ts'), {
    'PROJECT_NAME_PLACEHOLDER': projectName,
    'AUTH_SECRET_PLACEHOLDER': authSecret
  });

  await replaceInFile(path.join(targetDir, 'package.json'), {
    'PROJECT_NAME_PLACEHOLDER': projectName
  });

  await replaceInFile(path.join(targetDir, 'README.md'), {
    'PROJECT_NAME_PLACEHOLDER': projectName
  });

  // Create .env file
  const envContent = `ALCHEMY_PASSWORD=your-password-here
BETTER_AUTH_SECRET=${authSecret}
BETTER_AUTH_URL=http://localhost:5173`;

  fs.writeFileSync(path.join(targetDir, '.env'), envContent);

  // Initialize git
  if (initGit) {
    console.log(kleur.gray('🔧 Initializing git...'));
    process.chdir(targetDir);
    await exec('git init');
    await exec('git add .');
    await exec('git commit -m "Initial commit"');
  }

  // Install dependencies
  if (installDeps) {
    console.log(kleur.gray(`📦 Installing dependencies with ${packageManager}...`));
    process.chdir(targetDir);
    await exec(`${packageManager} install`);
  }

  console.log(kleur.green('\n✅ Project created successfully!\n'));

  console.log(kleur.bold('Next steps:\n'));
  console.log(`  cd ${projectName}`);
  if (!installDeps) {
    console.log(`  ${packageManager} install`);
  }
  console.log(`  ${packageManager} run dev`);

  console.log(kleur.gray('\n📖 Setup guide:\n'));
  console.log('1. Set your ALCHEMY_PASSWORD in .env');
  console.log('2. Run migrations: bun run db:migrate');
  console.log('3. Start development: bun run dev');
  console.log('4. Deploy: bun run deploy');

  console.log(kleur.gray('\n💡 Check the README.md for detailed setup instructions.'));
}

async function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  for (const [placeholder, value] of Object.entries(replacements)) {
    content = content.replace(new RegExp(placeholder, 'g'), value);
  }
  
  fs.writeFileSync(filePath, content);
}

async function exec(command) {
  const { exec } = await import('child_process');
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolve(stdout);
    });
  });
}

main().catch(console.error);
