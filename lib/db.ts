// Simple in-memory store for this demo
// In production, you would use a real database like PostgreSQL

interface StoredFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  createdAt: Date;
}

interface StoredAnalysis {
  id: string;
  fileIds: string[];
  text?: string;
  domain: string;
  result: any;
  createdAt: Date;
}

class InMemoryDB {
  private files: Map<string, StoredFile> = new Map();
  private analyses: Map<string, StoredAnalysis> = new Map();

  // File operations
  async storeFile(file: StoredFile): Promise<string> {
    this.files.set(file.id, file);
    return file.id;
  }

  async getFile(id: string): Promise<StoredFile | null> {
    return this.files.get(id) || null;
  }

  async deleteFile(id: string): Promise<boolean> {
    return this.files.delete(id);
  }

  async listFiles(): Promise<StoredFile[]> {
    return Array.from(this.files.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  // Analysis operations
  async storeAnalysis(analysis: StoredAnalysis): Promise<string> {
    this.analyses.set(analysis.id, analysis);
    return analysis.id;
  }

  async getAnalysis(id: string): Promise<StoredAnalysis | null> {
    return this.analyses.get(id) || null;
  }

  async listAnalyses(limit: number = 10): Promise<StoredAnalysis[]> {
    return Array.from(this.analyses.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Cleanup old data
  async cleanup(olderThanDays: number = 7): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    // Clean old files
    for (const [id, file] of this.files.entries()) {
      if (file.createdAt < cutoffDate) {
        this.files.delete(id);
      }
    }

    // Clean old analyses
    for (const [id, analysis] of this.analyses.entries()) {
      if (analysis.createdAt < cutoffDate) {
        this.analyses.delete(id);
      }
    }
  }

  // Stats
  getStats() {
    return {
      totalFiles: this.files.size,
      totalAnalyses: this.analyses.size,
      lastCleanup: new Date().toISOString()
    };
  }
}

// Singleton instance
const db = new InMemoryDB();

export default db;

// Helper functions
export async function storeUploadedFile(
  id: string,
  name: string,
  type: string,
  size: number,
  content: string
): Promise<string> {
  const file: StoredFile = {
    id,
    name,
    type,
    size,
    content,
    createdAt: new Date()
  };
  
  return await db.storeFile(file);
}

export async function getStoredFile(id: string): Promise<StoredFile | null> {
  return await db.getFile(id);
}

export async function storeAnalysisResult(
  id: string,
  fileIds: string[],
  text: string | undefined,
  domain: string,
  result: any
): Promise<string> {
  const analysis: StoredAnalysis = {
    id,
    fileIds,
    text,
    domain,
    result,
    createdAt: new Date()
  };
  
  return await db.storeAnalysis(analysis);
}

export async function getStoredAnalysis(id: string): Promise<StoredAnalysis | null> {
  return await db.getAnalysis(id);
}

// Initialize cleanup interval (run every hour)
if (typeof window === 'undefined') { // Only run on server
  setInterval(() => {
    db.cleanup().catch(console.error);
  }, 60 * 60 * 1000);
}