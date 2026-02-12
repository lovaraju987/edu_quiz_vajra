/**
<<<<<<< HEAD
 * Utility functions for quiz results timing control
 */

/**
 * Check if quiz results are available (after 8:30 PM)
 * @param quizDate - The date when the quiz was taken
 * @returns true if current time >= 8:30 PM of quiz date
 */
export function isResultsAvailable(quizDate: Date): boolean {
    // TEMPORARY: Always return true for testing
    return true;

    // ORIGINAL CODE (uncomment for production):
    // const releaseTime = new Date(quizDate);
    // releaseTime.setHours(20, 30, 0, 0); // 8:30 PM IST
    // return new Date() >= releaseTime;
}

/**
 * Get the results release time (8:30 PM of quiz date)
 * @param quizDate - The date when the quiz was taken
 * @returns Date object set to 8:30 PM of quiz date
 */
export function getResultsReleaseTime(quizDate: Date): Date {
    const releaseTime = new Date(quizDate);
    releaseTime.setHours(20, 30, 0, 0); // 8:30 PM IST
    return releaseTime;
}

/**
 * Get milliseconds until results release
 * @param quizDate - The date when the quiz was taken
 * @returns milliseconds until 8:30 PM, or 0 if already past
 */
export function getTimeUntilRelease(quizDate: Date): number {
    const releaseTime = getResultsReleaseTime(quizDate);
    const timeUntil = releaseTime.getTime() - Date.now();
    return Math.max(0, timeUntil);
}

/**
 * Format time remaining as human-readable string
 * @param milliseconds - Time remaining in milliseconds
 * @returns Formatted string like "2h 15m 30s"
 */
export function formatTimeRemaining(milliseconds: number): string {
    if (milliseconds <= 0) return "Available now";

    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    } else {
        return `${seconds}s`;
    }
}

/**
 * Check if a date is today
 * @param date - Date to check
 * @returns true if date is today
 */
export function isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
}
=======
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
>>>>>>> devepment-v/screen-compatibility
