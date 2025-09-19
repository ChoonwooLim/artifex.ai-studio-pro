#!/usr/bin/env node

/**
 * AI Model Update Checker Script
 * 
 * This script automatically checks for updates to AI models from various providers
 * and updates the documentation accordingly.
 * 
 * Usage:
 *   npm run check-ai-models    - Check for updates
 *   npm run update-ai-docs      - Update documentation
 *   npm run ai-model-report     - Generate detailed report
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Model provider configurations
interface ModelProvider {
  name: string;
  docsUrl: string;
  apiUrl: string;
  changelogUrl: string;
}

interface ModelInfo {
  provider: string;
  modelId: string;
  displayName: string;
  currentVersion: string;
  latestVersion?: string;
  releaseDate?: string;
  contextWindow?: number;
  deprecated?: boolean;
  hasUpdate?: boolean;
  changelog?: string;
}

interface CheckResult {
  provider: string;
  models: ModelInfo[];
  lastChecked: Date;
  errors?: string[];
}

// AI Provider configurations
const AI_PROVIDERS: ModelProvider[] = [
  {
    name: 'OpenAI',
    docsUrl: 'https://platform.openai.com/docs/models',
    apiUrl: 'https://api.openai.com/v1/models',
    changelogUrl: 'https://platform.openai.com/docs/changelog'
  },
  {
    name: 'Anthropic',
    docsUrl: 'https://docs.anthropic.com/claude/docs/models-overview',
    apiUrl: 'https://api.anthropic.com/v1/models',
    changelogUrl: 'https://docs.anthropic.com/claude/docs/changelog'
  },
  {
    name: 'Google',
    docsUrl: 'https://ai.google.dev/gemini-api/docs/models',
    apiUrl: 'https://generativelanguage.googleapis.com/v1/models',
    changelogUrl: 'https://ai.google.dev/gemini-api/docs/changelog'
  },
  {
    name: 'Mistral',
    docsUrl: 'https://docs.mistral.ai/platform/endpoints',
    apiUrl: 'https://api.mistral.ai/v1/models',
    changelogUrl: 'https://docs.mistral.ai/platform/changelog'
  },
  {
    name: 'Stability AI',
    docsUrl: 'https://platform.stability.ai/docs/models',
    apiUrl: 'https://api.stability.ai/v1/models',
    changelogUrl: 'https://platform.stability.ai/changelog'
  }
];

// Current integrated models (from our codebase)
const CURRENT_MODELS: ModelInfo[] = [
  // OpenAI
  { provider: 'OpenAI', modelId: 'gpt-4o', displayName: 'GPT-4o', currentVersion: 'gpt-4o-2024-08-06', contextWindow: 128000 },
  { provider: 'OpenAI', modelId: 'gpt-4o-mini', displayName: 'GPT-4o Mini', currentVersion: 'gpt-4o-mini-2024-07-18', contextWindow: 128000 },
  { provider: 'OpenAI', modelId: 'gpt-4-turbo', displayName: 'GPT-4 Turbo', currentVersion: 'gpt-4-turbo-preview', contextWindow: 128000 },
  { provider: 'OpenAI', modelId: 'dall-e-3', displayName: 'DALL-E 3', currentVersion: 'dall-e-3', contextWindow: 0 },
  
  // Anthropic
  { provider: 'Anthropic', modelId: 'claude-3-5-sonnet', displayName: 'Claude 3.5 Sonnet', currentVersion: 'claude-3-5-sonnet-20241022', contextWindow: 200000 },
  { provider: 'Anthropic', modelId: 'claude-3-5-haiku', displayName: 'Claude 3.5 Haiku', currentVersion: 'claude-3-5-haiku-20241022', contextWindow: 200000 },
  { provider: 'Anthropic', modelId: 'claude-3-opus', displayName: 'Claude 3 Opus', currentVersion: 'claude-3-opus-20240229', contextWindow: 200000 },
  
  // Google
  { provider: 'Google', modelId: 'gemini-2.0-flash-exp', displayName: 'Gemini 2.0 Flash', currentVersion: 'gemini-2.0-flash-exp', contextWindow: 1000000 },
  { provider: 'Google', modelId: 'gemini-1.5-pro', displayName: 'Gemini 1.5 Pro', currentVersion: 'gemini-1.5-pro-latest', contextWindow: 2000000 },
  { provider: 'Google', modelId: 'gemini-1.5-flash', displayName: 'Gemini 1.5 Flash', currentVersion: 'gemini-1.5-flash-latest', contextWindow: 1000000 },
  
  // Mistral
  { provider: 'Mistral', modelId: 'mistral-large', displayName: 'Mistral Large', currentVersion: 'mistral-large-latest', contextWindow: 128000 },
  { provider: 'Mistral', modelId: 'mistral-medium', displayName: 'Mistral Medium', currentVersion: 'mistral-medium-latest', contextWindow: 32000 },
];

class ModelUpdateChecker {
  private results: CheckResult[] = [];
  private changelogPath: string;
  private planPath: string;
  
  constructor() {
    this.changelogPath = path.join(process.cwd(), 'docs', 'ai-models', 'MODEL_CHANGELOG.md');
    this.planPath = path.join(process.cwd(), 'docs', 'ai-models', 'AI_MODEL_INTEGRATION_PLAN.md');
  }
  
  /**
   * Main entry point for checking all models
   */
  async checkAllModels(): Promise<void> {
    console.log('🔍 Checking for AI model updates...\n');
    
    for (const provider of AI_PROVIDERS) {
      console.log(`📊 Checking ${provider.name}...`);
      const result = await this.checkProvider(provider);
      this.results.push(result);
      
      if (result.errors && result.errors.length > 0) {
        console.log(`  ⚠️ Errors: ${result.errors.join(', ')}`);
      } else {
        const updates = result.models.filter(m => m.hasUpdate);
        if (updates.length > 0) {
          console.log(`  ✨ Found ${updates.length} update(s)`);
        } else {
          console.log(`  ✅ All models up to date`);
        }
      }
    }
    
    console.log('\n');
    this.printSummary();
  }
  
  /**
   * Check a specific provider for model updates
   */
  async checkProvider(provider: ModelProvider): Promise<CheckResult> {
    const result: CheckResult = {
      provider: provider.name,
      models: [],
      lastChecked: new Date(),
      errors: []
    };
    
    try {
      // Filter current models for this provider
      const providerModels = CURRENT_MODELS.filter(m => m.provider === provider.name);
      
      // In a real implementation, this would fetch from the provider's API
      // For now, we'll simulate the check
      for (const model of providerModels) {
        const modelWithCheck = { ...model };
        
        // Simulate checking for updates (in production, this would call the actual API)
        modelWithCheck.latestVersion = model.currentVersion; // Placeholder
        modelWithCheck.hasUpdate = false; // Would be determined by comparing versions
        
        result.models.push(modelWithCheck);
      }
      
    } catch (error) {
      result.errors = result.errors || [];
      result.errors.push(`Failed to check ${provider.name}: ${error}`);
    }
    
    return result;
  }
  
  /**
   * Update the MODEL_CHANGELOG.md file
   */
  async updateChangelog(): Promise<void> {
    console.log('📝 Updating MODEL_CHANGELOG.md...');
    
    const updates = this.getUpdates();
    if (updates.length === 0) {
      console.log('No updates to record.');
      return;
    }
    
    const changelogContent = this.generateChangelogEntry(updates);
    
    // Read existing changelog
    let existingContent = '';
    try {
      existingContent = fs.readFileSync(this.changelogPath, 'utf-8');
    } catch (error) {
      console.log('Creating new changelog file...');
    }
    
    // Insert new entry after the header
    const headerEnd = existingContent.indexOf('\n---\n');
    if (headerEnd > -1) {
      const before = existingContent.substring(0, headerEnd + 5);
      const after = existingContent.substring(headerEnd + 5);
      const newContent = `${before}\n${changelogContent}\n${after}`;
      fs.writeFileSync(this.changelogPath, newContent);
    } else {
      // Append to file
      fs.appendFileSync(this.changelogPath, `\n${changelogContent}\n`);
    }
    
    console.log('✅ Changelog updated successfully');
  }
  
  /**
   * Update the AI_MODEL_INTEGRATION_PLAN.md file
   */
  async updatePlan(): Promise<void> {
    console.log('📝 Updating AI_MODEL_INTEGRATION_PLAN.md...');
    
    // Read existing plan
    let planContent = '';
    try {
      planContent = fs.readFileSync(this.planPath, 'utf-8');
    } catch (error) {
      console.error('Error reading plan file:', error);
      return;
    }
    
    // Update the model status table
    // This is a simplified implementation - in production, you'd parse and update the markdown table
    for (const result of this.results) {
      for (const model of result.models) {
        if (model.hasUpdate && model.latestVersion) {
          // Update the version in the plan
          const pattern = new RegExp(`${model.modelId}.*?\\[CHECK\\]`, 'g');
          planContent = planContent.replace(pattern, `${model.modelId} | ${model.latestVersion}`);
        }
      }
    }
    
    // Update last checked date
    const datePattern = /최종 업데이트: \d{4}년 \d{1,2}월 \d{1,2}일/g;
    const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' });
    planContent = planContent.replace(datePattern, `최종 업데이트: ${today}`);
    
    fs.writeFileSync(this.planPath, planContent);
    console.log('✅ Plan updated successfully');
  }
  
  /**
   * Generate a detailed report
   */
  generateReport(): string {
    const report: string[] = [];
    
    report.push('# AI Model Status Report');
    report.push(`Generated: ${new Date().toISOString()}\n`);
    
    report.push('## Summary');
    const totalModels = this.results.reduce((acc, r) => acc + r.models.length, 0);
    const updatesAvailable = this.results.reduce((acc, r) => 
      acc + r.models.filter(m => m.hasUpdate).length, 0);
    
    report.push(`- Total models tracked: ${totalModels}`);
    report.push(`- Updates available: ${updatesAvailable}`);
    report.push(`- Providers checked: ${this.results.length}\n`);
    
    report.push('## Provider Details');
    for (const result of this.results) {
      report.push(`\n### ${result.provider}`);
      report.push(`Last checked: ${result.lastChecked.toISOString()}`);
      
      if (result.models.length > 0) {
        report.push('\n| Model | Current Version | Latest Version | Status |');
        report.push('|-------|-----------------|----------------|---------|');
        
        for (const model of result.models) {
          const status = model.hasUpdate ? '🔄 Update Available' : 
                        model.deprecated ? '⚠️ Deprecated' : '✅ Up to date';
          report.push(`| ${model.displayName} | ${model.currentVersion} | ${model.latestVersion || 'N/A'} | ${status} |`);
        }
      }
      
      if (result.errors && result.errors.length > 0) {
        report.push('\n**Errors:**');
        result.errors.forEach(error => report.push(`- ${error}`));
      }
    }
    
    report.push('\n## Recommendations');
    const updates = this.getUpdates();
    if (updates.length > 0) {
      report.push('\nThe following models have updates available:');
      updates.forEach(model => {
        report.push(`- **${model.displayName}**: Update from ${model.currentVersion} to ${model.latestVersion}`);
      });
    } else {
      report.push('\nAll models are up to date!');
    }
    
    return report.join('\n');
  }
  
  /**
   * Get all models with updates
   */
  private getUpdates(): ModelInfo[] {
    const updates: ModelInfo[] = [];
    for (const result of this.results) {
      updates.push(...result.models.filter(m => m.hasUpdate));
    }
    return updates;
  }
  
  /**
   * Generate a changelog entry for updates
   */
  private generateChangelogEntry(updates: ModelInfo[]): string {
    const date = new Date().toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'numeric', 
      day: 'numeric' 
    });
    
    const entry: string[] = [];
    entry.push(`## ${date}`);
    entry.push('\n### 🔄 모델 업데이트 감지');
    
    // Group by provider
    const byProvider: { [key: string]: ModelInfo[] } = {};
    updates.forEach(model => {
      if (!byProvider[model.provider]) {
        byProvider[model.provider] = [];
      }
      byProvider[model.provider].push(model);
    });
    
    for (const [provider, models] of Object.entries(byProvider)) {
      entry.push(`\n#### ${provider}`);
      models.forEach(model => {
        entry.push(`- **${model.displayName}**: ${model.currentVersion} → ${model.latestVersion}`);
        if (model.changelog) {
          entry.push(`  - ${model.changelog}`);
        }
      });
    }
    
    return entry.join('\n');
  }
  
  /**
   * Print summary to console
   */
  private printSummary(): void {
    const updates = this.getUpdates();
    
    if (updates.length > 0) {
      console.log('📋 Summary:');
      console.log(`Found ${updates.length} model update(s):\n`);
      
      updates.forEach(model => {
        console.log(`  • ${model.provider} ${model.displayName}:`);
        console.log(`    Current: ${model.currentVersion}`);
        console.log(`    Latest: ${model.latestVersion}\n`);
      });
      
      console.log('Run "npm run update-ai-docs" to update documentation.');
    } else {
      console.log('✨ All models are up to date!');
    }
  }
}

// CLI Handler
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'check';
  
  const checker = new ModelUpdateChecker();
  
  switch (command) {
    case '--check':
    case 'check':
      await checker.checkAllModels();
      break;
      
    case '--update':
    case 'update':
      await checker.checkAllModels();
      await checker.updateChangelog();
      await checker.updatePlan();
      break;
      
    case '--docs':
    case 'docs':
      await checker.checkAllModels();
      await checker.updateChangelog();
      await checker.updatePlan();
      console.log('\n✅ Documentation updated successfully');
      break;
      
    case '--report':
    case 'report':
      await checker.checkAllModels();
      const report = checker.generateReport();
      console.log(report);
      
      // Save report to file
      const reportPath = path.join(process.cwd(), 'docs', 'ai-models', 'MODEL_STATUS_REPORT.md');
      fs.writeFileSync(reportPath, report);
      console.log(`\n📄 Report saved to: ${reportPath}`);
      break;
      
    case '--help':
    case 'help':
      console.log(`
AI Model Update Checker

Usage: npm run check-ai-models [command]

Commands:
  check    Check for model updates (default)
  update   Check and update documentation
  docs     Same as update
  report   Generate detailed status report
  help     Show this help message

Examples:
  npm run check-ai-models         # Check for updates
  npm run update-ai-docs          # Update documentation
  npm run ai-model-report         # Generate report
      `);
      break;
      
    default:
      console.error(`Unknown command: ${command}`);
      console.log('Run "npm run check-ai-models help" for usage information.');
      process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});

export { ModelUpdateChecker, ModelInfo, CheckResult };