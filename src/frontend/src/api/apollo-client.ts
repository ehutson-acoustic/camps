import {ApolloClient, ApolloLink, HttpLink, InMemoryCache} from '@apollo/client';

// Set up HTTP link
const httpLink = new HttpLink({
    uri: import.meta.env.VITE_GRAPHQL_API_URL ?? 'http://localhost:8080/graphql',
});

// Set up error handling
const errorLink = new ApolloLink((operation, forward) => {
    return forward(operation).map((response) => {
        if (response.errors && response.errors.length > 0) {
            console.error('GraphQL Errors:', response.errors);
        }
        return response;
    });
});

// Create cache configuration
const cache = new InMemoryCache();

// Initialize Apollo Client
const apolloClient = new ApolloClient({
    link: ApolloLink.from([errorLink, httpLink]),
    cache,
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'cache-and-network',
            errorPolicy: 'all',
        },
        query: {
            fetchPolicy: 'network-only',
            errorPolicy: 'all',
        },
        mutate: {
            errorPolicy: 'all',
        },
    },
});

export default apolloClient;