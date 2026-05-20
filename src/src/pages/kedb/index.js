import React, { useState, useEffect } from 'react';
import ChatBot from '../../components/ChatBot';
import { sendAppLog } from '../../utils/logger';
import { vectorizerSimilarTicketsURL } from '../../const';
import './index.css';

// Page visit is logged globally from AdminLayout; this page only wires KB API success/error logs.

const KEDB = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <svg
              className="animate-spin h-12 w-12 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Loading...</h2>
          <p className="text-gray-600">Checking for uploaded data...</p>
        </div>
      </div>
    );
  }

  // if (!hasUploadedFile) {
  //   return (
  //     <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
  //       <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
  //         <div className="flex justify-center mb-4">
  //           <svg className="h-12 w-12 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  //           </svg>
  //         </div>
  //         <h2 className="text-xl font-bold text-gray-800 mb-2">No Data Available</h2>
  //         <p className="text-gray-600 mb-6">Please upload data to analyze before using the Knowledge Base.</p>
  //         <button
  //           onClick={() => window.location.href = '/data-source'}
  //           className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-semibold"
  //         >
  //           Upload Data
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <ChatBot
      title="Knowledge Base Search"
      subtitle="Search for solutions to similar incidents and issues"
      placeholder="Ask about errors, issues, or search for solutions..."
      endpoint={vectorizerSimilarTicketsURL}
      initialMessage="Hello! I'm your Knowledge Base assistant. Ask me about any errors, incidents, or issues you need help with. I can search through historical data to find similar cases and solutions."
      showFileInfo={false}
      showRecentChats={true}
      showSessionInfo={false}
      className="kedb-chatbot"
      maxWidth="1400px"
      isKnowledgeBase={true}
      onApiStatusLog={sendAppLog}
    />
  );
};

export default KEDB;
