import { IResolvers } from 'graphql-tools';

const resolversProductQuery: IResolvers = {
    Query: {
        products() {
            return true;
        }
    },
};

export default resolversProductQuery;