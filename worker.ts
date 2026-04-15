import { startEmailWorker, closeEmailWorker } from '@/lib/email/sender';
import { connectDB, disconnectDB } from '@/lib/db/client';

async function main() {
    console.log('Starting email worker...');
    try {
        await connectDB();
        startEmailWorker();

        process.on('SIGINT', async () => {
            console.log('\n SIGINT received. Shutting down gracefully...');
            await closeEmailWorker();
            await disconnectDB();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            console.log('\n SIGTERM received. Shutting down gracefully...');
            await closeEmailWorker();
            await disconnectDB();
            process.exit(0);
        });
    } catch (error) {
        console.error('Worker startup failed:', error);
        process.exit(1);
    }
};

main();