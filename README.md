
# ATS Resume Builder

A professional resume builder with ATS optimization features.

## Features

- 🎯 **5 Professional Templates** - Industry-specific designs
- ✨ **ATS Optimization Check** - Real-time keyword and format analysis
- 📄 **PDF Export** - Clean, stable exports
- 📱 **Responsive Design** - Mobile-friendly interface
- 🚀 **Fast Loading** - Next.js powered

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
resume-builder/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Homepage
│   │   ├── templates/        # Template selection
│   │   └── editor/[templateId]/ # Resume editor
│   ├── components/           # Shared components
│   ├── lib/
│   │   ├── constants.ts      # Templates and data
│   │   └── utils.ts          # Utility functions
│   └── types/
│       └── index.ts          # TypeScript types
└── public/
```

## Build for Production

```bash
npm run build
npm start
```

## License

MIT
