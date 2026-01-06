import React from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';

export const ContributionGraph = ({ data, year, getValue }) => {
    // Generate days
    const days = [];
    const curr = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);

    while (curr <= end) {
        days.push(new Date(curr));
        curr.setDate(curr.getDate() + 1);
    }

    const dataMap = new Map();
    data.forEach(d => {
        dataMap.set(d.date, d);
    });

    const getIntensity = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        const entry = dataMap.get(dateStr);
        return entry ? getValue(entry) : 0;
    };

    // Group by Week
    const deepDays = [...days];
    const weeks = [];
    let currentWeek = [];

    const startDay = deepDays[0].getDay();
    for (let i = 0; i < startDay; i++) {
        currentWeek.push(null);
    }

    deepDays.forEach(day => {
        currentWeek.push(day);
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });
    if (currentWeek.length > 0) weeks.push(currentWeek);

    const getBg = (rating) => {
        if (rating === 0) return 'bg-[#1e1e24]';
        if (rating === -2) return 'bg-red-600';
        if (rating === -1) return 'bg-red-900/60';
        if (rating === 1) return 'bg-green-900/60';
        if (rating === 2) return 'bg-green-600';
        if (rating === 3) return 'bg-green-400';
        return 'bg-[#1e1e24]';
    };

    return (
        <div className="flex flex-col gap-2 overflow-x-auto custom-scrollbar pb-2">
            <div className="flex gap-1 min-w-max">
                {weeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-1">
                        {week.map((day, dIdx) => {
                            if (!day) return <div key={dIdx} className="w-2 h-2" />;

                            const rating = getIntensity(day);
                            const dateStr = day.toISOString().split('T')[0];

                            return (
                                <div
                                    key={day.toISOString()}
                                    title={`${dateStr}: ${rating}`}
                                    className={`w-2 h-2 rounded-sm transition-colors ${getBg(rating)}`}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};
