import React, { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  SubTitle
} from 'chart.js';
import SharedFilters from '../filter/sharedReport';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, Title, SubTitle);

const PiechartReport = ({ data, filters, onFilterChange, onResetFilters, getUniqueValues }) => {
  // Predefined color assignments for each possible value
  const colorMappings = {
    // Priority colors - Modern professional palette
    priority: {
      'P1 - Critical': '#E63946', // Vibrant red (for immediate attention)
      'P2 - High': '#F77F00', // Warm orange (high importance)
      'P3 - Normal': '#FFBE0B', // Golden yellow (medium priority)
      'P4 - Low': '#2A9D8F', // Teal green (low priority)
      'P5': '#457B9D', // Muted blue (lowest priority)
      'Default': '#A8A8A8' // Neutral gray
    },
    
    // Status colors - Professional workflow palette
    status: {
      'Open': '#1D3557', // Dark navy (new items)
      'In Progress': '#3A86FF', // Bright blue (active work)
      'Resolved': '#4CC9F0', // Light blue (completed but not closed)
      'Closed': '#4361EE', // Royal blue (final state)
      'Pending': '#F8961E', // Amber (waiting state)
      'Rejected': '#D90429', // Deep red (negative outcome)
      'On Hold': '#7209B7', // Purple (paused state)
      'Default': '#8D99AE' // Cool gray
    },
    
    // Breached status colors
    breached: {
      'Breached': '#D00000', // Strong red (immediate attention needed)
      'Not Breached': '#38B000', // Healthy green (positive state)
      'At Risk': '#FFAA00' // Warning yellow (nearing breach)
    },
    
    // Assigned To colors - Consistent user palette
    assignedTo: {
      '_palette': [
        '#3A86FF', // Bright blue
        '#8338EC', // Vibrant purple
        '#FF006E', // Pink-red
        '#FB5607', // Orange
        '#FFBE0B', // Yellow
        '#3A5A40', // Dark green
        '#588B8B', // Muted teal
        '#C1121F', // Deep red
        '#780000', // Burgundy
        '#003049' // Dark blue
      ]
    },
    
    // Additional color sets for other categories if needed
    category: {
      'Hardware': '#4361EE',
      'Software': '#7209B7',
      'Network': '#3A0CA3',
      'Database': '#4CC9F0',
      'Security': '#F72585',
      'Default': '#8D99AE'
    }
  };

  // Helper to get consistent colors for assigned users
  const getAssignedToColor = (name) => {
    // If we haven't seen this user before, assign them the next color in the palette
    if (!colorMappings.assignedTo[name]) {
      const index = Object.keys(colorMappings.assignedTo).length - 1; // -1 for _palette
      colorMappings.assignedTo[name] = colorMappings.assignedTo._palette[
        index % colorMappings.assignedTo._palette.length
      ];
    }
    return colorMappings.assignedTo[name];
  };

  // Chart configuration generator with fixed colors
  const getChartConfig = (data, title, categoryType) => {
    const backgroundColors = data.map(item => {
      if (categoryType === 'priority') {
        return colorMappings.priority[item.name] || colorMappings.priority['Default'];
      } else if (categoryType === 'status') {
        return colorMappings.status[item.name] || colorMappings.status['Default'];
      } else if (categoryType === 'breached') {
        return colorMappings.breached[item.name];
      } else if (categoryType === 'assignedTo') {
        return getAssignedToColor(item.name);
      }
      return '#BAB0AC'; // Fallback color
    });
    
    return {
      data: {
        labels: data.map(item => item.name),
        datasets: [{
          data: data.map(item => item.value),
          backgroundColor: backgroundColors,
          borderColor: '#fff',
          borderWidth: 2,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#333',
              font: { size: 12, family: "'Inter', sans-serif" },
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          title: {
            display: true,
            text: title,
            color: '#2c3e50',
            font: { size: 16, weight: 'bold', family: "'Inter', sans-serif" },
            padding: { top: 10, bottom: 20 }
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.9)',
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 12 },
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true
        }
      }
    };
  };

  // Prepare data for pie charts
  const chartData = useMemo(() => {
    // Priority Distribution
    const priorityCounts = {};
    data.forEach(ticket => {
      priorityCounts[ticket.priority] = (priorityCounts[ticket.priority] || 0) + 1;
    });
    const priorityDistribution = Object.entries(priorityCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Breached Distribution
    let breached = 0, notBreached = 0;
    data.forEach(ticket => {
      ticket.isBreached ? breached++ : notBreached++;
    });
    const breachedDistribution = [
      { name: 'Breached', value: breached },
      { name: 'Not Breached', value: notBreached }
    ];

    // Assigned To Distribution
    const assignedToCounts = {};
    data.forEach(ticket => {
      if (ticket.assignedTo) {
        assignedToCounts[ticket.assignedTo] = (assignedToCounts[ticket.assignedTo] || 0) + 1;
      }
    });
    const assignedToDistribution = Object.entries(assignedToCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Show top 8 assigned users

    // Status Distribution
    const statusCounts = {};
    data.forEach(ticket => {
      statusCounts[ticket.status] = (statusCounts[ticket.status] || 0) + 1;
    });
    const statusDistribution = Object.entries(statusCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      priorityDistribution,
      breachedDistribution,
      assignedToDistribution,
      statusDistribution
    };
  }, [data]);

  return (
    <div className="report-card">
      <div className="report-header">
        <h1 className="report-title">Management Report - Analytics View</h1>
      </div>

      <SharedFilters 
        filters={filters}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
        getUniqueValues={getUniqueValues}
      />

      <div className="charts-section">
        <div className="chart-card">
          <div className="chart-wrapper">
            <Pie 
              data={getChartConfig(chartData.priorityDistribution, 'Priority Distribution', 'priority').data} 
              options={getChartConfig(chartData.priorityDistribution, 'Priority Distribution', 'priority').options} 
            />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-wrapper">
            <Pie 
              data={getChartConfig(chartData.breachedDistribution, 'SLA Breach Status', 'breached').data} 
              options={getChartConfig(chartData.breachedDistribution, 'SLA Breach Status', 'breached').options} 
            />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-wrapper">
            <Pie 
              data={getChartConfig(chartData.assignedToDistribution, 'Assigned To Distribution', 'assignedTo').data} 
              options={getChartConfig(chartData.assignedToDistribution, 'Assigned To Distribution', 'assignedTo').options} 
            />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-wrapper">
            <Pie 
              data={getChartConfig(chartData.statusDistribution, 'Status Distribution', 'status').data} 
              options={getChartConfig(chartData.statusDistribution, 'Status Distribution', 'status').options} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PiechartReport;