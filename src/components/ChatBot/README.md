# ChatBot Component

A professional, reusable chatbot component that supports multiple response types including text, tables, and Plotly charts.

## Features

- ✅ **Multiple Response Types**: Text, tables, and interactive Plotly charts
- ✅ **Session Management**: Maintains conversation context across interactions
- ✅ **File Upload Integration**: Shows uploaded file information
- ✅ **Recent Conversations**: Sidebar with conversation history
- ✅ **Professional Design**: Modern, responsive UI with dark mode support
- ✅ **Fully Configurable**: Customizable titles, endpoints, and features
- ✅ **Accessibility**: Screen reader friendly with proper ARIA labels
- ✅ **Mobile Responsive**: Works on all device sizes

## Basic Usage

```jsx
import ChatBot from '../../components/ChatBot';

const MyPage = () => {
  return (
    <ChatBot
      title="AI Assistant"
      subtitle="How can I help you today?"
      placeholder="Type your message..."
      endpoint="/api/chat/"
    />
  );
};
```

## Advanced Usage

```jsx
import ChatBot from '../../components/ChatBot';

const SLAMonitoring = () => {
  return (
    <ChatBot
      title="SLA Monitoring Assistant"
      subtitle="Monitor your SLA performance and get automated insights"
      placeholder="Ask about SLA monitoring..."
      endpoint="/Explore_sla/"
      initialMessage="Hello! I'm your SLA monitoring assistant. How can I help?"
      showFileInfo={true}
      showRecentChats={true}
      showSessionInfo={true}
      className="sla-monitoring-chatbot"
      maxWidth="1400px"
    />
  );
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | "AI Assistant" | Main title displayed in the header |
| `subtitle` | string | "How can I help you today?" | Subtitle text below the title |
| `placeholder` | string | "Type your message..." | Input field placeholder text |
| `endpoint` | string | "/Explore_sla/" | API endpoint for chat requests |
| `initialMessage` | string | "Hello! How can I assist you today?" | First message from the bot |
| `showFileInfo` | boolean | true | Show uploaded file information |
| `showRecentChats` | boolean | true | Show recent conversations sidebar |
| `showSessionInfo` | boolean | true | Show session ID information |
| `className` | string | "" | Additional CSS class for styling |
| `maxWidth` | string | "1200px" | Maximum width of the component |

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
  "payload": "<p>Your SLA performance is <strong>excellent</strong> this month!</p>",
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

#### Plotly Chart Response
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
      "title": "Monthly SLA Performance"
    }
  },
  "explanation": "SLA performance chart"
}
```

## Styling

The component comes with comprehensive CSS styling in `styles.css`. You can override styles using the `className` prop:

```css
.my-custom-chatbot .chatbot-header {
  background: linear-gradient(135deg, #your-color-1, #your-color-2);
}

.my-custom-chatbot .chatbot-title {
  color: #your-brand-color;
}
```

## Examples

### Data Analysis Assistant
```jsx
<ChatBot
  title="Data Analysis"
  subtitle="Analyze your data with AI"
  placeholder="Ask about your data..."
  endpoint="/api/analyze/"
  showFileInfo={true}
  maxWidth="1600px"
/>
```

### Customer Support Bot
```jsx
<ChatBot
  title="Customer Support"
  subtitle="We're here to help!"
  placeholder="Describe your issue..."
  endpoint="/api/support/"
  showRecentChats={false}
  showSessionInfo={false}
  maxWidth="800px"
/>
```

### Minimal Chat Interface
```jsx
<ChatBot
  title="Quick Chat"
  subtitle="Ask me anything"
  showFileInfo={false}
  showRecentChats={false}
  showSessionInfo={false}
  className="minimal-chat"
/>
```

## Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Dependencies

- React 16.8+
- Material-UI (CircularProgress)
- Ant Design (Table)
- Plotly.js (react-plotly.js)

## Accessibility

The component follows WCAG 2.1 guidelines and includes:
- Proper ARIA labels
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
