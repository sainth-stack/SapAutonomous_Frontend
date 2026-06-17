import React from 'react';
import Select from 'react-select';

const FILTER_PLACEHOLDERS = {
  status: 'All statuses',
  messageType: 'All message types',
  sender: 'All senders',
  receiver: 'All receivers',
  errorCategory: 'All error categories',
};

const FILTER_FIELDS = [
  { key: 'status', label: 'Status', rowKey: 'status' },
  { key: 'messageType', label: 'Message Type', rowKey: 'message_type' },
  { key: 'sender', label: 'Sender', rowKey: 'sender' },
  { key: 'receiver', label: 'Receiver', rowKey: 'receiver' },
  { key: 'errorCategory', label: 'Error Category', rowKey: 'error_category' },
];

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 38,
    borderColor: state.isFocused ? '#667eea' : '#e2e8f0',
    boxShadow: state.isFocused ? '0 0 0 1px #667eea' : 'none',
    '&:hover': { borderColor: '#cbd5e1' },
  }),
  menu: (base) => ({ ...base, zIndex: 20 }),
};

function toOptions(values) {
  return values.map((value) => ({ value, label: value }));
}

function toSelected(values) {
  return (values || []).map((value) => ({ value, label: value }));
}

const FailedIdocFilters = ({ filters, onFilterChange, onResetFilters, getUniqueValues }) => {
  const hasActiveFilters = FILTER_FIELDS.some((field) => (filters[field.key] || []).length > 0);

  return (
    <div className="failed-idoc-filters">
      <div className="failed-idoc-filters-grid">
        {FILTER_FIELDS.map((field) => {
          const options = toOptions(getUniqueValues(field.rowKey));
          const selected = filters[field.key] || [];

          return (
            <div key={field.key} className="failed-idoc-filter-group">
              <label className="failed-idoc-filter-label">{field.label}</label>
              {options.length > 0 ? (
                <Select
                  isMulti
                  options={options}
                  value={toSelected(selected)}
                  onChange={(opts) =>
                    onFilterChange(field.key, opts ? opts.map((opt) => opt.value) : [])
                  }
                  className="failed-idoc-select"
                  classNamePrefix="failed-idoc-select"
                  closeMenuOnSelect={false}
                  placeholder={FILTER_PLACEHOLDERS[field.key]}
                  styles={selectStyles}
                  isSearchable
                />
              ) : (
                <input
                  type="text"
                  className="failed-idoc-filter-input"
                  value={selected[0] || ''}
                  onChange={(e) =>
                    onFilterChange(field.key, e.target.value.trim() ? [e.target.value.trim()] : [])
                  }
                  placeholder={`Filter by ${field.label.toLowerCase()}`}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="failed-idoc-filters-actions">
        <button
          type="button"
          className="failed-idoc-reset-btn"
          onClick={onResetFilters}
          disabled={!hasActiveFilters}
        >
          Reset filters
        </button>
      </div>
    </div>
  );
};

export default FailedIdocFilters;
