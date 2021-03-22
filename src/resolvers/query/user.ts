import { IResolvers } from 'graphql-tools';
import { COLLECTIONS, EXPIRETIME, MESSAGES } from '../../config/constants';
import JWT from '../../lib/jwt';
import bcrypt from 'bcrypt';
import { findElements, findOneElement } from '../../lib/db-operations';
import UsersService from './../../services/users.service';

const resolversUserQuery: IResolvers = {
    Query: {
        async users(_, { page, itemsPage }, context) {
            return new UsersService(_, {
                pagination: { page, itemsPage },
            }, context).items();
        },

        async login(_, { email, password }, context) {
            return new UsersService(_, { user: { email, password } }, context).login();
        },

        me(_, __, { token }) {
            return new UsersService(_, __, { token }).auth();
        }
    },
};

export default resolversUserQuery;