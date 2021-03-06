import GMR from 'graphql-merge-resolvers';
import resolversMailMutation from './email';
import resolversGenreMutation from './genre';
import userMutation from './user';

const mutationResolvers = GMR.merge([
    userMutation,
    resolversGenreMutation,
    resolversMailMutation
]);

export default mutationResolvers;