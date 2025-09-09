import { type ClassValue, clsx } from 'clsx';
import { Domain, DomainConfig, Quadrant } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function validateFileType(file: File): boolean {
  const allowedTypes = [
    'text/plain',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];
  return allowedTypes.includes(file.type);
}

export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}

export const DOMAIN_CONFIGS: Record<Domain, DomainConfig> = {
  risk: {
    id: 'risk',
    name: 'Risk Analysis',
    description: 'Analyze risks by impact and probability',
    commonAxes: {
      x: ['Probability', 'Likelihood', 'Frequency', 'Chance'],
      y: ['Impact', 'Severity', 'Consequence', 'Damage']
    },
    examples: [
      'Cybersecurity threats assessment',
      'Project risk evaluation',
      'Business continuity planning'
    ]
  },
  priority: {
    id: 'priority',
    name: 'Priority Matrix',
    description: 'Prioritize items by importance and urgency',
    commonAxes: {
      x: ['Urgency', 'Time Sensitivity', 'Deadline Pressure'],
      y: ['Importance', 'Value', 'Strategic Impact', 'Business Value']
    },
    examples: [
      'Project prioritization',
      'Feature backlog management',
      'Resource allocation decisions'
    ]
  },
  investments: {
    id: 'investments',
    name: 'Investment Analysis',
    description: 'Evaluate investments by risk and return',
    commonAxes: {
      x: ['Risk', 'Volatility', 'Uncertainty', 'Downside Risk'],
      y: ['Return', 'Yield', 'Growth Potential', 'Expected Return']
    },
    examples: [
      'Portfolio optimization',
      'Startup investment evaluation',
      'Market opportunity assessment'
    ]
  },
  sports: {
    id: 'sports',
    name: 'Sports Analysis',
    description: 'Analyze sports performance and strategy',
    commonAxes: {
      x: ['Skill', 'Technical Ability', 'Performance Level'],
      y: ['Potential', 'Growth Opportunity', 'Market Value']
    },
    examples: [
      'Player performance analysis',
      'Team strategy evaluation',
      'Transfer market assessment'
    ]
  },
  auto: {
    id: 'auto',
    name: 'Auto-Detect',
    description: 'Let AI automatically determine the best variables',
    commonAxes: {
      x: [],
      y: []
    },
    examples: [
      'Any document or text analysis',
      'Exploratory data analysis',
      'General purpose categorization'
    ]
  }
};

export function getQuadrantForItem(x: number, y: number, quadrants: Quadrant[]): Quadrant | null {
  for (const quadrant of quadrants) {
    if (evaluateQuadrantRule(quadrant.rule, x, y)) {
      return quadrant;
    }
  }
  return null;
}

function evaluateQuadrantRule(rule: string, x: number, y: number): boolean {
  try {
    // Simple rule evaluator for quadrant rules like "x>=50 && y>=50"
    const expression = rule.replace(/x/g, x.toString()).replace(/y/g, y.toString());
    return new Function('return ' + expression)();
  } catch {
    return false;
  }
}

export function generateDefaultQuadrants(xLabel: string, yLabel: string): Quadrant[] {
  const xLow = `Low ${xLabel}`;
  const xHigh = `High ${xLabel}`;
  const yLow = `Low ${yLabel}`;
  const yHigh = `High ${yLabel}`;

  return [
    {
      id: 'Q1',
      name: `${xHigh} / ${yHigh}`,
      description: `Items with high ${xLabel.toLowerCase()} and high ${yLabel.toLowerCase()}`,
      implication: 'High priority items requiring immediate attention',
      rule: 'x >= 50 && y >= 50',
      color: '#ef4444' // red-500
    },
    {
      id: 'Q2',
      name: `${xLow} / ${yHigh}`,
      description: `Items with low ${xLabel.toLowerCase()} and high ${yLabel.toLowerCase()}`,
      implication: 'Important but not urgent items',
      rule: 'x < 50 && y >= 50',
      color: '#f97316' // orange-500
    },
    {
      id: 'Q3',
      name: `${xLow} / ${yLow}`,
      description: `Items with low ${xLabel.toLowerCase()} and low ${yLabel.toLowerCase()}`,
      implication: 'Low priority items that can be deprioritized',
      rule: 'x < 50 && y < 50',
      color: '#22c55e' // green-500
    },
    {
      id: 'Q4',
      name: `${xHigh} / ${yLow}`,
      description: `Items with high ${xLabel.toLowerCase()} and low ${yLabel.toLowerCase()}`,
      implication: 'Items that may need attention but are not critical',
      rule: 'x >= 50 && y < 50',
      color: '#3b82f6' // blue-500
    }
  ];
}

export function downloadAsJSON(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  downloadBlob(blob, `${filename}.json`);
}

export function downloadAsCSV(data: any[], filename: string) {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => 
        JSON.stringify(row[header] || '')
      ).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  downloadBlob(blob, `${filename}.csv`);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}