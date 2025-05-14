// src/frontend/src/api/apollo-logging-link.ts
import {ApolloLink} from '@apollo/client';
import {v4 as uuidV4} from 'uuid';
import logger from '@/services/logger';

export const loggingLink = new ApolloLink((operation, forward) => {
    const requestId = uuidV4();
    const operationLogger = logger.addContext({
        requestId,
        operation: operation.operationName
    });

    // Log the request
    const startTime = new Date().getTime();
    operationLogger.debug(`GraphQL Request: ${operation.operationName}`, {
        query: operation.query.loc?.source.body,
        variables: operation.variables,
    });

    return forward(operation).map((response) => {
        // Calculate request duration
        const duration = new Date().getTime() - startTime;

        if (response.errors) {
            // Log errors
            operationLogger.error(`GraphQL Error in ${operation.operationName} (${duration}ms)`, {
                errors: response.errors,
                data: response.data,
            });
        } else {
            // Log success
            operationLogger.debug(`GraphQL Response: ${operation.operationName} (${duration}ms)`, {
                data: response.data ? 'Data received' : 'No data',
            });
        }

        return response;
    });
});