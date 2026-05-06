import Papa from "papaparse";
import * as XLSX from "xlsx";

// Constants
const YELLOW_FIELDS = [
  "ResolSLA",
  "RespSLA",
  "ReqComp",
  "ReqCrDtConc",
  "EnDtConc",
  "HisChDtTiConc",
  "ElapsedTime",
  "CalcPreDt",
  "RefinedPreDt",
  "CalcStDt",
  "RefinedStDt",
  "Cumilative",
  "ResolSOW",
  "RespSOW",
  "ResolRem",
  "RespRem",
  "Rollover",
  "ReqCrYM",
  "DateRollover",
  "DateReqCrYM"
];

// Holiday data for multiple years (2021-2025)
const HOLIDAYS_BY_YEAR = {
  "2024": [
    "2024-01-01",
    "2024-01-14",
    "2024-01-26",
    "2024-03-29",
    "2024-04-02",
    "2024-04-13",
    "2024-04-14",
    "2024-04-21",
    "2024-06-02",
    "2024-08-15",
    "2024-09-10",
    "2024-10-02",
    "2024-10-31",
    "2024-12-25"
  ],
  "2025": [
    "2025-01-01",
    "2025-01-14",
    "2025-02-27",
    "2025-03-31",
    "2025-05-01",
    "2025-08-15",
    "2025-08-27",
    "2025-10-02",
    "2025-10-21",
    "2025-12-25"
  ]
};

const SLA_TABLE = {
  P1: { respsow: 0.5, resolsow: 4 },
  P2: { respsow: 2, resolsow: 9 },
  P3: { respsow: 9, resolsow: 45 },
  P4: { respsow: 18, resolsow: 90 },
};

const WORK_HOURS = {
  start: "14:00:00",
  end: "23:00:00",
};

// Date utilities
const dateUtils = {
  excelSerialToDate: (serial) => {
    if (!serial || isNaN(serial)) return null;
    const excelEpoch = new Date(1900, 0, 1);
    const days = Math.floor(serial) - 2;
    return new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
  },

  formatTime: (timeStr) => {
    if (!timeStr) return "00:00:00";
    
    // Already formatted as HH:MM:SS
    if (typeof timeStr === "string" && timeStr.includes(":") && timeStr.match(/^\d{1,2}:\d{2}:\d{2}$/)) {
      const parts = timeStr.split(':');
      return `${parts[0].padStart(2, '0')}:${parts[1]}:${parts[2]}`;
    }
    
    // Handle numeric format (HHMMSS or variants)
    if (typeof timeStr !== "string") {
      timeStr = String(timeStr);
    }
    
    timeStr = timeStr.replace(/[^0-9]/g, "").padStart(6, "0");
    return timeStr.length >= 6
      ? `${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}:${timeStr.slice(4, 6)}`
      : "00:00:00";
  },

  formatDate: (date) => {
    if (!(date instanceof Date) || isNaN(date)) return "";
    return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(
      date.getDate()
    ).padStart(2, "0")}/${date.getFullYear()}`;
  },

  parseDateTime: (dateVal, timeStr, index) => {
    try {
      let date;
      if (typeof dateVal === "number") {
        date = dateUtils.excelSerialToDate(dateVal);
      } else if (typeof dateVal === "string") {
        const datePart = dateVal?.split(" ")[0];
        const [day, month, year] = datePart.split('/');
        const swappedDate = `${month}/${day}/${year}`;
        date = new Date(swappedDate);
      } else {
        date = new Date(dateVal);
      }
      if (!date || isNaN(date)) return null;
      const time = dateUtils.formatTime(timeStr);
      return new Date(`${dateUtils.formatDate(date)} ${time}`);
    } catch (e) {
      console.error("Error parsing date/time:", e);
      return null;
    }
  },

  convertExcelDate: (excelDate) => {
    // Already in DD/MM/YYYY format
    if (typeof excelDate === "string" && excelDate.includes("/")) {
      return excelDate;
    }
    
    // Handle YYYY-MM-DD format (ISO format from backend)
    if (typeof excelDate === "string" && excelDate.match(/^\d{4}-\d{2}-\d{2}/)) {
      const [year, month, day] = excelDate.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Handle Excel serial number
    if (typeof excelDate === "number") {
      const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
      return date.toLocaleDateString("en-GB");
    }
    
    return dateUtils.formatDate(excelDate);
  },
};

// Calculation utilities
const calculationUtils = {
  excelMod: (date) => date - Math.floor(date),

  excelMedian: (a, b, c) => [a, b, c].sort((x, y) => x - y)[1],

  networkDaysIntl: (startDate, endDate, holidays = []) => {
    if (!startDate || !endDate || isNaN(startDate) || isNaN(endDate)) return 0;

    const holidayDates = holidays.map((holiday) =>
      new Date(holiday).setHours(0, 0, 0, 0)
    );
    let days = 0;
    let current = new Date(startDate);
    current.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    while (current <= end) {
      const day = current.getDay();
      const currentTime = current.setHours(0, 0, 0, 0);
      if (day !== 0 && day !== 6 && !holidayDates.includes(currentTime)) {
        days++;
      }
      current.setDate(current.getDate() + 1);
    }
    return days;
  },

  calculateWorkingHours: (
    startDate,
    endDate,
    workStartTimeStr,
    workEndTimeStr,
    holidays
  ) => {
    if (!startDate || !endDate || isNaN(startDate) || isNaN(endDate)) return 0;
    if (endDate < startDate) return 0;

    const [workStartHours, workStartMinutes] = workStartTimeStr
      .split(":")
      .map(Number);
    const [workEndHours, workEndMinutes] = workEndTimeStr
      .split(":")
      .map(Number);

    const workDayStart = workStartHours + workStartMinutes / 60;
    const workDayEnd = workEndHours + workEndMinutes / 60;
    const workDayLength = workDayEnd - workDayStart;

    const networkDays = calculationUtils.networkDaysIntl(
      startDate,
      endDate,
      holidays
    );

    if (networkDays === 0) return 0;

    const getMedTime = (date) => {
      const hours = date.getHours() + date.getMinutes() / 60;

      if (!isWorkingDay(date, holidays)) {
        return workDayEnd;
      }

      return Math.max(workDayStart, Math.min(hours, workDayEnd));
    };

    const startMedTime = isWorkingDay(startDate, holidays)
      ? getMedTime(startDate)
      : workDayStart;

    const endMedTime = isWorkingDay(endDate, holidays) ? getMedTime(endDate) : workDayEnd;

    const fullDaysPart = (networkDays - 1) * workDayLength;

    const result = (fullDaysPart + (endMedTime - startMedTime)) * 24;
    return parseFloat(result.toFixed(8));
  },

  calculatePreDt: (
    startDate,
    endDate,
    workStartTimeStr,
    workEndTimeStr,
    holidays,
    index
  ) => {
    if (!startDate || !endDate || isNaN(startDate) || isNaN(endDate)) return 0;

    const [workStartHours, workStartMinutes] = workStartTimeStr
      .split(":")
      .map(Number);
    const [workEndHours, workEndMinutes] = workEndTimeStr
      .split(":")
      .map(Number);

    const workDayStart = workStartHours + workStartMinutes / 60;
    const workDayEnd = workEndHours + workEndMinutes / 60;
    const workDayLength = workDayEnd - workDayStart;

    const holidayTimestamps = holidays.map((h) =>
      new Date(h).setHours(0, 0, 0, 0)
    );

    const isWorkingDay = (date) => {
      const day = date.getDay();
      const dateTimestamp = new Date(date).setHours(0, 0, 0, 0);
      return (
        day !== 0 && day !== 6 && !holidayTimestamps.includes(dateTimestamp)
      );
    };

    let adjustedStartDate = new Date(startDate);
    if (!isWorkingDay(adjustedStartDate)) {
      while (!isWorkingDay(adjustedStartDate)) {
        adjustedStartDate.setDate(adjustedStartDate.getDate() + 1);
        adjustedStartDate.setHours(0, 0, 0, 0);
      }
      adjustedStartDate.setHours(workStartHours, workStartMinutes, 0, 0);
    }

    const networkDays = calculationUtils.networkDaysIntl(
      adjustedStartDate,
      endDate,
      holidays
    );

    if (networkDays === 0) return 0;

    const getMedTime = (date) => {
      if (!isWorkingDay(date)) {
        return workDayEnd;
      }
      const hours =
        date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
      return Math.max(workDayStart, Math.min(hours, workDayEnd));
    };

    const startMedTime = getMedTime(adjustedStartDate);
    const endMedTime = getMedTime(endDate);

    let result = 0;
    if (networkDays === 1) {
      if (isWorkingDay(adjustedStartDate) && isWorkingDay(endDate)) {
        result = endMedTime - startMedTime;
      }
    } else {
      const fullDaysPart = (networkDays - 1) * workDayLength;
      result = fullDaysPart + (endMedTime - startMedTime);
    }

    result = result > 0 ? parseFloat(result.toFixed(2)) : 0.0;
    return result;
  },
};

// Helper functions
function parseCustomDate(dateString) {
  const [datePart, timePart] = dateString.split(' ');
  const [month, day, year] = datePart.split('/');
  const [hours, minutes, seconds] = timePart.split(':');
  
  return new Date(
    `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
  );
}

function convertToISODate(dateStr) {
  if (!dateStr) return '';
  
  const [day, month, year] = dateStr.split('/');
  
  // Validate date components
  if (!day || !month || !year || day.length !== 2 || month.length !== 2 || year.length !== 4) {
    console.error('Invalid date format. Expected DD/MM/YYYY');
    return '';
  }

  return `${year}-${month}-${day}`;
}

const isWorkingDay = (date, holidays) => {
  const day = date.getDay();
  const dateTimestamp = new Date(date).setHours(0, 0, 0, 0);
  const holidayTimestamps = holidays.map(h => new Date(h).setHours(0, 0, 0, 0));
  return day !== 0 && day !== 6 && !holidayTimestamps.includes(dateTimestamp);
};

// Main data processing functions
export const readFileAsData = (file) => {
  return new Promise((resolve, reject) => {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.csv')) {
      Papa.parse(file, {
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error('Error parsing CSV file'));
            return;
          }
          resolve(results.data);
        },
        error: (error) => reject(error),
        skipEmptyLines: true
      });
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Error reading Excel file'));
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error('Unsupported file format. Please upload CSV or Excel files.'));
    }
  });
};

const getHolidaysForYears = (years) => {
  const uniqueYears = [...new Set(years)];
  const allHolidays = [];
  
  uniqueYears.forEach(year => {
    if (HOLIDAYS_BY_YEAR[year]) {
      allHolidays.push(...HOLIDAYS_BY_YEAR[year]);
    }
  });
  console.log(allHolidays,'all holidays')
  return allHolidays;
};

const processExcelData = (data) => {
  console.log(data,'sdfijsn')
  const headers = data[0].map((h) => h?.toString().trim() || "");
  const reqCreationDateIndex = headers.indexOf("Req. Creation Date");
  const historicalStatusChangeDateIndex = headers.indexOf(
      "Historical Status - Change Date"
  );

  const rows = data
      .slice(1)
      .filter((row) =>
          row.some((cell) => cell !== undefined && cell !== null && cell !== "")
      )
      .map((row) => {
          const newRow = [...row];
          while (newRow.length < headers.length) newRow.push("");
          if (reqCreationDateIndex !== -1 && newRow[reqCreationDateIndex]) {
              newRow[reqCreationDateIndex] = dateUtils.convertExcelDate(
                  newRow[reqCreationDateIndex]
              );
          }
          if (
              historicalStatusChangeDateIndex !== -1 &&
              newRow[historicalStatusChangeDateIndex]
          ) {
              newRow[historicalStatusChangeDateIndex] = dateUtils.convertExcelDate(
                  newRow[historicalStatusChangeDateIndex]
              );
          }
          return newRow;
      });

  // Identify empty columns (columns where all cells are empty)
  const emptyColumns = [];
  for (let col = 0; col < headers.length; col++) {
      const isHeaderEmpty = headers[col] === "";
      const isColumnEmpty = rows.every(row => row[col] === "" || row[col] === undefined || row[col] === null);
      
      if (isHeaderEmpty && isColumnEmpty) {
          emptyColumns.push(col);
      }
  }

  // Filter out empty columns (in reverse order to avoid index shifting)
  emptyColumns.reverse().forEach(col => {
      headers.splice(col, 1);
      rows.forEach(row => row.splice(col, 1));
  });

  const sortedRows = sortDataByRequestId(headers, rows);

  return { headers, rows: sortedRows };
};

const sortDataByRequestId = (headers, rows) => {
  const requestIdIndex = headers.indexOf("Request - ID");
  const changeDateIndex = headers.indexOf("Historical Status - Change Date");
  const changeTimeIndex = headers.indexOf("Historical Status - Change Time");

  if (requestIdIndex === -1) return rows; // If no Request ID column, return as-is

  // Group by Request ID
  const groupedData = rows.reduce((acc, row) => {
      const requestId = row[requestIdIndex];
      if (!acc[requestId]) acc[requestId] = [];
      acc[requestId].push(row);
      return acc;
  }, {});

  // Sort each group by date/time if available
  Object.keys(groupedData).forEach(id => {
      groupedData[id].sort((a, b) => {
          // Try to sort by change date + time if available
          if (changeDateIndex !== -1 && changeTimeIndex !== -1) {
              const dateA = a[changeDateIndex];
              const dateB = b[changeDateIndex];
              const timeA = a[changeTimeIndex];
              const timeB = b[changeTimeIndex];

              // Parse dates (DD/MM/YYYY)
              const [dayA, monthA, yearA] = dateA.split('/').map(Number);
              const [dayB, monthB, yearB] = dateB.split('/').map(Number);

              // Create Date objects
              const dateObjA = new Date(yearA, monthA - 1, dayA);
              const dateObjB = new Date(yearB, monthB - 1, dayB);

              // If dates are different, sort by date
              if (dateObjA.getTime() !== dateObjB.getTime()) {
                  return dateObjA - dateObjB;
              }

              // If dates are same, sort by time
              const [hoursA, minutesA, secondsA] = timeA.toString().padStart(6, '0').match(/.{1,2}/g).map(Number);
              const [hoursB, minutesB, secondsB] = timeB.toString().padStart(6, '0').match(/.{1,2}/g).map(Number);

              // Compare times
              if (hoursA !== hoursB) return hoursA - hoursB;
              if (minutesA !== minutesB) return minutesA - minutesB;
              return secondsA - secondsB;
          }
          return 0;
      });
  });

  // Flatten the grouped data back into an array
  return Object.values(groupedData).flat();
};

export const processFileData = (data) => {
  if (!data || data.length === 0) return null;
  
  const { headers, rows } = processExcelData(data);
  
  // Debug: Check if dates are being converted properly
  if (rows.length > 0) {
    const firstRow = rows[0];
    const reqCreationDateIndex = headers.indexOf("Req. Creation Date");
    const historicalChangeDateIndex = headers.indexOf("Historical Status - Change Date");
    console.log('Date conversion check:', {
      creationDate: firstRow[reqCreationDateIndex],
      changeDate: firstRow[historicalChangeDateIndex],
      creationDateFormat: firstRow[reqCreationDateIndex]?.includes('/') ? 'DD/MM/YYYY' : 'Other',
      changeDateFormat: firstRow[historicalChangeDateIndex]?.includes('/') ? 'DD/MM/YYYY' : 'Other'
    });
  }
  
  // Extract years from the data to determine which holidays to use
  const years = [];
  const reqCreationDateIndex = headers.indexOf("Req. Creation Date");
  const historicalChangeDateIndex = headers.indexOf("Historical Status - Change Date");
  
  rows.forEach(row => {
    // Extract year from creation date
    if (reqCreationDateIndex !== -1 && row[reqCreationDateIndex]) {
      const dateStr = String(row[reqCreationDateIndex]);
      let year;
      
      // Handle YYYY-MM-DD format
      if (dateStr.includes('-') && dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
        year = dateStr.split('-')[0];
      }
      // Handle DD/MM/YYYY format  
      else if (dateStr.includes('/')) {
        const dateParts = dateStr.split('/');
        if (dateParts.length === 3) {
          year = dateParts[2];
        }
      }
      
      if (year) years.push(year);
    }
    
    // Extract year from change date
    if (historicalChangeDateIndex !== -1 && row[historicalChangeDateIndex]) {
      const dateStr = String(row[historicalChangeDateIndex]);
      let year;
      
      // Handle YYYY-MM-DD format
      if (dateStr.includes('-') && dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
        year = dateStr.split('-')[0];
      }
      // Handle DD/MM/YYYY format
      else if (dateStr.includes('/')) {
        const dateParts = dateStr.split('/');
        if (dateParts.length === 3) {
          year = dateParts[2];
        }
      }
      
      if (year) years.push(year);
    }
  });
  
  // Get holidays for all years present in the data
  const relevantHolidays = getHolidaysForYears(years);

  const headerIndices = {
    reqCreationDate: headers.indexOf("Req. Creation Date"),
    creationTime: headers.indexOf("Creation Time"),
    historicalStatusFrom: headers.indexOf("Historical Status - Status From"),
    requestId: headers.indexOf("Request - ID"),
    historicalStatusTo: headers.indexOf("Historical Status - Status To"),
    reqStatusDescription: headers.indexOf("Req. Status - Description"),
    historicalChangeDate: headers.indexOf("Historical Status - Change Date"),
    historicalChangeTime: headers.indexOf("Historical Status - Change Time"),
    priorityDescription: headers.indexOf("Request - Priority Description"),
    reqClosingDate: headers.indexOf("Req. Closing Date"),
    reqTypeDescription: headers.indexOf("Req. Type - Description EN"),
  };

  YELLOW_FIELDS.forEach((field) => {
    if (!headers.includes(field)) {
      headers.push(field);
      headerIndices[field.toLowerCase()] = headers.length - 1;
    } else {
      headerIndices[field.toLowerCase()] = headers.indexOf(field);
    }
  });

  const firstPassRows = rows.map((row, index) => {
    const newRow = [...row];
    while (newRow.length < headers.length) newRow.push("");

    const statusFrom = (newRow[headerIndices.historicalStatusFrom] || "")
      .toString()
      .trim();
    const statusTo = (newRow[headerIndices.historicalStatusTo] || "")
      .toString()
      .trim();
    const requestId = newRow[headerIndices.requestId];
    const priority = (newRow[headerIndices.priorityDescription] || "P4 - Low")
      .toString()
      .trim();
    const priorityLevel = priority?.split(" ")[0];
    const creationDateVal = newRow[headerIndices.reqCreationDate];
    const creationTime = newRow[headerIndices.creationTime];
    const changeDateVal = newRow[headerIndices.historicalChangeDate];
    const changeTime = newRow[headerIndices.historicalChangeTime];
    const reqStatusDescription = (
      newRow[headerIndices.reqStatusDescription] || ""
    )
    const reqTypeDescription = (
      newRow[headerIndices.reqTypeDescription] || ""
    )
      .toString()
      .trim();

    const creationDateTime = dateUtils.parseDateTime(
      creationDateVal,
      creationTime
    );
    const changeDateTime = dateUtils.parseDateTime(changeDateVal, changeTime, index);

    const creationDate = creationDateTime ? new Date(creationDateTime) : null;
    const changeDate = changeDateTime ? new Date(changeDateTime) : null;

    const allowedStatusesTo = [
      "Work in progress", "Forwarded", "Assigned", 
      "Solved", "Suspended", "Pending for IT check","Awaiting external provider"
    ];
    const excludedStatusesFrom = [
      "Suspended", "Pending for IT check", 
      "Awaiting external provider"
    ];
    
    // Normalize comparison
    const isAllowedTo = allowedStatusesTo.some(
      s => s.toLowerCase() === statusTo.trim().toLowerCase()
    );
    const isExcludedFrom = excludedStatusesFrom.some(
      s => s.toLowerCase() === statusFrom.trim().toLowerCase()
    );
    
    newRow[headerIndices.resolsla] = 
      isAllowedTo && !isExcludedFrom ? "Yes" : " ";

    newRow[headerIndices.respsla] =
      index === 0 || requestId !== rows[index - 1]?.[headerIndices.requestId]
        ? "Yes"
        : " ";

    newRow[headerIndices.reqcrdtconc] =
      newRow[headerIndices.respsla] === "Yes" && creationDateTime
        ? `${dateUtils.formatDate(creationDate)} ${dateUtils.formatTime(
            creationTime
          )}`
        : " ";

    newRow[headerIndices.endtconc] = dateUtils.formatTime(changeTime);

    newRow[headerIndices.hischdtticonc] = changeDateTime
      ? `${dateUtils.formatDate(changeDate)} ${dateUtils.formatTime(
          changeTime
        )}`
      : " ";

    newRow[headerIndices.resolsow] = SLA_TABLE[priorityLevel]?.resolsow || 90;
    newRow[headerIndices.respsow] = SLA_TABLE[priorityLevel]?.respsow || 18;

    return newRow;
  });

  let lastProcessedRow = null;

  const processedRows = firstPassRows.map((row, index) => {
    const newRow = [...row];
    const requestId = newRow[headerIndices.requestId];
    const prevRow = index > 0 ? lastProcessedRow : null;
    const nextRow =
      index < firstPassRows.length - 1 ? firstPassRows[index + 1] : null;
    const prevRequestId = prevRow ? prevRow[headerIndices.requestId] : null;
    const nextRequestId = nextRow ? nextRow[headerIndices.requestId] : null;
    const statusTo = (newRow[headerIndices.historicalStatusTo] || "").toString().trim();

    if (
      newRow[headerIndices.resolsla] === "Yes" &&
      newRow[headerIndices.reqcrdtconc] &&
      newRow[headerIndices.hischdtticonc]
    ) {
      const startDate = parseCustomDate(newRow[headerIndices.reqcrdtconc]);
      const endDate = parseCustomDate(
        newRow[headerIndices.hischdtticonc] ||
          new Date().toLocaleString("en-GB")
      );

      const workingHours = calculationUtils.calculatePreDt(
        startDate,
        endDate,
        WORK_HOURS.start,
        WORK_HOURS.end,
        relevantHolidays,
        index
      );

      newRow[headerIndices.calcstdt] = workingHours.toFixed(2);
    } else {
      newRow[headerIndices.calcstdt] = "0";
    }

    newRow[headerIndices.refinedstdt] =
    parseFloat(newRow[headerIndices.calcstdt] || 0) < 0 ||
    (newRow[headerIndices.reqTypeDescription] || "").toString().trim() === "Service Request" ||
    relevantHolidays.includes(convertToISODate(newRow[headerIndices.historicalChangeDate])) // Column D
      ? "0"
      : newRow[headerIndices.calcstdt];
      
    if (
      newRow[headerIndices.respsla] !== "Yes" &&
      requestId === prevRequestId &&
      prevRow?.[headerIndices.hischdtticonc]
    ) {
      const startDate = parseCustomDate(prevRow[headerIndices.hischdtticonc]);
      const endDate = parseCustomDate(
        newRow[headerIndices.hischdtticonc] ||
          new Date().toLocaleString("en-GB")
      );

      const workingHours = calculationUtils.calculatePreDt(
        startDate,
        endDate,
        WORK_HOURS.start,
        WORK_HOURS.end,
        relevantHolidays,
        index
      );

      newRow[headerIndices.calcpredt] = workingHours.toFixed(2);
    } else {
      newRow[headerIndices.calcpredt] = "0.00";
    }

    newRow[headerIndices.reqcomp] = 
    (statusTo === "Closed" || statusTo === "Discarded") 
      ? "End" 
      : (nextRow && requestId !== nextRequestId)
        ? "Open" 
        : " ";

    newRow[headerIndices.refinedpredt] =
      parseFloat(newRow[headerIndices.calcpredt] || 0) < 0 ||
      (newRow[headerIndices.reqTypeDescription] || "").toString().trim() === "Service Request" ||
      relevantHolidays.includes(convertToISODate(newRow[headerIndices.historicalChangeDate]))
        ? "0"
        : newRow[headerIndices.calcpredt];

    newRow[headerIndices.elapsedtime] = (
      newRow[headerIndices.resolsla] === "Yes"
        ? (newRow[headerIndices.respsla] === "Yes"
            ? parseFloat(newRow[headerIndices.refinedstdt] || 0)
            : parseFloat(newRow[headerIndices.refinedpredt] || 0))
        : 0
    ).toFixed(2);

    let cumulativeHours = 0;
    if (requestId === prevRequestId) {
      cumulativeHours = parseFloat(prevRow[headerIndices.cumilative] || 0);
    }
    cumulativeHours += parseFloat(newRow[headerIndices.elapsedtime] || 0);
    newRow[headerIndices.cumilative] =
      cumulativeHours > 0 ? cumulativeHours.toFixed(2) : "0.00";

    newRow[headerIndices.resolrem] =
      requestId !== nextRequestId
        ? (
            parseFloat(newRow[headerIndices.resolsow]) -
            parseFloat(newRow[headerIndices.cumilative] || 0)
          ).toFixed(2)
        : "0";

    newRow[headerIndices.resprem] =
      newRow[headerIndices.respsla] === "Yes"
        ? parseFloat(newRow[headerIndices.respsow] || 0) -
          parseFloat(newRow[headerIndices.calcstdt] || 0)
        : (Number(prevRow?.[headerIndices.resprem]) || 0);
    newRow[headerIndices.resprem] = (newRow[headerIndices.resprem]||0)?.toFixed(2);

    if (requestId === nextRequestId) {
      newRow[headerIndices.rollover] = "2000 01";
    } else if (
      !["Closed", "Discarded"].includes(
        newRow[headerIndices.reqStatusDescription]
      )
    ) {
      const today = new Date();
      newRow[headerIndices.rollover] = `${today.getFullYear()} ${String(
        today.getMonth() + 1
      ).padStart(2, "0")}`;
    } else {
      let changeDate;
      try {
        const [datePart, timePart] =
          newRow[headerIndices.hischdtticonc].split(" ");
        const [month,day, year] = datePart.split("/").map(Number);
        changeDate = new Date(year, month - 1, day);
      } catch (error) {
        changeDate = null;
      }

      newRow[headerIndices.rollover] =
        changeDate && !isNaN(changeDate.getTime())
          ? `${changeDate.getFullYear()} ${String(
              changeDate.getMonth() + 1
            ).padStart(2, "0")}`
          : " ";
    }

    const currentRollover = newRow[headerIndices.rollover];
    newRow[headerIndices.dateRollover] = currentRollover;
    newRow[headerIndices.reqcrym] =
      currentRollover && currentRollover.trim() !== ""
        ? newRow[headerIndices.reqCreationDate]
          ? (() => {
              let creationDate;
              try {
                const [day,month, year] = newRow[
                  headerIndices.reqCreationDate
                ]
                  .split("/")
                  .map(Number);
                creationDate = new Date(year, month - 1, day);
                if (isNaN(creationDate.getTime())) {
                  return " ";
                }
                return `${creationDate.getFullYear()} ${String(
                  creationDate.getMonth() + 1
                ).padStart(2, "0")}`;
              } catch (error) {
                return " ";
              }
            })()
          : " "
        : "9999 12";

    newRow[headerIndices.dateReqCrYM] = newRow[headerIndices.reqCreationDate];
    newRow[headerIndices.dateRollover] = newRow[headerIndices.rollover];

    // Set DateReqCrYM to be exactly the same as ReqCrYM
    newRow[headerIndices.dateReqCrYM] = newRow[headerIndices.reqcrym];
    lastProcessedRow = newRow;
    
    return newRow;
  });

  return [headers, ...processedRows];
};

/**
 * Download processed SLA data as sla_report.xlsx (same formatting as legacy SLA Report page).
 * @param {Array[]} csvData - [headers, ...rows]
 */
export function downloadSlaReportXlsx(csvData) {
  if (!csvData || csvData.length === 0) return;

  const wb = XLSX.utils.book_new();
  const [headers, ...rows] = csvData;

  const formattedRows = rows.map((row) => {
    const newRow = [...row];
    const dateIndexes = [0, 7];
    const changeTimeIndex = headers.indexOf("Historical Status - Change Time");
    if (changeTimeIndex !== -1 && newRow[changeTimeIndex]) {
      const timeStr = newRow[changeTimeIndex].toString().padStart(6, "0");
      newRow[changeTimeIndex] = `${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}:${timeStr.slice(4, 6)}`;
    }

    dateIndexes.forEach((index) => {
      if (newRow[index]) {
        if (typeof newRow[index] === "string" && newRow[index].match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          const [dd, mm, yyyy] = newRow[index].split("/");
          newRow[index] = `${mm}/${dd}/${yyyy}`;
        } else if (typeof newRow[index] === "number") {
          const date = XLSX.SSF.parse_date_code(newRow[index]);
          newRow[index] = `${String(date.m).padStart(2, "0")}/${String(date.d).padStart(2, "0")}/${date.y}`;
        } else if (
          typeof newRow[index] === "string" &&
          newRow[index].match(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/)
        ) {
          const [datePart] = newRow[index].split(" ");
          const [dd, mm, yyyy] = datePart.split("/");
          newRow[index] = `${mm}/${dd}/${yyyy}`;
        }
      }
    });
    return newRow;
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...formattedRows]);

  const highlightCols = headers.reduce((acc, header, idx) => {
    if (YELLOW_FIELDS.includes(header)) acc[idx] = true;
    return acc;
  }, {});

  Object.keys(ws).forEach((key) => {
    if (key !== "!ref") {
      const col = XLSX.utils.decode_cell(key).c;
      if (highlightCols[col]) {
        ws[key].s = {
          fill: {
            patternType: "solid",
            fgColor: { rgb: "ADD8E6" },
          },
          font: {
            bold: XLSX.utils.decode_cell(key).r === 0,
          },
        };
      }
    }
  });

  XLSX.utils.book_append_sheet(wb, ws, "ProcessedData");
  XLSX.writeFile(wb, "sla_report.xlsx");
}

export { HOLIDAYS_BY_YEAR, YELLOW_FIELDS, SLA_TABLE, WORK_HOURS };
