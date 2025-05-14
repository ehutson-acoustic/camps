import {ErrorBoundary as ReactErrorBoundary} from 'react-error-boundary';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {XCircle} from 'lucide-react';
import React, {useEffect} from "react";
import {createLogger} from "@/services/logger.ts";

const logger = createLogger({module: 'ErrorBoundary'});

function ErrorFallback({error, resetErrorBoundary}: Readonly<{ error: Error; resetErrorBoundary: () => void }>) {
    // Log the error
    useEffect(() => {
        logger.error(error, {
            url: window.location.href,
            component: 'ErrorBoundary',
            stack: error.stack
        });
    }, [error]);

    return (
        <Card className="w-full max-w-md mx-auto mt-16">
            <CardHeader className="text-destructive">
                <XCircle className="h-8 w-8 mb-2"/>
                <CardTitle>Something went wrong</CardTitle>
                <CardDescription>An error occurred in the application</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-sm bg-muted p-3 rounded-md overflow-auto">
                    <p className="font-mono">{error.message}</p>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={resetErrorBoundary} className="w-full">
                    Try again
                </Button>
            </CardFooter>
        </Card>
    );
}

export function AppErrorBoundary({children}: Readonly<{ children: React.ReactNode }>) {
    return (
        <ReactErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => {
                // Reset the state of your app here
                window.location.href = '/';
            }}
            onError={(error, info) => {
                logger.error(error, {
                    componentStack: info.componentStack,
                    type: 'react-error-boundary',
                });
            }}
        >
            {children}
        </ReactErrorBoundary>
    );
}