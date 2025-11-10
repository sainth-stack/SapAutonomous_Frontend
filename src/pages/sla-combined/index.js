import React, { useState } from 'react';
import TktsSLAsTable from '../bi-report/TktsSLAsTable';
import TktsSLAsChart from '../bi-report/TktsSLAsChart';
import './index.css';

const SLACombined = () => {
  const [activeTab, setActiveTab] = useState('Tkts_SLAs_Chart');

  const tabs = [
    { id: 'Tkts_SLAs_Table', label: 'Tkts_SLAs_Table' },
    { id: 'Tkts_SLAs_Chart', label: 'Tkts_SLAs_Chart' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Tkts_SLAs_Table':
        return <TktsSLAsTable />;
      case 'Tkts_SLAs_Chart':
        return <TktsSLAsChart />;
      default:
        return <TktsSLAsTable />;
    }
  };

  return (
    <div className="sla-combined-container">
      <div className="sla-combined-header">
        <h1>Resolution and Response Time SLA</h1>
      </div>
      
      {/* <div className="view-switcher">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`view-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div> */}

      <div className="sla-combined-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default SLACombined;
