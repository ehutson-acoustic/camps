import {useCallback, useMemo} from 'react';
import {createLogger, LogContext} from '@/services/logger';

export function useLogger(context: LogContext = {}) {
    // Create a component-specific logger
    const logger = useMemo(() => {
        return createLogger(context);
    }, [context]);

    // Add component name for easier debugging
    const getComponentLogger = useCallback((componentName: string) => {
        return logger.addContext({component: componentName});
    }, [logger]);

    return {
        logger,
        getComponentLogger
    };
}