import React from 'react';
import ChatBot from './index';

// Example 1: SLA Monitoring (Current Implementation)
export const SLAMonitoringBot = () => (
  <ChatBot
    title="SLA Monitoring"
    subtitle="Monitor your SLA performance and get automated insights"
    placeholder="Ask about SLA monitoring..."
    endpoint="/Explore_sla/"
    initialMessage="Hello! I'm your SLA monitoring assistant. How can I help you monitor your SLA performance today?"
    showFileInfo={true}
    showRecentChats={true}
    showSessionInfo={true}
    className="sla-monitoring-chatbot"
    maxWidth="1400px"
  />
);

// Example 2: Data Analysis Assistant
export const DataAnalysisBot = () => (
  <ChatBot
    title="Data Analysis Assistant"
    subtitle="Analyze your data with AI-powered insights"
    placeholder="Ask about your data analysis..."
    endpoint="/api/data-analysis/"
    initialMessage="Hello! I can help you analyze your data and create visualizations. What would you like to explore?"
    showFileInfo={true}
    showRecentChats={true}
    showSessionInfo={true}
    className="data-analysis-chatbot"
    maxWidth="1600px"
  />
);

// Example 3: Customer Support Bot
export const CustomerSupportBot = () => (
  <ChatBot
    title="Customer Support"
    subtitle="We're here to help you 24/7"
    placeholder="Describe your issue or question..."
    endpoint="/api/support/"
    initialMessage="Hello! I'm here to help with any questions or issues you might have. How can I assist you today?"
    showFileInfo={false}
    showRecentChats={true}
    showSessionInfo={false}
    className="support-chatbot"
    maxWidth="1000px"
  />
);

// Example 4: Document Q&A Bot
export const DocumentQABot = () => (
  <ChatBot
    title="Document Assistant"
    subtitle="Ask questions about your uploaded documents"
    placeholder="Ask about your documents..."
    endpoint="/api/document-qa/"
    initialMessage="Hello! I can help you find information in your uploaded documents. What would you like to know?"
    showFileInfo={true}
    showRecentChats={true}
    showSessionInfo={true}
    className="document-qa-chatbot"
    maxWidth="1200px"
  />
);

// Example 5: Minimal Chat Interface
export const MinimalChatBot = () => (
  <ChatBot
    title="Quick Assistant"
    subtitle="Simple and fast AI assistance"
    placeholder="Type your message..."
    endpoint="/api/chat/"
    initialMessage="Hi! How can I help you today?"
    showFileInfo={false}
    showRecentChats={false}
    showSessionInfo={false}
    className="minimal-chatbot"
    maxWidth="800px"
  />
);

// Example 6: Financial Analysis Bot
export const FinancialAnalysisBot = () => (
  <ChatBot
    title="Financial Analysis"
    subtitle="AI-powered financial insights and reporting"
    placeholder="Ask about financial metrics..."
    endpoint="/api/financial-analysis/"
    initialMessage="Welcome! I can help you analyze financial data, create reports, and provide insights. What would you like to explore?"
    showFileInfo={true}
    showRecentChats={true}
    showSessionInfo={true}
    className="financial-analysis-chatbot"
    maxWidth="1500px"
  />
);

// Example 7: Code Assistant Bot
export const CodeAssistantBot = () => (
  <ChatBot
    title="Code Assistant"
    subtitle="Get help with coding questions and debugging"
    placeholder="Ask about your code..."
    endpoint="/api/code-assistant/"
    initialMessage="Hello! I can help you with coding questions, debugging, and code reviews. What do you need help with?"
    showFileInfo={true}
    showRecentChats={true}
    showSessionInfo={true}
    className="code-assistant-chatbot"
    maxWidth="1400px"
  />
);

// Example 8: Project Management Bot
export const ProjectManagementBot = () => (
  <ChatBot
    title="Project Assistant"
    subtitle="Manage your projects with AI assistance"
    placeholder="Ask about your projects..."
    endpoint="/api/project-management/"
    initialMessage="Hi! I can help you manage projects, track progress, and optimize workflows. How can I assist you today?"
    showFileInfo={false}
    showRecentChats={true}
    showSessionInfo={true}
    className="project-management-chatbot"
    maxWidth="1200px"
  />
);

// Usage in a page component:
const ExampleUsagePage = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>ChatBot Component Examples</h1>
      
      {/* You can conditionally render different bots based on context */}
      <SLAMonitoringBot />
      
      {/* Or switch between them based on user selection */}
      {/* <DataAnalysisBot /> */}
      {/* <CustomerSupportBot /> */}
    </div>
  );
};

export default ExampleUsagePage;
