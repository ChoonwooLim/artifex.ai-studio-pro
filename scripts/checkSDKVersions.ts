#!/usr/bin/env node

/**
 * SDK Version Checker Script
 * 
 * This script checks for updates to AI SDK packages used in the project
 * and maintains an up-to-date record of SDK versions.
 * 
 * Usage:
 *   npm run check-sdk-versions    - Check for SDK updates
 *   npm run update-sdks           - Update outdated SDKs
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface SDKInfo {
  package: string;
  displayName: string;
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  updateType?: 'major' | 'minor' | 'patch';
  description?: string;
}

// List of AI SDKs to track
const AI_SDKS = [
  { package: 'openai', displayName: 'OpenAI SDK' },
  { package: '@anthropic-ai/sdk', displayName: 'Anthropic Claude SDK' },
  { package: '@google/generative-ai', displayName: 'Google Generative AI SDK' },
  { package: '@mistralai/mistralai', displayName: 'Mistral AI SDK' },
  { package: 'cohere-ai', displayName: 'Cohere SDK' },
  { package: 'replicate', displayName: 'Replicate SDK' },
  { package: '@huggingface/inference', displayName: 'Hugging Face SDK' },
  { package: 'together-ai', displayName: 'Together AI SDK' },
  { package: '@langchain/core', displayName: 'LangChain Core' },
];

// Legacy/deprecated packages to check for removal
const DEPRECATED_SDKS = [
  { package: '@google/genai', reason: 'Use @google/generative-ai instead' },
];

class SDKVersionChecker {
  private results: SDKInfo[] = [];
  
  /**
   * Get the current version of a package from package.json
   */
  private async getCurrentVersion(packageName: string): Promise<string | null> {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      // Check both dependencies and devDependencies
      const version = packageJson.dependencies?.[packageName] || 
                     packageJson.devDependencies?.[packageName];
      
      if (version) {
        // Remove version prefixes like ^, ~, etc.
        return version.replace(/^[\^~>=<]/, '');
      }
      return null;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Get the latest version of a package from npm registry
   */
  private async getLatestVersion(packageName: string): Promise<string | null> {
    try {
      const { stdout } = await execAsync(`npm view ${packageName} version`);
      return stdout.trim();
    } catch (error) {
      console.error(`Failed to get latest version for ${packageName}`);
      return null;
    }
  }
  
  /**
   * Compare versions and determine update type
   */
  private compareVersions(current: string, latest: string): {
    hasUpdate: boolean;
    updateType?: 'major' | 'minor' | 'patch';
  } {
    const parseVersion = (v: string) => {
      const parts = v.split('.').map(p => parseInt(p, 10));
      return { major: parts[0] || 0, minor: parts[1] || 0, patch: parts[2] || 0 };
    };
    
    const currentVersion = parseVersion(current);
    const latestVersion = parseVersion(latest);
    
    if (latestVersion.major > currentVersion.major) {
      return { hasUpdate: true, updateType: 'major' };
    } else if (latestVersion.major === currentVersion.major && 
               latestVersion.minor > currentVersion.minor) {
      return { hasUpdate: true, updateType: 'minor' };
    } else if (latestVersion.major === currentVersion.major && 
               latestVersion.minor === currentVersion.minor && 
               latestVersion.patch > currentVersion.patch) {
      return { hasUpdate: true, updateType: 'patch' };
    }
    
    return { hasUpdate: false };
  }
  
  /**
   * Check all SDKs for updates
   */
  async checkAllSDKs(): Promise<void> {
    console.log('🔍 Checking SDK versions...\n');
    
    for (const sdk of AI_SDKS) {
      const current = await this.getCurrentVersion(sdk.package);
      const latest = await this.getLatestVersion(sdk.package);
      
      if (!current) {
        console.log(`⚪ ${sdk.displayName}: Not installed`);
        continue;
      }
      
      if (!latest) {
        console.log(`❌ ${sdk.displayName}: Failed to check`);
        continue;
      }
      
      const comparison = this.compareVersions(current, latest);
      
      const sdkInfo: SDKInfo = {
        package: sdk.package,
        displayName: sdk.displayName,
        currentVersion: current,
        latestVersion: latest,
        hasUpdate: comparison.hasUpdate,
        updateType: comparison.updateType,
      };
      
      this.results.push(sdkInfo);
      
      if (comparison.hasUpdate) {
        const updateIcon = comparison.updateType === 'major' ? '🔴' : 
                          comparison.updateType === 'minor' ? '🟡' : '🟢';
        console.log(`${updateIcon} ${sdk.displayName}: ${current} → ${latest} (${comparison.updateType} update)`);
      } else {
        console.log(`✅ ${sdk.displayName}: ${current} (latest)`);
      }
    }
    
    // Check for deprecated packages
    console.log('\n📦 Checking for deprecated packages...\n');
    for (const deprecated of DEPRECATED_SDKS) {
      const installed = await this.getCurrentVersion(deprecated.package);
      if (installed) {
        console.log(`⚠️  ${deprecated.package} is installed but deprecated`);
        console.log(`    Reason: ${deprecated.reason}`);
      }
    }
  }
  
  /**
   * Generate a markdown report
   */
  generateReport(): string {
    const report: string[] = [];
    
    report.push('# SDK Version Report');
    report.push(`Generated: ${new Date().toISOString()}\n`);
    
    report.push('## AI SDK Versions\n');
    report.push('| SDK | Current Version | Latest Version | Status | Action |');
    report.push('|-----|-----------------|----------------|---------|---------|');
    
    for (const sdk of this.results) {
      const status = sdk.hasUpdate ? 
        `🔄 ${sdk.updateType?.toUpperCase()} update` : 
        '✅ Latest';
      const action = sdk.hasUpdate ? 
        `npm install ${sdk.package}@latest` : 
        '-';
      
      report.push(`| ${sdk.displayName} | ${sdk.currentVersion} | ${sdk.latestVersion} | ${status} | ${action} |`);
    }
    
    report.push('\n## Update Commands\n');
    const updates = this.results.filter(sdk => sdk.hasUpdate);
    
    if (updates.length > 0) {
      report.push('To update all SDKs with available updates:\n');
      report.push('```bash');
      for (const sdk of updates) {
        report.push(`npm install ${sdk.package}@latest`);
      }
      report.push('```\n');
      
      report.push('Or update all at once:\n');
      report.push('```bash');
      const packages = updates.map(sdk => `${sdk.package}@latest`).join(' ');
      report.push(`npm install ${packages}`);
      report.push('```');
    } else {
      report.push('All SDKs are up to date!');
    }
    
    return report.join('\n');
  }
  
  /**
   * Update package.json scripts section with SDK check commands
   */
  async updatePackageScripts(): Promise<void> {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      // Add SDK-related scripts
      const sdkScripts = {
        'check-sdk-versions': 'tsx scripts/checkSDKVersions.ts',
        'update-sdks': 'npm update && npm audit fix',
        'full-update-check': 'npm run check-ai-models && npm run check-sdk-versions',
      };
      
      packageJson.scripts = {
        ...packageJson.scripts,
        ...sdkScripts,
      };
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log('✅ Updated package.json with SDK scripts');
    } catch (error) {
      console.error('Failed to update package.json:', error);
    }
  }
  
  /**
   * Print summary
   */
  printSummary(): void {
    const updates = this.results.filter(sdk => sdk.hasUpdate);
    const majorUpdates = updates.filter(sdk => sdk.updateType === 'major');
    const minorUpdates = updates.filter(sdk => sdk.updateType === 'minor');
    const patchUpdates = updates.filter(sdk => sdk.updateType === 'patch');
    
    console.log('\n📊 Summary:');
    console.log(`  Total SDKs checked: ${this.results.length}`);
    console.log(`  Up to date: ${this.results.length - updates.length}`);
    
    if (updates.length > 0) {
      console.log(`  Updates available: ${updates.length}`);
      if (majorUpdates.length > 0) {
        console.log(`    🔴 Major: ${majorUpdates.length}`);
      }
      if (minorUpdates.length > 0) {
        console.log(`    🟡 Minor: ${minorUpdates.length}`);
      }
      if (patchUpdates.length > 0) {
        console.log(`    🟢 Patch: ${patchUpdates.length}`);
      }
      
      console.log('\nRun "npm run update-sdks" to update all packages.');
    } else {
      console.log('\n✨ All SDKs are up to date!');
    }
  }
}

// CLI Handler
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'check';
  
  const checker = new SDKVersionChecker();
  
  switch (command) {
    case 'check':
      await checker.checkAllSDKs();
      checker.printSummary();
      break;
      
    case 'report':
      await checker.checkAllSDKs();
      const report = checker.generateReport();
      console.log('\n' + report);
      
      // Save report to file
      const reportPath = path.join(process.cwd(), 'docs', 'ai-models', 'SDK_VERSION_REPORT.md');
      fs.writeFileSync(reportPath, report);
      console.log(`\n📄 Report saved to: ${reportPath}`);
      break;
      
    case 'update-scripts':
      await checker.updatePackageScripts();
      break;
      
    case 'help':
      console.log(`
SDK Version Checker

Usage: npm run check-sdk-versions [command]

Commands:
  check          Check for SDK updates (default)
  report         Generate detailed report
  update-scripts Update package.json scripts
  help           Show this help message

Examples:
  npm run check-sdk-versions       # Check for updates
  npm run check-sdk-versions report # Generate report
      `);
      break;
      
    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});

export { SDKVersionChecker, SDKInfo };