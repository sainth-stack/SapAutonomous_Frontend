import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const HolidayList = () => {
    const [holidaysByYear, setHolidaysByYear] = useState({});
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [uploadMessage, setUploadMessage] = useState({ text: '', type: '' });
    const [isImporting, setIsImporting] = useState(false);

    // Load holidays from localStorage on component mount
    useEffect(() => {
        const storedHolidays = localStorage.getItem('holidaysByYear');
        if (storedHolidays) {
            setHolidaysByYear(JSON.parse(storedHolidays));
        } else {
            // Initialize with default holidays if none exist
            const defaultHolidays = {
                "2023": ["2023-01-01", "2023-01-14", "2023-01-26", "2023-04-04", "2023-04-07", "2023-04-14", "2023-05-01", "2023-06-29", "2023-08-15", "2023-09-10", "2023-10-02", "2023-10-24", "2023-12-25"],
                "2024": ["2024-01-01", "2024-01-14", "2024-01-26", "2024-03-25", "2024-03-29", "2024-04-11", "2024-05-01", "2024-06-17", "2024-08-15", "2024-09-10", "2024-10-02", "2024-10-31", "2024-12-25"],
            };
            setHolidaysByYear(defaultHolidays);
            localStorage.setItem('holidaysByYear', JSON.stringify(defaultHolidays));
        }
    }, []);

    // Save holidays to localStorage whenever they change
    useEffect(() => {
        if (Object.keys(holidaysByYear).length > 0) {
            localStorage.setItem('holidaysByYear', JSON.stringify(holidaysByYear));
        }
    }, [holidaysByYear]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsImporting(true);
        setUploadMessage({ text: '', type: '' });

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const newHolidays = {};

                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    
                    if (jsonData.length > 0) {
                        const year = sheetName;
                        const holidays = jsonData
                            .filter(row => row[0])
                            .map(row => {
                                if (typeof row[0] === 'number') {
                                    const date = XLSX.SSF.parse_date_code(row[0]);
                                    return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
                                }
                                return row[0].toString().trim();
                            })
                            .filter(date => /^\d{4}-\d{2}-\d{2}$/.test(date));

                        newHolidays[year] = holidays;
                    }
                });

                setHolidaysByYear(newHolidays);
                setUploadMessage({ text: 'Holiday list imported successfully!', type: 'success' });
            } catch (error) {
                console.error('Error processing file:', error);
                setUploadMessage({ text: 'Error processing file. Please check the format.', type: 'error' });
            } finally {
                setIsImporting(false);
                setTimeout(() => setUploadMessage({ text: '', type: '' }), 3000);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const exportToExcel = () => {
        const workbook = XLSX.utils.book_new();
        
        Object.entries(holidaysByYear).forEach(([year, holidays]) => {
            const worksheetData = holidays.map(date => [date]);
            const worksheet = XLSX.utils.aoa_to_sheet([['Date'], ...worksheetData]);
            XLSX.utils.book_append_sheet(workbook, worksheet, year);
        });

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(data, 'holiday_list.xlsx');
    };

    const removeHoliday = (year, date) => {
        setHolidaysByYear(prev => ({
            ...prev,
            [year]: prev[year].filter(d => d !== date)
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 ml-20">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Holiday Calendar</h1>
                        <p className="text-gray-600 mt-1 ml-3">Manage and track company holidays</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
                        <label className="relative cursor-pointer">
                            <div className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2">
                                {isImporting ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Importing...
                                    </span>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        <span>Import Holidays</span>
                                    </>
                                )}
                            </div>
                            <input 
                                type="file" 
                                accept=".xlsx,.xls" 
                                onChange={handleFileUpload}
                                className="hidden"
                                disabled={isImporting}
                            />
                        </label>
                        <button 
                            onClick={exportToExcel}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm6.293-7.707a1 1 0 011.414 0L13 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span>Export Holidays</span>
                        </button>
                    </div>
                </div>

                {uploadMessage.text && (
                    <div className={`mb-6 p-4 rounded-lg ${uploadMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        {uploadMessage.text}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">Holidays</h2>
                            <div className="mt-3 sm:mt-0">
                                <select 
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                >
                                    {Object.keys(holidaysByYear).sort((a, b) => b - a).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {holidaysByYear[selectedYear]?.length > 0 ? (
                                        holidaysByYear[selectedYear].map(date => {
                                            const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
                                            return (
                                                <tr key={date} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {date}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {dayName}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button 
                                                            onClick={() => removeHoliday(selectedYear, date)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                                                No holidays scheduled for {selectedYear}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HolidayList;