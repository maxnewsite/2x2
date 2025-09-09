import OpenAI from 'openai';
import { AnalysisResult, AnalysisItem, Domain, Quadrant } from '@/types';
import { generateDefaultQuadrants } from './utils';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

interface OpenAIAnalysisResponse {
  axes: {
    x: string;
    y: string;
    rationale: string;
  };
  items: Array<{
    name: string;
    x: number;
    y: number;
    confidence: number;
    rationale: string;
    citations: string[];
  }>;
  insights: string[];
}

export async function analyzeContent(
  text: string,
  domain: Domain = 'auto',
  forceAxes?: { x?: string; y?: string }
): Promise<AnalysisResult> {
  const startTime = Date.now();

  try {
    // Create the analysis prompt
    const prompt = createAnalysisPrompt(text, domain, forceAxes);
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert analyst who creates 2x2 matrices from complex information. 
          You excel at identifying the most informative variable pairs and positioning items accurately.
          Always respond with valid JSON matching the requested structure.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const analysisData: OpenAIAnalysisResponse = JSON.parse(response);
    
    // Generate quadrants based on the axes
    const quadrants = generateDefaultQuadrants(
      analysisData.axes.x,
      analysisData.axes.y
    );

    // Calculate processing time
    const processingTime = (Date.now() - startTime) / 1000;

    // Calculate overall confidence (average of item confidences)
    const overallConfidence = analysisData.items.length > 0 
      ? analysisData.items.reduce((sum, item) => sum + item.confidence, 0) / analysisData.items.length
      : 0;

    return {
      axes: analysisData.axes,
      items: analysisData.items,
      quadrants,
      insights: analysisData.insights,
      metadata: {
        processing_time: processingTime,
        confidence: overallConfidence,
      }
    };

  } catch (error) {
    console.error('OpenAI analysis error:', error);
    throw new Error('Failed to analyze content. Please try again.');
  }
}

function createAnalysisPrompt(
  text: string,
  domain: Domain,
  forceAxes?: { x?: string; y?: string }
): string {
  const domainInstructions = getDomainInstructions(domain);
  const axesInstruction = forceAxes?.x && forceAxes?.y 
    ? `You MUST use "${forceAxes.x}" as the X-axis and "${forceAxes.y}" as the Y-axis.`
    : 'Automatically identify the two most informative and separating variables for the X and Y axes.';

  return `
Analyze the following content and create a 2x2 matrix analysis:

${domainInstructions}

${axesInstruction}

Content to analyze:
"""
${text}
"""

Requirements:
1. Identify all distinct entities/items mentioned in the content
2. Select the two most informative variables for X and Y axes (0-100 scale)
3. Position each item on the matrix with confidence scores
4. Provide rationale for positioning decisions
5. Include relevant text citations
6. Generate 3-5 actionable insights

Return your analysis as JSON in this exact format:
{
  "axes": {
    "x": "X-axis variable name",
    "y": "Y-axis variable name", 
    "rationale": "Why these variables were chosen and how they separate the items"
  },
  "items": [
    {
      "name": "Item name",
      "x": 75,
      "y": 60,
      "confidence": 0.85,
      "rationale": "Why this item is positioned here",
      "citations": ["Relevant quotes from the text"]
    }
  ],
  "insights": [
    "Actionable insight 1",
    "Actionable insight 2",
    "Actionable insight 3"
  ]
}

Important:
- X and Y values must be between 0-100
- Confidence must be between 0-1
- Include at least 3 items if possible
- Citations should be direct quotes from the text
- Insights should be specific and actionable
- Ensure JSON is valid and parseable
`;
}

function getDomainInstructions(domain: Domain): string {
  const instructions = {
    risk: `
Domain: Risk Analysis
Focus on identifying risks and threats mentioned in the content.
Common X-axis variables: Probability, Likelihood, Frequency
Common Y-axis variables: Impact, Severity, Consequence, Damage
Look for: threats, vulnerabilities, potential issues, failure modes
`,
    priority: `
Domain: Priority/Project Management  
Focus on tasks, projects, or initiatives mentioned in the content.
Common X-axis variables: Urgency, Time Sensitivity, Deadline Pressure
Common Y-axis variables: Importance, Value, Strategic Impact, Business Value
Look for: projects, tasks, initiatives, goals, objectives
`,
    investments: `
Domain: Investment Analysis
Focus on investment opportunities, assets, or financial instruments.
Common X-axis variables: Risk, Volatility, Uncertainty, Downside Risk  
Common Y-axis variables: Return, Yield, Growth Potential, Expected Return
Look for: investments, stocks, assets, opportunities, financial instruments
`,
    sports: `
Domain: Sports Analysis
Focus on players, teams, or sports-related entities.
Common X-axis variables: Current Performance, Skill Level, Experience
Common Y-axis variables: Potential, Growth Opportunity, Future Value
Look for: players, teams, strategies, performance metrics
`,
    auto: `
Domain: Auto-Detection
Analyze the content to determine the most appropriate domain and variables.
Consider what type of entities are being discussed and what dimensions would be most useful for analysis.
Choose variables that create clear separation and meaningful insights.
`
  };

  return instructions[domain];
}

// Helper function for testing API connectivity
export async function testOpenAIConnection(): Promise<boolean> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello, this is a test.' }],
      max_tokens: 10,
    });
    
    return completion.choices.length > 0;
  } catch (error) {
    console.error('OpenAI connection test failed:', error);
    return false;
  }
}

// Mock analysis for development/testing when API key is not available
export function createMockAnalysis(text: string, domain: Domain): AnalysisResult {
  const mockItems: AnalysisItem[] = [
    {
      name: 'Item A',
      x: 75,
      y: 85,
      confidence: 0.9,
      rationale: 'High on both dimensions based on content analysis',
      citations: ['Sample citation from text...']
    },
    {
      name: 'Item B', 
      x: 25,
      y: 65,
      confidence: 0.8,
      rationale: 'Low X but moderate Y based on characteristics',
      citations: ['Another sample citation...']
    },
    {
      name: 'Item C',
      x: 60,
      y: 30,
      confidence: 0.7,
      rationale: 'Moderate X but low Y value',
      citations: ['Third citation example...']
    }
  ];

  const axes = {
    x: domain === 'risk' ? 'Probability' : 'Importance',
    y: domain === 'risk' ? 'Impact' : 'Urgency', 
    rationale: 'These variables provide the best separation of items in the content'
  };

  return {
    axes,
    items: mockItems,
    quadrants: generateDefaultQuadrants(axes.x, axes.y),
    insights: [
      'Most items cluster in the high-impact region',
      'There is a clear separation between high and low probability items',
      'Focus attention on the high-probability, high-impact quadrant first'
    ],
    metadata: {
      processing_time: 2.5,
      confidence: 0.8
    }
  };
}