# Excel File Processor

A Next.js application for uploading Excel files with EPC number generation and processing through a backend API.

## Features

- **📁 Drag & Drop Upload**: Intuitive file upload with drag-and-drop support
- **🔢 EPC Number Input**: Starting EPC number input with validation
- **✅ File Validation**: Validates Excel file formats (.xlsx, .xls) and size limits
- **⚡ Real-time Processing**: Shows loading states during file processing
- **📥 Automatic Download**: Downloads processed files automatically after completion
- **🚫 Error Handling**: Comprehensive error messages for file and processing issues
- **📱 Responsive Design**: Works on desktop and mobile devices
- **🔄 Mock/Real API Toggle**: Environment variable to switch between mock and real API

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Material-UI (MUI)** - UI component library
- **React 18** - Frontend library with hooks

## Project Structure

```
app/
├── epcgen/
│   └── page.tsx           # Main Excel processor page
├── layout.tsx             # Root layout
└── page.tsx              # Home page

components/
├── EPCInput.tsx          # EPC number input component
└── FileUpload.tsx        # File upload component with drag-and-drop

utils/
├── apiClient.ts          # API service for backend communication
└── FileValidation.tsx    # File validation utilities
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, or pnpm

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Create environment configuration:

```bash
cp .env.local.example .env.local
```

3. Configure environment variables in `.env.local`:

```bash
# Set to 'true' for development with mock API, 'false' for production
NEXT_PUBLIC_USE_MOCK_API=true

# Your backend API base URL (for production)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## Backend API Integration

### API Endpoint Requirements

Your backend should provide a POST endpoint at `/api/process-excel` that:

1. **Accepts FormData with:**

   - `file`: Excel file (.xlsx or .xls)
   - `startNumber`: Starting EPC number (string)

2. **Returns:**
   - Success: Processed Excel file as binary data
   - Error: JSON with error message

### Example Backend Implementation

```javascript
// Express.js example
app.post("/api/process-excel", upload.single("file"), async (req, res) => {
  try {
    const { file } = req;
    const { startNumber } = req.body;

    // Validate inputs
    if (!file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    if (!startNumber) {
      return res.status(400).json({
        error: "Start number is required",
      });
    }

    // Process the Excel file
    const processedFile = await processExcelFile(file, parseInt(startNumber));

    // Return processed file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="processed_${file.originalname}"`
    );
    res.send(processedFile);
  } catch (error) {
    console.error("Processing error:", error);
    res.status(500).json({
      error: "Processing failed: " + error.message,
    });
  }
});
```

### Error Handling

The frontend handles various error scenarios:

- **400**: Invalid file format or missing data
- **413**: File too large (>10MB)
- **422**: Invalid file content/structure
- **500**: Server processing errors
- **Network errors**: Connection issues

## Usage

1. **Navigate to the processor**: Go to `/epcgen` route
2. **Upload Excel file**: Drag & drop or click to select
3. **Enter start number**: Input the starting EPC number
4. **Process**: Click "Process File" button
5. **Download**: File automatically downloads when ready

### File Requirements

- **Format**: Excel files (.xlsx or .xls)
- **Size**: Maximum 10MB
- **Content**: Should contain UPC codes and product data
- **Structure**: Compatible with your backend processing logic

## Development vs Production

### Development Mode

- Set `NEXT_PUBLIC_USE_MOCK_API=true`
- Uses mock API with simulated processing
- No backend required for testing

### Production Mode

- Set `NEXT_PUBLIC_USE_MOCK_API=false`
- Connects to your real backend API
- Configure `NEXT_PUBLIC_API_BASE_URL`

## Building for Production

```bash
npm run build
npm start
```

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**: Check if all dependencies are installed
2. **API connection errors**: Verify backend is running and CORS is configured
3. **File upload fails**: Check file size and format requirements
4. **Build errors**: Ensure all TypeScript types are properly defined
