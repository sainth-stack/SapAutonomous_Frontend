// src/components/toast.js

import React from 'react';

const Toast = ({ message, onClose, type }) => {
    const toastStyles = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
    };

    return (
        <div className={`fixed top-4 right-4 p-4 rounded shadow-md ${toastStyles[type]} `} style={{zIndex:9999}}>
            <div className="flex justify-between items-center">
                <span>{message}</span>
                <button onClick={onClose} className="ml-4 text-white font-bold">✖</button>
            </div>
        </div>
    );
};

export default Toast;
