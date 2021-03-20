import GMR from 'graphql-merge-resolvers';
import resolversGenreMutation from './genre';
import userMutation from './user';

const mutationResolvers = GMR.merge([
    userMutation,
    resolversGenreMutation
]);

export default mutationResolvers;