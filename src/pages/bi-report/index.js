import React, { useState } from 'react';
import './index.css';
import TktsSLAsTable from './TktsSLAsTable';
import TktsSLAsChart from './TktsSLAsChart';
import ConsultantWise from './ConsultantWise';
import SuspendedStats from './SuspendedStats';
import SuspendedL2 from './SuspendedL2';
import TktDetails from './TktDetails';
import OpenTkts from './OpenTkts';
import OpenTktsL2 from './OpenTktsL2';
import AgingL2 from './AgingL2';
import SLAMonitor from './SLAMonitor';

const BIReport = () => {
  const [activeTab, setActiveTab] = useState('Suspended_Stats');

  const tabs = [
    // { id: 'Tkts_SLAs_Table', label: 'Tkts_SLAs_Table' },
    // { id: 'Tkts_SLAs_Chart', label: 'Tkts_SLAs_Chart' },
    // { id: 'Consultant_Wise', label: 'Consultant_Wise' },
    { id: 'Suspended_Stats', label: 'Suspended_Stats' },
    { id: 'Suspended_L2', label: 'Suspended_L2' },
    { id: 'Tkt_Details', label: 'Tkt_Details' },
    { id: 'Open_Tkts', label: 'Open_Tkts' },
    { id: 'Open_Tkts_L2', label: 'Open_Tkts_L2' },
    { id: 'Aging_L2', label: 'Aging_L2' },
    // { id: 'SLA_Monitor', label: 'SLA_Monitor' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Tkts_SLAs_Table':
        return <TktsSLAsTable />;
      case 'Tkts_SLAs_Chart':
        return <TktsSLAsChart />;
      case 'Consultant_Wise':
        return <ConsultantWise />;
      case 'Suspended_Stats':
        return <SuspendedStats />;
      case 'Suspended_L2':
        return <SuspendedL2 />;
      case 'Tkt_Details':
        return <TktDetails />;
      case 'Open_Tkts':
        return <OpenTkts />;
      case 'Open_Tkts_L2':
        return <OpenTktsL2 />;
      case 'Aging_L2':
        return <AgingL2 />;
      case 'SLA_Monitor':
        return <SLAMonitor />;
      default:
        return <TktsSLAsTable />;
    }
  };

  return (
    <div className="bi-report-container">
      <div className="bi-report-header">
        <h1>BI Report</h1>
      </div>
      
      <div className="tab-navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bi-report-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default BIReport;
