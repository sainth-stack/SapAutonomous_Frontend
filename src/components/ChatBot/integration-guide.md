# ChatBot Integration Guide

## Quick Start

1. **Import the component:**
```jsx
import ChatBot from '../../components/ChatBot';
```

2. **Use with minimal configuration:**
```jsx
const MyPage = () => {
  return <ChatBot />;
};
```

That's it! You now have a fully functional chatbot with professional styling.

## Current Implementation

The `self-monitoring` page has been completely refactored to use this component:

**Before (256 lines):**
```jsx
// Complex state management, API calls, UI rendering
const SelfMonitoring = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([...]);
  // ... 250+ lines of chatbot logic
};
```

**After (22 lines):**
```jsx
const SelfMonitoring = () => {
  return (
    <ChatBot
      title="Self Monitoring"
      subtitle="Monitor your SLA performance and get automated insights"
      placeholder="Ask about SLA monitoring..."
      endpoint="/Explore_sla/"
      initialMessage="Hello! I'm your Self-Monitoring assistant..."
      showFileInfo={true}
      showRecentChats={true}
      showSessionInfo={true}
    />
  );
};
```

## Adding to New Pages

### Step 1: Create a new page component
```jsx
// src/pages/data-analysis/index.js
import React from 'react';
import ChatBot from '../../components/ChatBot';

const DataAnalysis = () => {
  return (
    <ChatBot
      title="Data Analysis"
      subtitle="AI-powered data insights"
      endpoint="/api/analyze/"
      placeholder="Ask about your data..."
    />
  );
};

export default DataAnalysis;
```

### Step 2: Add to your routing
```jsx
// App.js or your router file
import DataAnalysis from './pages/data-analysis';

// In your routes
<Route path="/data-analysis" component={DataAnalysis} />
```

### Step 3: Create the backend endpoint
```python
# In your FastAPI backend
@app.post("/api/analyze/")
async def analyze_data(query: str):
    # Your analysis logic
    return {
        "type": "text",  # or "table", "plotly"
        "payload": "Analysis results...",
        "explanation": "Data analysis complete"
    }
```

## Customization Examples

### Different Layouts
```jsx
// Full width for dashboards
<ChatBot maxWidth="100%" className="dashboard-chat" />

// Compact for sidebars
<ChatBot 
  maxWidth="400px" 
  showRecentChats={false}
  className="sidebar-chat" 
/>

// Mobile-optimized
<ChatBot 
  showFileInfo={false}
  showSessionInfo={false}
  className="mobile-chat"
/>
```

### Different Use Cases
```jsx
// Customer Support
<ChatBot
  title="Support Assistant"
  subtitle="How can we help you?"
  endpoint="/api/support/"
  showFileInfo={false}
/>

// Document Q&A
<ChatBot
  title="Document Assistant"
  subtitle="Ask questions about your documents"
  endpoint="/api/document-qa/"
  showFileInfo={true}
/>

// Code Helper
<ChatBot
  title="Code Assistant"
  subtitle="Get coding help and reviews"
  endpoint="/api/code-help/"
  placeholder="Paste your code or ask a question..."
/>
```

## Backend Integration

The component works with any backend that returns the expected format:

### Text Response
```python
return {
    "type": "text",
    "payload": "<h3>Analysis Complete</h3><p>Your data shows...</p>",
    "explanation": "Analysis summary"
}
```

### Table Response
```python
return {
    "type": "table",
    "payload": [
        {"metric": "Accuracy", "value": "94.2%"},
        {"metric": "Precision", "value": "91.8%"}
    ],
    "explanation": "Model performance metrics"
}
```

### Chart Response
```python
return {
    "type": "plotly",
    "payload": {
        "data": [{
            "x": ["Q1", "Q2", "Q3", "Q4"],
            "y": [20, 30, 25, 35],
            "type": "bar",
            "name": "Performance"
        }],
        "layout": {
            "title": "Quarterly Performance",
            "xaxis": {"title": "Quarter"},
            "yaxis": {"title": "Score"}
        }
    },
    "explanation": "Performance trending upward"
}
```

## Advanced Features

### Session Management
The component automatically handles session persistence:
```jsx
// Sessions are managed automatically
// Previous context is maintained across conversations
<ChatBot showSessionInfo={true} />
```

### File Integration
Shows uploaded file information:
```jsx
// Automatically detects files from localStorage
<ChatBot showFileInfo={true} />
```

### Conversation History
Maintains chat history in sidebar:
```jsx
// Users can see recent conversations
<ChatBot showRecentChats={true} />
```

## Benefits of This Approach

1. **Consistency**: Same UX across all chat interfaces
2. **Maintainability**: Single component to update/fix
3. **Reusability**: Easy to add to new pages
4. **Professional**: High-quality styling and interactions
5. **Flexible**: Highly configurable for different use cases
6. **Performance**: Optimized rendering and memory usage
7. **Accessibility**: Built-in screen reader support
8. **Responsive**: Works on all device sizes

## Migration Guide

To migrate existing chat interfaces:

1. **Replace imports:**
```jsx
// Old
import { useState, useEffect } from 'react';
import { CircularProgress } from '@mui/material';
// ... many imports

// New
import ChatBot from '../../components/ChatBot';
```

2. **Replace component:**
```jsx
// Old
const MyPage = () => {
  // ... 200+ lines of chat logic
};

// New
const MyPage = () => {
  return (
    <ChatBot
      title="My Assistant"
      endpoint="/my-endpoint/"
      // ... other props
    />
  );
};
```

3. **Update styles:**
```scss
// Remove old chat styles from your .scss files
// Add custom styling via className prop if needed
```

This approach reduces code by 90%+ while improving functionality and maintainability!
