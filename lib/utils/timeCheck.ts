/**
 * Utility functions for checking quiz result availability
 */

export const isResultAvailable = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Results are available from 8:30 PM (20:30) onwards
    return (hours > 20) || (hours === 20 && minutes >= 30);
};

export const getTimeUntilResults = () => {
    const now = new Date();
    const target = new Date(now);
    target.setHours(20, 30, 0, 0);

    if (now > target) {
        // If it's already past 8:30 PM, the results are for tomorrow
        target.setDate(target.getDate() + 1);
    }

    const diff = target.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return {
        hours,
        minutes,
        seconds,
        totalSeconds: Math.floor(diff / 1000)
    };
};

export const formatTimeRemaining = (time: { hours: number, minutes: number, seconds: number }) => {
    return `${time.hours}h ${time.minutes}m ${time.seconds}s`;
};
