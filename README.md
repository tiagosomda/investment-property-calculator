# Investment Property Calculator

A comprehensive web app for calculating returns on multi-unit rental properties. Compare different rental strategies (STR/MTR/LTR) with configurable expenses and see how they stack up against alternative investments.

## Features

- **Property Details**: Configure purchase price, financing, and property-level expenses
- **Multi-Unit Support**: Add unlimited units with different rental strategies
- **Flexible Expense System**: Pre-configured expense templates for STR, MTR, and LTR with full customization
- **Real-Time Calculations**: Instant cash flow projections, NOI, and return metrics
- **Investment Comparison**: Compare property returns against HYSA and index funds
- **Mobile-First Design**: Fully responsive interface optimized for mobile devices
- **Local Storage**: Your data is automatically saved in your browser

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- GitHub Pages (deployment)

## Running Locally

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/investment-property-calculator.git
   cd investment-property-calculator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:5173`
   - The app will automatically reload when you make changes

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
investment-property-calculator/
├── src/                    # Application source code
│   ├── components/         # React components
│   ├── contexts/          # React Context for state management
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions (calculations, templates)
├── .github/workflows/     # GitHub Actions for deployment
├── scripts/               # Build and deployment scripts
└── public/               # Static assets
```

## Usage Guide

1. **Property Details Tab**: Enter your property purchase price, financing details, and property-level expenses
2. **Units & Expenses Tab**: Add units and configure their rental strategy (STR/MTR/LTR) and expenses
3. **Summary & Compare Tab**: View cash flow projections and compare against alternative investments

## License

MIT