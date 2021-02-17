import { IResolvers } from 'graphql-tools';
import { COLLECTIONS } from '../../config/constants';
import bcrypt from 'bcrypt';
import { asignDocumentId, findOneElement, insertOneElement } from '../../lib/db-operations';

const userMutation: IResolvers = {
    Mutation: {
        async register(_, { user }, { db }) {
            //COMPROBAR QUE EL USUARIO NO EXISTA
            const userCheck = await findOneElement(db, COLLECTIONS.USERS, { email: user.email });
            if (userCheck !== null) {
                return {
                    status: false,
                    message: `El email ${user.email} ya esta en uso, prueba utilizar uno diferente`,
                    user: null
                };
            }
            // COMPROBAR EL ÚLTIMO USUARIO REGISTRADO PARA ASIGNAR ID
            user.id = await asignDocumentId(db, COLLECTIONS.USERS, { registerDate: -1 });
            //ASIGNAR LA FECHA EN FORMATO ISO EN LA PROPIEDAD REGISTER DATE
            user.registerDate = new Date().toISOString();
            //ENCRIPTAR CONTRASEÑA
            user.password = bcrypt.hashSync(user.password, 10);
            //GUARDAR EL DOCUMENTO REGISTRO EN LA COLECCIÓN
            return await insertOneElement(db, COLLECTIONS.USERS, user).then(
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

export default userMutation;