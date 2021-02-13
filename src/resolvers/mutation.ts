import { IResolvers } from 'graphql-tools';
import { COLLECTIONS } from '../config/constants';
import bcrypt from 'bcrypt';

const resolversMutation: IResolvers = {
    Mutation: {
        async register(_, { user }, { db }) {
            //COMPROBAR QUE EL USUARIO NO EXISTA
            const userCheck = await db.collection(COLLECTIONS.USERS).findOne({ email: user.email });
            if (userCheck !== null) {
                return {
                    status: false,
                    message: `El email ${user.email} ya esta en uso, prueba utilizar uno diferente`,
                    user: null
                };
            }
            // COMPROBAR EL ÚLTIMO USUARIO REGISTRADO PARA ASIGNAR ID
            const lastUser = await db.collection(COLLECTIONS.USERS).
                find().
                limit(1).
                sort({ registerDate: -1 }).toArray();
            if (lastUser.length === 0) {
                user.id = 1;
            } else {
                user.id = lastUser[0].id + 1;
            }
            //ASIGNAR LA FECHA EN FORMATO ISO EN LA PROPIEDAD REGISTER DATE
            user.registerDate = new Date().toISOString();
            //ENCRIPTAR CONTRASEÑA
            user.password = bcrypt.hashSync(user.password, 10);
            //GUARDAR EL DOCUMENTO REGISTRO EN LA COLECCIÓN
            return await db.collection(COLLECTIONS.USERS).insertOne(user).then(
                async () => {
                    return {
                        status: true,
                        message: `El usuario con el email ${user.email} ha sido registrado correctamente`,
                        user
                    };
                }
            ).catch((err: Error) => {
                console.log(err.message);
                return {
                    status: true,
                    message: `Error inesperado`,
                    user: null
                };
            });
        }
    }
};

export default resolversMutation;