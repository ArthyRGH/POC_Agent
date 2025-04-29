# CommercePilot AI Dashboard

A modern, responsive dashboard for the CommercePilot AI e-commerce platform.

## Overview

This project is a React-based UI implementation of the CommercePilot AI dashboard, featuring:

- Clean, modern design with a responsive layout
- Interactive components for managing e-commerce operations
- Real-time metrics display
- Navigation for key e-commerce functions

## Project Structure

```
├── App.js                # Main application component
├── App.css               # Global styles
├── index.js              # Entry point
├── index.html            # HTML template
├── components/           # UI components
│   ├── Dashboard.js      # Dashboard layout
│   ├── Dashboard.css     # Dashboard styles
│   ├── Header.js         # Top navigation bar
│   ├── Header.css        # Header styles
│   ├── Sidebar.js        # Side navigation
│   ├── Sidebar.css       # Sidebar styles
│   ├── MetricCard.js     # Metric display cards
│   └── MetricCard.css    # Metric card styles
```

## Setup and Installation

### Running without Node.js

You can run this project directly from the browser:

1. Open `index.html` in a modern web browser
2. The dashboard will load using the React and Babel CDN links

### For development with Node.js

If you have Node.js installed:

1. Install dependencies:
```
npm install react react-dom react-icons
```

2. Install development dependencies:
```
npm install -D @babel/core @babel/preset-env @babel/preset-react
```

3. Run a local development server:
```
npx serve
```

## Features

- **Dashboard Overview**: View key metrics at a glance
- **AI Agents**: Manage AI-powered commerce assistants
- **Inventory Management**: Track and manage product inventory
- **Order Processing**: View and process customer orders
- **Customer Management**: Access customer data and insights
- **Marketing Tools**: Manage marketing campaigns
- **Pricing Management**: Set and adjust product pricing

## Usage

The dashboard is designed to be intuitive with a sidebar navigation for accessing different sections. The main dashboard displays key performance metrics and recent activity.

## Credits

This UI implementation is based on the CommercePilot AI design. 