import React from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const SharedFilters = ({ 
  filters, 
  onFilterChange, 
  onResetFilters,
  getUniqueValues 
}) => {
  return (
    <div className="filter-section">
      <div className="filter-grid">
        {/* Request Type - multi-select */}

        {/* Priority - Updated for multi-select */}
        <div className="filter-group">
          <label className="filter-label">Priority</label>
          <Select
            isMulti
            options={getUniqueValues('priority').map(priority => ({ 
              value: priority, 
              label: priority 
            }))}
            value={filters.priority 
              ? filters.priority.map(priority => ({ value: priority, label: priority }))
              : []
            }
            onChange={(options) => onFilterChange(
              'priority', 
              options ? options.map(opt => opt.value) : []
            )}
            className="basic-select"
            classNamePrefix="select"
            closeMenuOnSelect={false}
            placeholder="Select priorities..."
          />
        </div>

        {/* Assigned To - multi-select */}
        <div className="filter-group">
          <label className="filter-label">Resource</label>
          <Select
            isMulti
            options={getUniqueValues('assignedTo').map(name => ({ 
              value: name, 
              label: name 
            }))}
            value={filters.assignedTo 
              ? filters.assignedTo.map(name => ({ value: name, label: name }))
              : []
            }
            onChange={(options) => onFilterChange(
              'assignedTo', 
              options ? options.map(opt => opt.value) : []
            )}
            className="basic-select"
            classNamePrefix="select"
            closeMenuOnSelect={false}
            placeholder="Select resources..."
          />
        </div>

        {/* Macro Area - Name - multi-select */}
        <div className="filter-group">
          <label className="filter-label">Macro Area - Name</label>
          <Select
            isMulti
            options={getUniqueValues('marconaName').map(name => ({ 
              value: name, 
              label: name 
            }))}
            value={filters.marconaName 
              ? filters.marconaName.map(name => ({ value: name, label: name }))
              : []
            }
            onChange={(options) => onFilterChange(
              'marconaName', 
              options ? options.map(opt => opt.value) : []
            )}
            className="basic-select"
            classNamePrefix="select"
            closeMenuOnSelect={false}
            placeholder="Select macro areas..."
          />
        </div>

        {/* Status - multi-select */}
        <div className="filter-group">
          <label className="filter-label">Status</label>
          <Select
            isMulti
            options={getUniqueValues('currentStatus').map(status => ({ 
              value: status, 
              label: status 
            }))}
            value={filters.status 
              ? filters.status.map(status => ({ value: status, label: status }))
              : []
            }
            onChange={(options) => onFilterChange(
              'status', 
              options ? options.map(opt => opt.value) : []
            )}
            className="basic-select"
            classNamePrefix="select"
            closeMenuOnSelect={false}
            placeholder="Select statuses..."
          />
        </div>

        {/* Breached - multi-select */}
        <div className="filter-group">
          <label className="filter-label">Breached</label>
          <Select
            isMulti
            options={[
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' }
            ]}
            value={filters.breached 
              ? filters.breached.map(breached => ({ 
                  value: breached, 
                  label: breached === 'true' ? 'Yes' : 'No' 
                }))
              : []
            }
            onChange={(options) => onFilterChange(
              'breached', 
              options ? options.map(opt => opt.value) : []
            )}
            className="basic-select"
            classNamePrefix="select"
            closeMenuOnSelect={false}
            placeholder="Select breach status..."
          />
        </div>

        {/* Time to Breach */}
        <div className="filter-group">
          <label className="filter-label">Time to Breach</label>
          <div className="flex gap-2">
            <Select
              options={[
                { value: 'eq', label: 'Equal to' },
                { value: 'lte', label: 'Less than or equal to' },
                { value: 'gte', label: 'Greater than or equal to' }
              ]}
              value={{
                value: filters.timeToBreachOption,
                label: filters.timeToBreachOption === 'eq' ? 'Equal to' :
                      filters.timeToBreachOption === 'lte' ? 'Less than or equal to' :
                      'Greater than or equal to'
              }}
              onChange={(option) => onFilterChange('timeToBreachOption', option.value)}
              className="basic-select flex-1"
              classNamePrefix="select"
            />
            <input
              type="number"
              placeholder="Hours"
              className="filter-input flex-1"
              value={filters.timeToBreachValue || ''}
              onChange={(e) => onFilterChange('timeToBreachValue', e.target.value)}
            />
          </div>
        </div>
        <div className="filter-group">
          <label className="filter-label">Request Type</label>
          <Select
            isMulti
            options={getUniqueValues('requestType').map(type => ({ 
              value: type, 
              label: type 
            }))}
            value={filters.requestType 
              ? filters.requestType.map(type => ({ value: type, label: type }))
              : []
            }
            onChange={(options) => onFilterChange(
              'requestType', 
              options ? options.map(opt => opt.value) : []
            )}
            className="basic-select"
            classNamePrefix="select"
            closeMenuOnSelect={false}
            placeholder="Select request types..."
          />
        </div>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="w-full max-w-md">
          <label className="filter-label">Search</label>
          <input
            type="text"
            placeholder="Search across all columns..."
            className="filter-input"
            value={filters.searchText}
            onChange={(e) => onFilterChange('searchText', e.target.value)}
          />
        </div>
        <button
          onClick={onResetFilters}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors ml-4"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default SharedFilters;