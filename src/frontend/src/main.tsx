import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {ApolloProviderWrapper} from "@/api";
import './index.css'
import {Router} from "@/router.tsx";
import {Toaster} from "@/components/ui/sonner";
import {AppErrorBoundary} from "@/components/errors/ErrorBoundary.tsx";
import logger, {remoteLogger} from "@/services/logger.ts";

if (import.meta.env.MODE === 'development') {
    logger.setLevel('debug');
} else if (import.meta.env.MODE === 'production') {
    logger.setLevel('warn');

    // Set up remote logging in production
    if (import.meta.env.VITE_LOGS_ENDPOINT) {
        remoteLogger.configure({
            endpoint: import.meta.env.VITE_LOGS_ENDPOINT,
            batchSize: 10,
        });
    }
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AppErrorBoundary>
            <ApolloProviderWrapper>
                <Router/>
            </ApolloProviderWrapper>
            <Toaster/>
        </AppErrorBoundary>
    </StrictMode>,
);
