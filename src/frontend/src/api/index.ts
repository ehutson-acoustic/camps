// Export Apollo client and provider
export { default as apolloClient } from './apollo-client';
export { default as ApolloProviderWrapper } from './apollo-provider';

// Export GraphQL operations
export * from './operations/employee';
export * from './operations/rating';
export * from './operations/action-items';
export * from './operations/stats';
export * from './operations/team';

// Export hooks
export * from './hooks/useEmployees';
export * from './hooks/useRatings';
export * from './hooks/useActionItems';
export * from './hooks/useStats';
export * from './hooks/useTeams';
