import { NextResponse } from 'next/server';
import { testOpenAIConnection } from '@/lib/openai';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Basic health check
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      responseTime: 0,
      services: {
        database: 'operational', // In-memory DB is always available
        openai: 'unknown',
        fileProcessing: 'operational'
      }
    };

    // Test OpenAI connection if API key is available
    if (process.env.OPENAI_API_KEY) {
      try {
        const openaiHealthy = await testOpenAIConnection();
        health.services.openai = openaiHealthy ? 'operational' : 'degraded';
      } catch {
        health.services.openai = 'unavailable';
      }
    } else {
      health.services.openai = 'not_configured';
    }

    // Calculate response time
    health.responseTime = Date.now() - startTime;

    // Determine overall status
    const services = Object.values(health.services);
    if (services.includes('unavailable')) {
      health.status = 'degraded';
    } else if (services.includes('not_configured')) {
      health.status = 'partial'; // Some features not available
    }

    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'partial' ? 200 :
                      health.status === 'degraded' ? 503 : 500;

    return NextResponse.json(health, { status: statusCode });

  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime
      },
      { status: 500 }
    );
  }
}