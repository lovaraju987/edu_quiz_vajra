export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { initCronJob } = await import('@/lib/cron-scheduler');
        initCronJob();
    }
}
