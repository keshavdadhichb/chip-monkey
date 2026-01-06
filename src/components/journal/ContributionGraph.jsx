import React from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';

export const ContributionGraph = ({ data, year, getValue }) => {
    // Generate all days for the year
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const days = [];
    let currentDate = new Date(startDate);

    // Align to start on Sunday for the grid visualization
    // If Jan 1st is Wednesday (3), add 3 nulls before
    const startOffset = startDate.getDay();
    for (let i = 0; i < startOffset; i++) {
        days.push(null);
    }

    while (currentDate <= endDate) {
        days.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    const dataMap = new Map();
    data.forEach(d => {
        dataMap.set(d.date, d);
    });

    const getIntensity = (date) => {
        if (!date) return 0;
        const dateStr = date.toISOString().split('T')[0];
        const entry = dataMap.get(dateStr);
        return entry ? getValue(entry) : 0;
    };

    const getBg = (rating) => {
        if (rating === 0) return 'bg-[#1e1e24]';
        if (rating === -2) return 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]';
        if (rating === -1) return 'bg-red-900/40 border-[0.5px] border-red-900';
        if (rating === 1) return 'bg-green-900/40 border-[0.5px] border-green-900';
        if (rating === 2) return 'bg-green-600 shadow-[0_0_10px_rgba(22,163,74,0.5)]';
        if (rating === 3) return 'bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.8)]';
        return 'bg-[#1e1e24]';
    };

    return (
        <div className="overflow-x-auto pb-2 custom-scrollbar">
            <div className="grid grid-rows-7 grid-flow-col gap-1 w-max">
                {days.map((day, idx) => {
                    const rating = day ? getIntensity(day) : 0;
                    const dateStr = day ? day.toISOString().split('T')[0] : `empty-${idx}`;

                    return (
                        <div
                            key={idx}
                            title={day ? `${dateStr}: ${rating}` : ''}
                            className={`w-3 h-3 rounded-[2px] transition-all duration-300 hover:scale-125 ${day ? getBg(rating) : 'bg-transparent'}`}
                        />
                    );
                })}
            </div>
            {/* Minimal Month labels could go here if needed, but keeping it clean for now */}
        </div>
    );
};
