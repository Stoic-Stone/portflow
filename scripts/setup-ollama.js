import { execSync } from 'child_process';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OLLAMA_VERSION = '0.1.29';
const MODEL_NAME = 'mistral';

function checkOllamaInstallation() {
  try {
    execSync('ollama --version');
    console.log('✅ Ollama is already installed');
    return true;
  } catch (error) {
    return false;
  }
}

function installOllama() {
  const platform = os.platform();
  console.log('Installing Ollama...');

  try {
    if (platform === 'win32') {
      // Windows installation
      const installerUrl = `https://github.com/ollama/ollama/releases/download/v${OLLAMA_VERSION}/Ollama-Setup.exe`;
      console.log(`Please download and install Ollama from: ${installerUrl}`);
      console.log('After installation, restart your terminal and run this script again.');
      process.exit(0);
    } else if (platform === 'darwin') {
      // macOS installation
      execSync('curl -fsSL https://ollama.com/install.sh | sh');
    } else if (platform === 'linux') {
      // Linux installation
      execSync('curl -fsSL https://ollama.com/install.sh | sh');
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }
  } catch (error) {
    console.error('Failed to install Ollama:', error);
    process.exit(1);
  }
}

function pullModel() {
  console.log(`Pulling ${MODEL_NAME} model...`);
  try {
    execSync(`ollama pull ${MODEL_NAME}`);
    console.log(`✅ ${MODEL_NAME} model downloaded successfully`);
  } catch (error) {
    console.error('Failed to pull model:', error);
    process.exit(1);
  }
}

function createEnvFile() {
  const envPath = path.join(__dirname, '..' , '.env');
  const envContent = `
# Ollama Configuration
VITE_OLLAMA_API_URL=http://localhost:11434
VITE_OLLAMA_MODEL=mistral
`;

  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent.trim());
    console.log('✅ Created .env file with Ollama configuration');
  } else {
    // Check if the existing .env file contains the correct Ollama API URL
    const existingContent = fs.readFileSync(envPath, 'utf-8');
    if (!existingContent.includes('VITE_OLLAMA_API_URL=http://localhost:11434')) {
      console.log('Updating VITE_OLLAMA_API_URL in .env file.');
      const updatedContent = existingContent.replace(/VITE_OLLAMA_API_URL=.*/, 'VITE_OLLAMA_API_URL=http://localhost:11434');
      fs.writeFileSync(envPath, updatedContent);
    } else {
      console.log('ℹ️ .env file already exists with correct Ollama configuration, skipping creation');
    }
  }
}

function main() {
  console.log('🚀 Setting up Ollama for PortFlow AI Assistant...\n');

  if (!checkOllamaInstallation()) {
    installOllama();
  }

  pullModel();
  createEnvFile();

  console.log('\n✨ Setup complete! You can now use the PortFlow AI Assistant.');
  console.log('To start using it:');
  console.log('1. Make sure Ollama is running');
  console.log('2. Start your PortFlow application');
  console.log('3. The AI Assistant will be available in the bottom-right corner of every page');
}

main(); 