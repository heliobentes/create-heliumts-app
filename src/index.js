import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COLORS = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

function log(message, color = '') {
    console.log(`${color}${message}${COLORS.reset}`);
}

function logSuccess(message) {
    log(`✓ ${message}`, COLORS.green);
}

function logError(message) {
    log(`✗ ${message}`, COLORS.red);
}

function logInfo(message) {
    log(`ℹ ${message}`, COLORS.cyan);
}

function printBanner() {
    console.log('');
    log('╔═══════════════════════════════════════════╗', COLORS.cyan);
    log('║                                           ║', COLORS.cyan);
    log('║        🚀 Create HeliumTS App 🚀          ║', COLORS.cyan);
    log('║                                           ║', COLORS.cyan);
    log('╚═══════════════════════════════════════════╝', COLORS.cyan);
    console.log('');
}

function askQuestion(rl, question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

// Files that need to be renamed from 'name' to '.name' (npm doesn't include dotfiles in packages)
const DOTFILE_RENAMES = {
    'gitignore': '.gitignore',
    'prettierrc': '.prettierrc',
    'prettierignore': '.prettierignore'
};

function copyDirectory(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destName = DOTFILE_RENAMES[entry.name] || entry.name;
        const destPath = path.join(dest, destName);
        
        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

function isDirectoryEmpty(dirPath) {
    if (!fs.existsSync(dirPath)) {
        return true;
    }
    
    const files = fs.readdirSync(dirPath);
    // Ignore hidden files like .git, .DS_Store
    const visibleFiles = files.filter(f => !f.startsWith('.'));
    return visibleFiles.length === 0;
}

function parseArgs(args) {
    const result = {
        projectName: null,
        tailwind: null // null means ask, true means use tailwind, false means skip tailwind
    };
    
    for (const arg of args) {
        if (arg === '--tailwind') {
            result.tailwind = true;
        } else if (arg === '--no-tailwind') {
            result.tailwind = false;
        } else if (!arg.startsWith('-')) {
            result.projectName = arg;
        }
    }
    
    return result;
}

export async function createApp() {
    printBanner();
    
    // Get project name from command line arguments
    const args = process.argv.slice(2);
    const { projectName, tailwind: tailwindFlag } = parseArgs(args);
    
    if (!projectName) {
        logError('Please specify the project directory:');
        console.log('');
        log('  npx create-heliumts-app <project-directory>', COLORS.dim);
        console.log('');
        log('For example:', COLORS.dim);
        log('  npx create-heliumts-app my-helium-app', COLORS.dim);
        log('  npx create-heliumts-app my-helium-app --tailwind', COLORS.dim);
        log('  npx create-heliumts-app .', COLORS.dim);
        console.log('');
        process.exit(1);
    }
    
    // Resolve the target directory
    const isCurrentDir = projectName === '.';
    const targetDir = isCurrentDir 
        ? process.cwd() 
        : path.resolve(process.cwd(), projectName);
    
    const displayName = isCurrentDir ? 'current directory' : projectName;
    
    // Check if directory is empty
    if (!isDirectoryEmpty(targetDir)) {
        logError(`The directory "${displayName}" is not empty.`);
        log('Please choose an empty directory or remove existing files.', COLORS.dim);
        console.log('');
        process.exit(1);
    }
    
    // Create readline interface for user input
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    try {
        // Determine if we should use Tailwind
        let useTailwind;
        
        if (tailwindFlag !== null) {
            // Flag was provided, use it directly
            useTailwind = tailwindFlag;
            log(`Creating a new HeliumTS app in ${COLORS.cyan}${targetDir}${COLORS.reset}`);
            console.log('');
            logInfo(`Using ${useTailwind ? 'Tailwind CSS' : 'basic'} template (from flag)...`);
        } else {
            // Ask the user
            log(`Creating a new HeliumTS app in ${COLORS.cyan}${targetDir}${COLORS.reset}`);
            console.log('');
            
            const tailwindAnswer = await askQuestion(
                rl, 
                `${COLORS.yellow}?${COLORS.reset} Do you want to use Tailwind CSS? ${COLORS.dim}(Y/n)${COLORS.reset} `
            );
            
            // Default is YES (Tailwind)
            useTailwind = tailwindAnswer.toLowerCase() !== 'n' && tailwindAnswer.toLowerCase() !== 'no';
            console.log('');
            logInfo(`Using ${useTailwind ? 'Tailwind CSS' : 'basic'} template...`);
        }
        
        const templateName = useTailwind ? 'tailwind' : 'basic';
        
        // Get template path
        const templatesDir = path.join(__dirname, '..', 'templates');
        const templatePath = path.join(templatesDir, templateName);
        
        // Check if template exists
        if (!fs.existsSync(templatePath)) {
            logError(`Template "${templateName}" not found at ${templatePath}`);
            log('Please make sure the templates are properly installed.', COLORS.dim);
            process.exit(1);
        }
        
        // Copy template to target directory
        logInfo('Scaffolding project...');
        copyDirectory(templatePath, targetDir);
        
        // Update package.json with project name
        const packageJsonPath = path.join(targetDir, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            packageJson.name = isCurrentDir ? path.basename(targetDir) : projectName;
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
        }
        
        logSuccess('Project scaffolded successfully!');
        
        // Install dependencies
        console.log('');
        logInfo('Installing dependencies...');
        console.log('');
        
        try {
            execSync('npm install', {
                cwd: targetDir,
                stdio: 'inherit'
            });
            console.log('');
            logSuccess('Dependencies installed successfully!');
        } catch (error) {
            logError('Failed to install dependencies.');
            log('Please run "npm install" manually in the project directory.', COLORS.dim);
        }
        
        // Print success message
        console.log('');
        log('═══════════════════════════════════════════', COLORS.green);
        logSuccess('Your HeliumTS app is ready!');
        log('═══════════════════════════════════════════', COLORS.green);
        console.log('');
        
        log('Next steps:', COLORS.bright);
        console.log('');
        
        if (!isCurrentDir) {
            log(`  cd ${projectName}`, COLORS.cyan);
        }
        log('  npm run dev', COLORS.cyan);
        console.log('');
        
        log('Available commands:', COLORS.bright);
        console.log('');
        log('  npm run dev     - Start development server', COLORS.dim);
        log('  npm run build   - Build for production', COLORS.dim);
        log('  npm run start   - Start production server', COLORS.dim);
        console.log('');
        
        log('Happy coding! 🎉', COLORS.magenta);
        console.log('');
        
    } finally {
        rl.close();
    }
}
