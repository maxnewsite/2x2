import { NextRequest, NextResponse } from 'next/server';
import { analyzeContent, createMockAnalysis } from '@/lib/openai';
import { storeAnalysisResult } from '@/lib/db';
import { AnalysisRequest, Domain } from '@/types';
import { generateId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();
    
    // Validate request
    if (!body.text || body.text.trim().length < 10) {
      return NextResponse.json(
        { error: 'Text content is required and must be at least 10 characters long' },
        { status: 400 }
      );
    }

    if (body.text.length > 50000) {
      return NextResponse.json(
        { error: 'Text content exceeds maximum length of 50,000 characters' },
        { status: 400 }
      );
    }

    const domain = body.domain_hint || 'auto';
    const validDomains: Domain[] = ['risk', 'priority', 'investments', 'sports', 'auto'];
    
    if (!validDomains.includes(domain)) {
      return NextResponse.json(
        { error: 'Invalid domain hint' },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is available
    const hasApiKey = !!process.env.OPENAI_API_KEY;
    
    let analysisResult;
    
    if (hasApiKey) {
      try {
        // Use real OpenAI analysis
        analysisResult = await analyzeContent(
          body.text,
          domain,
          body.force_axes
        );
      } catch (error) {
        console.error('OpenAI analysis failed, falling back to mock:', error);
        
        // Fall back to mock analysis if OpenAI fails
        analysisResult = createMockAnalysis(body.text, domain);
        
        // Add a note about using mock data
        analysisResult.insights.unshift(
          "Note: This is a demonstration analysis. Configure OpenAI API key for full AI-powered analysis."
        );
      }
    } else {
      // Use mock analysis for demo purposes
      analysisResult = createMockAnalysis(body.text, domain);
      
      // Add a note about demo mode
      analysisResult.insights.unshift(
        "Demo Mode: This is sample analysis. Configure OpenAI API key for AI-powered analysis."
      );
    }

    // Store the analysis result
    const analysisId = generateId();
    try {
      await storeAnalysisResult(
        analysisId,
        body.files || [],
        body.text,
        domain,
        analysisResult
      );
    } catch (storageError) {
      console.warn('Failed to store analysis result:', storageError);
      // Continue without failing the request
    }

    // Add metadata
    analysisResult.metadata = {
      ...analysisResult.metadata,
      analysisId,
      timestamp: new Date().toISOString(),
      domain,
      textLength: body.text.length,
      usingMockData: !hasApiKey
    };

    return NextResponse.json(analysisResult);

  } catch (error) {
    console.error('Analysis API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error during analysis',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Analysis API endpoint',
      version: '1.0.0',
      endpoints: {
        POST: '/api/analyze - Submit text for 2x2 matrix analysis',
      },
      requirements: {
        text: 'Required. 10-50,000 characters',
        domain_hint: 'Optional. One of: risk, priority, investments, sports, auto',
        force_axes: 'Optional. Custom X/Y axis labels'
      }
    },
    { status: 200 }
  );
}