import React, { useState, useMemo } from 'react';
import TktsSLAsTable from '../bi-report/TktsSLAsTable';
import TktsSLAsChart from '../bi-report/TktsSLAsChart';
import './index.css';

const MONTHS = [
  { value: '01', label: 'Jan' }, { value: '02', label: 'Feb' }, { value: '03', label: 'Mar' },
  { value: '04', label: 'Apr' }, { value: '05', label: 'May' }, { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' }, { value: '08', label: 'Aug' }, { value: '09', label: 'Sep' },
  { value: '10', label: 'Oct' }, { value: '11', label: 'Nov' }, { value: '12', label: 'Dec' }
];

const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= currentYear - 15; y--) years.push({ value: String(y), label: String(y) });
  return years;
};

const YEAR_OPTIONS = getYearOptions();

const SLACombined = () => {
  const [activeTab] = useState('Tkts_SLAs_Chart');
  const [filterMode, setFilterMode] = useState('all');
  const [customStartYear, setCustomStartYear] = useState('');
  const [customStartMonth, setCustomStartMonth] = useState('');
  const [customEndYear, setCustomEndYear] = useState('');
  const [customEndMonth, setCustomEndMonth] = useState('');
  const [customApplied, setCustomApplied] = useState(null);

  const customStart = customStartYear && customStartMonth ? `${customStartYear}-${customStartMonth}` : '';
  const customEnd = customEndYear && customEndMonth ? `${customEndYear}-${customEndMonth}` : '';

  const canApplyCustom = customStart && customEnd && customStart <= customEnd;
  const customRangeInvalid = customStart && customEnd && customStart > customEnd;

  const handleCustomApply = () => {
    if (customStart && customEnd && customStart <= customEnd) {
      setCustomApplied({ start_month: customStart, end_month: customEnd });
    }
  };

  const dateFilter = useMemo(() => {
    if (filterMode === 'custom' && customApplied) {
      return { start_month: customApplied.start_month, end_month: customApplied.end_month };
    }
    if (['3', '6', '12'].includes(filterMode)) {
      return { range: parseInt(filterMode, 10) };
    }
    return null;
  }, [filterMode, customApplied]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Tkts_SLAs_Table':
        return <TktsSLAsTable dateFilter={dateFilter} />;
      case 'Tkts_SLAs_Chart':
        return <TktsSLAsChart dateFilter={dateFilter} />;
      default:
        return <TktsSLAsTable dateFilter={dateFilter} />;
    }
  };

  return (
    <div className="sla-combined-container">
      <div className="sla-combined-header">
        <h1>Resolution and Response Time SLA</h1>
      </div>

      <div className="sla-combined-content">
        <div className="sla-filter-panel sla-filter-panel-above-chart">
          <span className="sla-filter-label">Period:</span>
          <div className="sla-filter-radio-group">
            {[
              { id: 'all', label: 'All' },
              { id: '3', label: '3 Months' },
              { id: '6', label: '6 Months' },
              { id: '12', label: '12 Months' }
            ].map((opt) => (
              <label key={opt.id} className="sla-filter-radio-label">
                <input
                  type="radio"
                  name="period"
                  className="sla-filter-radio"
                  value={opt.id}
                  checked={filterMode === opt.id}
                  onChange={() => {
                    setFilterMode(opt.id);
                    setCustomApplied(null);
                  }}
                />
                <span className="sla-filter-radio-text">{opt.label}</span>
              </label>
            ))}
          </div>
          <div className="sla-filter-custom-row">
            <label className="sla-filter-radio-label">
              <input
                type="radio"
                name="period"
                className="sla-filter-radio"
                value="custom"
                checked={filterMode === 'custom'}
                onChange={() => setFilterMode('custom')}
              />
              <span className="sla-filter-radio-text">Custom</span>
            </label>
            {filterMode === 'custom' && (
              <div className="sla-filter-custom">
                <div className="sla-filter-date-group">
                  <span className="sla-filter-date-label">Start</span>
                  <select
                    className="sla-filter-select sla-filter-year"
                    value={customStartYear}
                    onChange={(e) => setCustomStartYear(e.target.value)}
                    aria-label="Start year"
                  >
                    <option value="">Year</option>
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y.value} value={y.value}>{y.label}</option>
                    ))}
                  </select>
                  <select
                    className="sla-filter-select sla-filter-month"
                    value={customStartMonth}
                    onChange={(e) => setCustomStartMonth(e.target.value)}
                    aria-label="Start month"
                  >
                    <option value="">Month</option>
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <span className="sla-filter-sep">to</span>
                <div className="sla-filter-date-group">
                  <span className="sla-filter-date-label">End</span>
                  <select
                    className="sla-filter-select sla-filter-year"
                    value={customEndYear}
                    onChange={(e) => setCustomEndYear(e.target.value)}
                    aria-label="End year"
                  >
                    <option value="">Year</option>
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y.value} value={y.value}>{y.label}</option>
                    ))}
                  </select>
                  <select
                    className="sla-filter-select sla-filter-month"
                    value={customEndMonth}
                    onChange={(e) => setCustomEndMonth(e.target.value)}
                    aria-label="End month"
                  >
                    <option value="">Month</option>
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className="sla-filter-apply"
                  onClick={handleCustomApply}
                  disabled={!canApplyCustom}
                >
                  Apply
                </button>
                {customRangeInvalid && (
                  <span className="sla-filter-custom-hint" role="status">
                    Start must be before or same as End.
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default SLACombined;
