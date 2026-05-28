import React from "react";
import Report from "./report";
import FloatingChatBot from "../../components/ChatBot/FloatingChatBot";

// Note: All data processing now happens on the backend via /api/sla_breach/* endpoints

export const MainPages = () => {
  return (
    <div className="w-full min-h-full bg-slate-50 px-4 py-4 md:px-6 md:py-6">
      <div className="w-full bg-white rounded-xl border border-slate-200 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-blue-800">
            SLA Monitoring
          </h1>
        </div>

        <div className="space-y-6">
          {/* Report component now handles its own data loading from backend */}
          <Report />
        </div>
      </div>
      
      {/* Floating Chat Bot */}
      <FloatingChatBot
        title="SLA Data Analysis"
        subtitle="Ask questions about your SLA data"
        placeholder="Ask about SLA metrics, trends, performance..."
        endpoint="/Explore_sla/"
        initialMessage="Hello! I can help you analyze your SLA data. You can ask me about metrics, trends, performance issues, and get detailed insights from your uploaded data. What would you like to explore?"
        showFileInfo={true}
        showSessionInfo={true}
        className="sla-data-chatbot"
      />
    </div>
  );
};