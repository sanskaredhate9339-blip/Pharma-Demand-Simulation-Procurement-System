# Pharma Demand Simulation & Procurement Engine

A modern pharmaceutical procurement decision support system built with React, Vite, and a custom design system. This application models batch safety stocks, evaluates Economic Order Quantities (EOQ), and simulates pharmaceutical replenishment metrics using historical ledger data.

## Features

- **FEFO Batch Expiration Simulation**: Models First-Expire-First-Out inventory management with configurable expiry horizons
- **Demand Forecasting**: Uses weighted moving averages to predict next-month demand based on historical sales
- **EOQ Optimization**: Calculates Economic Order Quantities to minimize holding costs while maintaining optimal stock levels
- **Expiry Risk Analysis**: Identifies near-expiry inventory with configurable risk thresholds (default: 120 days)
- **Interactive Dashboard**: Real-time KPI cards, data visualizations, and tabbed data tables
- **Data Preview**: Preview and edit CSV data before loading into the simulation
- **Seeded Database**: Pre-loaded with 8 clinical formulations (Sep-Dec 2020) for immediate testing
- **Simulation Date Control**: Adjust the simulation date to see how expiry metrics change over time

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage

1. **Load Data**: Either upload a CSV file or click "Load Seeded Database" to use the pre-loaded sample data
2. **Preview & Edit**: Review the loaded data in the preview table and edit cells if needed
3. **Continue to Dashboard**: Click "Continue to Dashboard" to run the simulation
4. **Explore**: Navigate through the different tabs to view:
   - Procurement restocks
   - Overstock holdings
   - Expiry risk items
   - Profitability metrics
   - EOQ model results
   - Master ledger

### CSV Format

Upload CSV files with the following columns:
- `Product Name` - Name of the pharmaceutical product
- `Quantity` - Sales quantity for the period
- `Month` - Month name (e.g., "September", "October")
- `Year` - Year (e.g., 2020)

Example:
```csv
Product Name,Quantity,Month,Year
Amoxicillin 500mg,1200,September,2020
Amoxicillin 500mg,1350,October,2020
```

## Simulation Parameters

- **Expiry Horizon**: 120 days (configurable)
- **Safety Buffer**: 20% of predicted demand
- **Simulation Date**: Adjustable via date picker in header
- **Ordering Cost**: ₹50 per order
- **Holding Cost**: 20% of purchase cost annually

## Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Lucide React** - Icon library
- **PapaParse** - CSV parsing
- **Custom Design System** - Hallmark-based design system with cream white theme

## Design System

The application uses a custom design system defined in `design.md` with:
- **Typography**: Outfit (display), Inter (body), JetBrains Mono (mono)
- **Theme**: Cream white background with mint accent
- **Color Palette**: High contrast, APCA conformant
- **Type Scale**: Locked token system for consistency

## License

© 2026 Aegis Flow. All rights reserved.
