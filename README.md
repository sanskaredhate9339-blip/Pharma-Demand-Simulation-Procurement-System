# Pharma Demand Simulation & Procurement Engine

A modern pharmaceutical procurement decision support system built with React, Vite, and a custom design system. This application models batch safety stocks, evaluates Economic Order Quantities (EOQ), and simulates pharmaceutical replenishment metrics using historical ledger data.

## Features

### 🎯 Core Simulation Engine

- **FEFO Batch Expiration Simulation**: Models First-Expire-First-Out inventory management with configurable expiry horizons (default: 120 days). Automatically identifies risky stock near expiration and calculates optimal reorder points.
  
- **Demand Forecasting**: Uses weighted moving averages (0.2, 0.3, 0.5 weights) to predict next-month demand based on the last 3 months of historical sales data. Falls back to simple average when insufficient data is available.

- **EOQ Optimization**: Implements the Economic Order Quantity formula `√(2DS/H)` to calculate optimal order sizes that minimize total inventory costs while maintaining service levels. Includes annual cost savings calculations.

- **Expiry Risk Analysis**: Real-time identification of near-expiry inventory with configurable risk thresholds. Provides actionable insights on which products require immediate attention to prevent stock write-offs.

### 📊 Interactive Dashboard

- **Real-time KPI Cards**: Four key metrics displayed with progress bars and contextual descriptions:
  - Procurement Restocks (items requiring replenishment)
  - Overstock Holdings (excessive inventory items)
  - Short-Dated Expirations (expiry risk items)
  - Active Database Items (total catalog size)

- **Data Visualizations**: Interactive charts showing:
  - Stock Health Distribution (donut chart)
  - Demand vs Stock comparison
  - Product-specific performance metrics

- **Tabbed Data Tables**: Six specialized views with sorting, filtering, and pagination:
  - **Procurement**: Restock recommendations with EOQ and order intervals
  - **Overstock**: Items with excessive inventory levels
  - **Expiry Risk**: Products with near-expiry batches
  - **Profitability**: Revenue, profit, and margin analysis
  - **EOQ Model**: Detailed EOQ calculations and savings
  - **Master Ledger**: Complete inventory overview

### 🔄 Data Management

- **CSV Upload**: Drag-and-drop or browse to upload historical sales data with automatic validation
- **Data Preview**: Review loaded data in a scrollable table before committing to simulation
- **Inline Editing**: Click any cell in the preview table to edit values directly (Product Name, Quantity, Month, Year)
- **Seeded Database**: Pre-loaded with 8 clinical formulations (Amoxicillin, Lipitor, Metformin, etc.) covering Sep-Dec 2020 for immediate testing
- **Simulation Date Control**: Adjustable date picker to simulate different time periods and see how expiry metrics change dynamically

### ⚙️ Configuration

- **Expiry Horizon**: 120 days threshold for near-expiry classification
- **Safety Buffer**: 20% of predicted demand for safety stock calculation
- **Ordering Cost**: ₹50 per order (configurable in simulation)
- **Holding Cost**: 20% of purchase cost annually
- **Lead Time**: 5-14 days (randomized per product)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/sanskaredhate9339-blip/Pharma-Demand-Simulation-Procurement-System.git
cd Pharma-Demand-Simulation-Procurement-System

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Usage Guide

1. **Launch Application**: Open `http://localhost:5173` in your browser after running `npm run dev`

2. **Load Your Data**:
   - **Option A**: Upload a CSV file with historical sales data
   - **Option B**: Click "Load Seeded Database" to use the pre-loaded sample data

3. **Preview & Edit**:
   - Review the loaded data in the preview table
   - Click any cell to edit values inline
   - Verify row count, unique products, and date range
   - Click "Cancel" to discard or "Continue to Dashboard" to proceed

4. **Explore the Dashboard**:
   - View KPI cards for high-level metrics
   - Check stock health distribution charts
   - Navigate through tabs to analyze different aspects
   - Use search and sort to find specific products
   - Adjust the Simulation Date to see dynamic changes

5. **Export Results**: Use browser print functionality to save reports

### CSV Format Specification

Upload CSV files with the following required columns:

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| Product Name | String | Name of the pharmaceutical product | "Amoxicillin 500mg" |
| Quantity | Number | Sales quantity for the period | 1200 |
| Month | String | Full month name (case-insensitive) | "September" |
| Year | Number | Four-digit year | 2020 |

**Example CSV:**
```csv
Product Name,Quantity,Month,Year
Amoxicillin 500mg,1200,September,2020
Amoxicillin 500mg,1350,October,2020
Amoxicillin 500mg,1400,November,2020
Amoxicillin 500mg,1550,December,2020
Lipitor 20mg,800,September,2020
Lipitor 20mg,750,October,2020
```

**Validation Rules:**
- All four columns must be present
- Quantity must be non-negative
- Month must be a valid month name
- Year must be a valid four-digit number
- Invalid rows are automatically skipped

## Technology Stack

### Frontend Framework
- **React 18.3** - UI library with hooks and concurrent features
- **Vite 5.x** - Next-generation build tool with instant HMR
- **JavaScript (ES6+)** - Modern JavaScript with async/await, modules

### UI Components & Styling
- **Lucide React** - Lightweight icon library (300+ icons)
- **Custom Design System** - Hallmark-based design system with:
  - **Outfit** - Display font for headings and large text
  - **Inter** - Body font for readable content
  - **JetBrains Mono** - Monospace font for code and data
- **CSS Custom Properties** - Token-based design tokens for consistency
- **Tailwind-like Utility Classes** - For rapid UI development

### Data Processing
- **PapaParse** - Robust CSV parsing with error handling
- **Seeded RNG** - Deterministic random number generator for reproducible results
- **Memoization** - React useMemo for performance optimization

### Build & Development
- **ESLint** - Code linting with React rules
- **PostCSS** - CSS processing and optimization
- **Vite Plugins** - React plugin with SWC for fast builds

## Design System

The application uses a custom design system defined in `design.md`:

### Typography
- **Display Font**: Outfit (modern, geometric sans-serif)
- **Body Font**: Inter (clean, readable sans-serif)
- **Mono Font**: JetBrains Mono (for code and tabular data)
- **Type Scale**: Locked token system (--text-xs to --text-3xl)

### Color Palette
- **Background**: Cream white (oklch(98% 0.01 85))
- **Accent**: Mint green (oklch(65% 0.15 145))
- **Ink**: Dark gray for primary text
- **Rule**: Subtle borders and dividers
- **Contrast**: APCA conformant for accessibility

### Spacing & Layout
- **Grid-based layouts** for data tables and cards
- **Responsive breakpoints** for mobile, tablet, and desktop
- **Consistent padding/margins** using design tokens

### Microinteractions
- **Hover states** on all interactive elements
- **Focus indicators** for keyboard navigation
- **Smooth transitions** for state changes
- **Loading states** for async operations

## Architecture

### Component Structure
```
src/
├── components/
│   ├── FileUploader.jsx      # CSV upload with preview & editing
│   ├── KPICards.jsx          # KPI metric cards
│   ├── AnalyticsCharts.jsx   # Data visualizations
│   ├── DashboardTabs.jsx     # Tabbed data tables
│   └── SimulationDatePicker.jsx # Date picker control
├── utils/
│   └── simulation.js         # Core simulation engine
├── App.jsx                   # Main application component
└── index.css                 # Global styles and design tokens
```

### Data Flow
1. User uploads CSV or loads seeded data
2. Data is validated and previewed
3. User confirms and simulation runs
4. Simulation data is computed with current Sim Date
5. Components receive simulation data via props
6. KPI cards, charts, and tables render metrics
7. Sim Date changes trigger re-simulation

### State Management
- **App.jsx**: Holds raw data, simulation data, and Sim Date
- **useMemo**: Re-computes simulation when data or date changes
- **Local Component State**: UI state (tabs, search, sort, pagination)

## Performance Optimizations

- **Memoization**: Expensive calculations cached with useMemo
- **Virtual Scrolling**: Large tables use pagination for performance
- **Lazy Loading**: Components load on-demand
- **Optimized Re-renders**: Proper dependency arrays in hooks
- **Efficient CSV Parsing**: PapaParse with streaming for large files

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

© 2026 Aegis Flow. All rights reserved.

## Contributing

This is a proprietary project. For inquiries, contact the development team.
