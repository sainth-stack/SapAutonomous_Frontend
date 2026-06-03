import React from 'react';
import FloatingChatBot from '../../components/ChatBot/FloatingChatBot';
import { getStoredUser } from '../../utils/authSession';
import { canShowExploreSlaChatBot } from '../../utils/exploreSlaChatAccess';

function shouldShowExploreChat(user) {
  if (typeof canShowExploreSlaChatBot === "function") {
    return canShowExploreSlaChatBot(user);
  }
  const email = (user?.email || "").trim().toLowerCase();
  return email !== "dmancuso2@luxotticaretail.com";
}

const SelfMonitoring = () => {
  const showChatBot = shouldShowExploreChat(getStoredUser());

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Self Monitoring Dashboard
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Monitor your SLA performance and get automated insights
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                <h3 className="text-xl font-semibold mb-2">Performance Metrics</h3>
                <p className="text-blue-100">Track key performance indicators and SLA compliance</p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg p-6 text-white">
                <h3 className="text-xl font-semibold mb-2">Real-time Monitoring</h3>
                <p className="text-green-100">Get instant alerts and notifications</p>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg p-6 text-white">
                <h3 className="text-xl font-semibold mb-2">AI Insights</h3>
                <p className="text-orange-100">Use the chat assistant for detailed analysis</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Get Started with AI Analysis
              </h2>
              <p className="text-gray-600 mb-4">
                Click the chat icon in the bottom right corner to start analyzing your SLA data with AI assistance.
              </p>
              <div className="flex justify-center">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>💬</span>
                  <span>Chat assistant available in bottom right corner</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showChatBot && (
        <FloatingChatBot
          title="Self Monitoring Assistant"
          subtitle="Monitor your SLA performance"
          placeholder="Ask about SLA monitoring..."
          endpoint="/Explore_sla/"
          initialMessage="Hello! I'm your Self-Monitoring assistant. How can I help you monitor your SLA performance today?"
          showFileInfo={true}
          showSessionInfo={true}
          className="self-monitoring-chatbot"
        />
      )}
    </div>
  );
};

export default SelfMonitoring;
