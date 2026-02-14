/**
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
