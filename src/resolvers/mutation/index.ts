import GMR from 'graphql-merge-resolvers';
import userMutation from './user';

const mutationResolvers = GMR.merge([
    userMutation
]);

export default mutationResolvers;