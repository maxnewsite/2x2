# Il Mondo in Due Dimensioni

Transform complex information into clear 2x2 matrices with AI-powered analysis.

## Overview

Il Mondo in Due Dimensioni is an intelligent web application that automatically analyzes text and documents to create meaningful 2x2 matrix visualizations. Using AI, it identifies the most informative variable pairs and positions items in quadrants for strategic decision-making.

## Features

### 🤖 AI-Powered Analysis
- Automatic variable selection and entity identification
- Multiple domain support (Risk, Priority, Investment, Sports, Auto-detect)
- Intelligent positioning with confidence scoring

### 📊 Interactive Visualization
- Interactive 2x2 matrices with Plotly.js
- Color-coded quadrants with strategic implications
- Hover details and zoom functionality

### 📁 Multiple Input Methods
- Direct text input (up to 50,000 characters)
- File upload support (PDF, DOCX, DOC, TXT)
- Drag-and-drop interface

### 📈 Comprehensive Analysis
- Detailed insights and recommendations
- Data table with sorting and filtering
- Confidence scores and rationales
- Source citations from original text

### 📤 Export Options
- PNG/SVG image export
- CSV data export
- JSON analysis export
- Shareable visualizations

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key (optional - demo mode available)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd il-mondo-in-due-dimensioni
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Without OpenAI API Key

The application works in demo mode without an API key, using sample analysis data. Configure the API key for full AI-powered analysis.

## Usage

### Basic Workflow

1. **Input Content**: 
   - Paste text directly or upload documents (PDF, DOCX, DOC, TXT)
   - Combine multiple sources for comprehensive analysis

2. **Configure Analysis**:
   - Select analysis domain (Risk, Priority, Investment, Sports, or Auto-detect)
   - Optionally force specific X/Y axis variables
   - Adjust advanced settings

3. **Generate Matrix**:
   - Click "Create Matrix" to start AI analysis
   - View real-time processing status
   - Explore interactive results

4. **Analyze Results**:
   - Interactive 2x2 matrix with positioning rationales
   - Detailed insights and strategic recommendations
   - Data table with sorting and filtering
   - Export options for sharing

### Domain Types

- **Risk Analysis**: Probability vs Impact matrices for threat assessment
- **Priority Matrix**: Urgency vs Importance for task prioritization  
- **Investment Analysis**: Risk vs Return for portfolio decisions
- **Sports Analysis**: Performance vs Potential for player evaluation
- **Auto-Detect**: Let AI determine the best variables

### File Support

- **PDF**: Full text extraction including scanned documents
- **DOCX/DOC**: Microsoft Word document processing
- **TXT**: Plain text files
- **Size limit**: 10MB per file
- **Character limit**: 50,000 total characters

## API Documentation

### POST /api/analyze

Analyze text content and generate 2x2 matrix.

**Request Body:**
```json
{
  "text": "Content to analyze...",
  "domain_hint": "risk|priority|investments|sports|auto",
  "force_axes": {
    "x": "Custom X axis",
    "y": "Custom Y axis"
  }
}
```

**Response:**
```json
{
  "axes": {
    "x": "Risk Level",
    "y": "Impact Severity", 
    "rationale": "These variables provide the best separation..."
  },
  "items": [
    {
      "name": "Item Name",
      "x": 75,
      "y": 60,
      "confidence": 0.85,
      "rationale": "Positioning explanation...",
      "citations": ["Relevant text quotes..."]
    }
  ],
  "quadrants": [...],
  "insights": [...],
  "metadata": {
    "processing_time": 5.2,
    "confidence": 0.78
  }
}
```

### GET /api/health

System health check and service status.

## Technical Architecture

### Frontend Stack
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Plotly.js**: Interactive visualizations
- **Zustand**: State management
- **React Dropzone**: File upload handling

### Backend Services
- **Next.js API Routes**: Serverless backend
- **OpenAI GPT-4**: AI-powered analysis
- **PDF.js**: PDF text extraction
- **In-memory Database**: Session storage

### Key Components

```
app/
├── page.tsx              # Main application interface
├── layout.tsx            # App layout and metadata
├── globals.css           # Global styles
└── api/
    ├── analyze/route.ts  # Analysis API endpoint
    └── health/route.ts   # Health check endpoint

components/
├── AnalysisResults.tsx   # Main results display
├── QuadrantLegend.tsx    # Interactive quadrant legend
├── DataTable.tsx         # Sortable data table
└── InsightsPanel.tsx     # AI insights and recommendations

lib/
├── store.ts              # Zustand state management
├── openai.ts             # OpenAI integration
├── fileProcessor.ts      # Document processing
├── utils.ts              # Utility functions
└── db.ts                 # Database operations

types/
└── index.ts              # TypeScript type definitions
```

## Development

### Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint checks
npm run type-check   # TypeScript validation
```

### Environment Variables

```bash
OPENAI_API_KEY=          # OpenAI API key for AI analysis
NODE_ENV=                # Environment (development/production)
```

### Adding New Domains

1. Update `Domain` type in `types/index.ts`
2. Add domain configuration in `lib/utils.ts`
3. Update OpenAI prompt instructions in `lib/openai.ts`

### Customizing Analysis

The AI analysis can be customized by modifying prompts in `lib/openai.ts`. Each domain has specific instructions for variable selection and entity identification.

## Performance Considerations

- **File Processing**: Large documents processed asynchronously
- **Memory Management**: In-memory database with automatic cleanup
- **API Rate Limits**: OpenAI requests are batched and cached
- **Client-side Caching**: Analysis results cached in browser storage

## Security

- **Input Validation**: All user inputs validated and sanitized
- **File Type Restrictions**: Only safe document types allowed
- **Size Limits**: File size and character limits enforced
- **API Key Protection**: Environment variables for sensitive data

## Troubleshooting

### Common Issues

1. **Analysis fails**: Check OpenAI API key configuration
2. **File upload errors**: Verify file type and size limits
3. **Slow processing**: Large documents take more time to process
4. **Visualization not loading**: Ensure JavaScript is enabled

### Error Messages

- `"Text content is required"`: Add text input or upload files
- `"File type not supported"`: Use PDF, DOCX, DOC, or TXT files  
- `"File size exceeds maximum"`: Reduce file size under 10MB
- `"Analysis failed"`: Check API key or try with different content

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation

---

**Il Mondo in Due Dimensioni** - Transforming complexity into clarity, one matrix at a time.