import React from 'react';
import { Link } from 'react-router-dom';

const Card = ({ title, Createdby, href, icon, heading, count, toggle, configureButton, specificType, author }) => {
    return (

        <div className='flex flex-col '>
            <div className="rounded-xl shadow-md border text-card-foreground cursor-pointer p-2">
                <Link to={href}></Link>
                <div className="flex justify-between items-center mb-2">
                    {/* Icon */}
                    <div className="text-3xl">
                        {icon}
                    </div>
                    {/* Toggle Switch */}
                    <div>
                        {toggle}
                    </div>
                </div>

                {/* Title and Heading */}
                <div className='text-md font-semibold'>
                    {title}
                </div>
                <div className='text-sm text-gray-500 mb-2'>
                    {heading}
                </div>

                {/* Count */}
                <div className="text-3xl mb-2">
                    {count}
                </div>

                {/* Specific Type */}
                <div className='text-sm text-gray-500 mb-2'>
                    {specificType}
                </div>

                {/* Configure Button */}
                <div>
                    {configureButton}
                </div>

                {/* Author Info */}
                <div className='text-sm text-gray-500 mt-2'>
                    {Createdby} {author}
                </div>
            </div>
        </div>
    );
};

export default Card;
