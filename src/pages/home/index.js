import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdSpeed, MdSmartToy, MdErrorOutline, MdArrowForward } from 'react-icons/md';
import './index.css';

const CARDS = [
  {
    id: 'job-monitoring',
    title: 'SAP Job Monitoring',
    desc: 'Monitor background jobs, execution times, and job statuses in real time.',
    Icon: MdSpeed,
    path: '/process-monitor/thanksgiving',
    color: '#3b82f6',
  },
  {
    id: 'sap-joule',
    title: 'SAP Joule',
    desc: 'Query Sales Orders, Purchase Orders and more in natural language.',
    Icon: MdSmartToy,
    path: '/self-service-actions',
    color: '#8b5cf6',
  },
  {
    id: 'failed-idocs',
    title: 'Failed IDocs',
    desc: 'View, filter, and retrigger failed IDocs from your SAP system.',
    Icon: MdErrorOutline,
    path: '/process-monitor/failed-idocs',
    color: '#ef4444',
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <div className="home-header">
        <h1 className="home-title">SAP Autonomous</h1>
        <p className="home-subtitle">Select a module to get started</p>
      </div>

      <div className="home-cards">
        {CARDS.map(({ id, title, desc, Icon, path, color }) => (
          <button
            key={id}
            className="home-card"
            onClick={() => navigate(path)}
            style={{ '--card-color': color }}
          >
            <div className="home-card-icon">
              <Icon size={32} />
            </div>
            <div className="home-card-body">
              <div className="home-card-title">{title}</div>
              <div className="home-card-desc">{desc}</div>
            </div>
            <MdArrowForward size={20} className="home-card-arrow" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Home;
