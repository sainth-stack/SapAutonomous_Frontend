import React from 'react';
import ChatBot from '../../components/ChatBot';
import { sendAppLog } from '../../utils/logger';
import '../kedb/index.css';
import './index.css';

const WebSuggestedActions = () => (
  <ChatBot
    title="AI Power Search"
    subtitle="Search SAP community knowledge and get step-by-step suggested actions"
    placeholder="Describe your issue (e.g., SAP BTP connectivity failed with S/4HANA)"
    initialMessage="Hello! I'm your AI Power Search assistant. Describe your SAP issue and I'll search community knowledge for suggested actions, fixes, and relevant notes."
    showFileInfo={false}
    showRecentChats={true}
    showSessionInfo={false}
    className="kedb-chatbot web-suggested-chatbot"
    maxWidth="1400px"
    isAiPowerSearch={true}
    onApiStatusLog={sendAppLog}
  />
);

export default WebSuggestedActions;
