# FloatingChatBot Component

A professional floating chat bot component that appears as a button in the bottom-right corner and opens as a popup modal when clicked. Perfect for providing AI assistance without taking up page real estate.

## Features

- ✅ **Floating Button**: Unobtrusive chat icon with notification badge
- ✅ **Popup Modal**: Professional chat interface in a compact modal
- ✅ **Multiple Response Types**: Text, tables, and interactive Plotly charts
- ✅ **Session Management**: Maintains conversation context across interactions
- ✅ **File Upload Integration**: Shows uploaded file information in header
- ✅ **Responsive Design**: Works perfectly on mobile and desktop
- ✅ **Smooth Animations**: Professional slide-up and fade-in effects
- ✅ **Material-UI Integration**: Uses MUI components for consistency

## Basic Usage

```jsx
import FloatingChatBot from '../../components/ChatBot/FloatingChatBot';

const MyPage = () => {
  return (
    <div>
      {/* Your page content */}
      <h1>My Page</h1>
      <p>Page content here...</p>
      
      {/* Floating Chat Bot - appears in bottom right */}
      <FloatingChatBot
        title="AI Assistant"
        subtitle="How can I help you?"
        placeholder="Type your message..."
        endpoint="/api/chat/"
      />
    </div>
  );
};
```

## Advanced Usage

```jsx
import FloatingChatBot from '../../components/ChatBot/FloatingChatBot';

const SLAAnalysis = () => {
  return (
    <div className="page-container">
      {/* Your main content */}
      
      {/* Floating Chat Bot with full configuration */}
      <FloatingChatBot
        title="SLA Data Analysis"
        subtitle="Ask questions about your SLA data"
        placeholder="Ask about SLA metrics, trends, performance..."
        endpoint="/Explore_sla/"
        initialMessage="Hello! I can help you analyze your SLA data. What would you like to explore?"
        showFileInfo={true}
        showSessionInfo={true}
        className="sla-analysis-chatbot"
      />
    </div>
  );
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | "AI Assistant" | Main title displayed in the modal header |
| `subtitle` | string | "How can I help you today?" | Subtitle text below the title |
| `placeholder` | string | "Type your message..." | Input field placeholder text |
| `endpoint` | string | "/Explore_sla/" | API endpoint for chat requests |
| `initialMessage` | string | "Hello! How can I assist you today?" | First message from the bot |
| `showFileInfo` | boolean | true | Show uploaded file information in header |
| `showSessionInfo` | boolean | true | Show session ID information |
| `className` | string | "" | Additional CSS class for styling |

## Styling

The component comes with comprehensive CSS styling in `FloatingChatBot.css`:

### Custom Styling
```css
/* Custom button position */
.my-custom-chatbot .floating-chat-button {
  bottom: 30px;
  right: 30px;
}

/* Custom modal size */
.my-custom-chatbot .floating-chat-modal {
  width: 500px;
  height: 700px;
}
```

## API Response Format

The component expects API responses in the following format:

```json
{
  "type": "text|table|plotly",
  "payload": "Response content or data",
  "explanation": "Human-readable explanation",
  "session_id": "unique-session-identifier"
}
```

### Response Types

#### Text Response
```json
{
  "type": "text",
  "payload": "<p>Your SLA performance is <strong>excellent</strong>!</p>",
  "explanation": "SLA performance summary"
}
```

#### Table Response
```json
{
  "type": "table",
  "payload": [
    {"metric": "Response Time", "value": "2.3s", "status": "Good"},
    {"metric": "Resolution Time", "value": "4.1h", "status": "Excellent"}
  ],
  "explanation": "SLA metrics table"
}
```

#### Chart Response
```json
{
  "type": "plotly",
  "payload": {
    "data": [{
      "x": ["Jan", "Feb", "Mar"],
      "y": [20, 14, 23],
      "type": "scatter"
    }],
    "layout": {
      "title": "Monthly Performance"
    }
  },
  "explanation": "Performance chart"
}
```

## Features

### Floating Button
- **Pulsing Animation**: Draws attention without being distracting
- **Notification Badge**: Shows message count when there are conversations
- **Hover Effects**: Smooth scaling and shadow effects

### Chat Modal
- **Slide Animation**: Professional slide-up animation when opening
- **Message Bubbles**: User messages on right (blue), AI on left (white)
- **Loading States**: Animated loading indicators
- **Scrollable History**: Smooth scrolling with custom scrollbars

### Responsive Design
- **Mobile Optimized**: Full-screen on small devices
- **Tablet Friendly**: Appropriate sizing for medium screens
- **Desktop Perfect**: Optimal size and positioning

## Integration Examples

### Data Analysis Page
```jsx
// Only show chatbot when data is available
{csvData && (
  <FloatingChatBot
    title="Data Analysis Assistant"
    subtitle="Ask about your data"
    endpoint="/analyze/"
    showFileInfo={true}
  />
)}
```

### Customer Support
```jsx
<FloatingChatBot
  title="Support Assistant"
  subtitle="How can we help?"
  endpoint="/support/"
  showFileInfo={false}
  showSessionInfo={false}
/>
```

### Report Analysis
```jsx
<FloatingChatBot
  title="Report Insights"
  subtitle="Ask about this report"
  endpoint="/report-chat/"
  initialMessage="I can help explain this report. What would you like to know?"
/>
```

## Key Differences from Full ChatBot

| Feature | FloatingChatBot | Full ChatBot |
|---------|------------------|--------------|
| **Layout** | Floating popup modal | Full page/section component |
| **Space Usage** | Minimal - only button visible | Takes full allocated space |
| **User Experience** | Click to open, unobtrusive | Always visible interface |
| **Mobile** | Full screen modal | Responsive layout |
| **Use Case** | Secondary feature | Primary interface |

## Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Dependencies

- React 16.8+
- Material-UI Core & Icons
- Ant Design (Table component)
- React Icons
- Plotly.js (react-plotly.js)

## Migration from Full ChatBot

```jsx
// Before - Full page chatbot
<ChatBot
  title="Assistant"
  showRecentChats={true}
  maxWidth="1200px"
/>

// After - Floating chatbot
<FloatingChatBot
  title="Assistant"
  // No showRecentChats - handled internally
  // No maxWidth - responsive sizing
/>
```

The FloatingChatBot provides the same powerful AI chat functionality in a more user-friendly, unobtrusive package that doesn't interfere with your main page content.
