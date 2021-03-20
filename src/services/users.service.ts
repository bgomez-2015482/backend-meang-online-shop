import { COLLECTIONS, MESSAGES } from '../config/constants';
import bcrypt from 'bcrypt';
import { IContextData } from '../interfaces/context.data.intreface';
import { asignDocumentId, findOneElement } from '../lib/db-operations';
import ResolversOperationsService from './resolvers.operations.service';
import JWT from '../lib/jwt';

class UsersService extends ResolversOperationsService {
    private collection = COLLECTIONS.USERS;
    constructor(root: object, variables: object, context: IContextData) {
        super(root, variables, context);
    }

    //LISTA DE USUARIOS
    async items() {
        const result = await this.list(this.collection, 'usuarios');
        return { status: result.status, message: result.message, users: result.items };
    }

    //AUTENTICACIÓN
    async auth() {
        let info = new JWT().verify(this.getContext().token!);
        if (info === MESSAGES.TOKEN_VERIFICATION_FAILED) {
            return {
                status: false,
                message: info,
                user: null
            };
        }
        return {
            status: true,
            message: 'Usuario autenticado correctamente mediante el token',
            user: Object.values(info)[0]
        };
    }

    //INICIAR SESIÓN
    async login() {
        try {
            const variables = this.getVariables().user;
            const user = await findOneElement(this.getDb(), this.collection, { email: variables?.email });
            if (user === null) {
                return {
                    status: false,
                    message: 'Usuario no encontrado',
                    token: null
                };
            }

            const passwordCheck = bcrypt.compareSync(variables?.password, user.password);
            if (passwordCheck !== null) {
                delete user.password;
                delete user.birthday;
                delete user.registerDate;
            }
            return {
                status: passwordCheck,
                message: !passwordCheck
                    ? 'El usuario o la contraseña son incorrectos'
                    : 'Usuario logueado correctamente',
                token: !passwordCheck
                    ? null
                    : new JWT().sign({ user }, /*EXPIRETIME.H24*/60),
                user: !passwordCheck
                    ? null
                    : user,
            };
        } catch (error) {
            console.log(error);
            return {
                status: false,
                message: 'Error al cargar el usuario comprueba que tienes correctamente todo',
                token: null
            };
        }
    }

    //REGISTRAR UN USUARIO
    async register() {
        const user = this.getVariables().user;
        //COMPROBAR QUE USER NO ES NULL
        if (user === null) {
            return {
                status: false,
                message: 'Usuario no definido, procura definirlo',
                user: null
            };
        }
        if (user?.password === null ||
            user?.password === undefined ||
            user?.password === '') {
            return {
                status: false,
                message: 'Usuario sin contraseña, procura definirlo',
                user: null
            };
        }
        //COMPROBAR QUE EL USUARIO NO EXISTA
        const userCheck = await findOneElement(this.getDb(), this.collection, { email: user?.email });
        if (userCheck !== null) {
            return {
                status: false,
                message: `El email ${user?.email} ya esta en uso, prueba utilizar uno diferente`,
                user: null
            };
        }
        // COMPROBAR EL ÚLTIMO USUARIO REGISTRADO PARA ASIGNAR ID
        user!.id = await asignDocumentId(this.getDb(), this.collection, { registerDate: -1 });
        //ASIGNAR LA FECHA EN FORMATO ISO EN LA PROPIEDAD REGISTER DATE
        user!.registerDate = new Date().toISOString();
        //ENCRIPTAR CONTRASEÑA
        user!.password = bcrypt.hashSync(user!.password, 10);

        const result = await this.add(this.collection, user || {}, 'usuario');
        //GUARDAR EL DOCUMENTO REGISTRO EN LA COLECCIÓN
        return {
            status: result.status,
            message: result.message,
            user: result.item
        };
    }

    //MODIFICAR UN USUARIO
    async modify() {
        const user = this.getVariables().user;
        //COMPROBAR QUE NO ES NULL
        if (user === null) {
            return {
                status: false,
                message: 'Usuario no definido, procura definirlo',
                user: null
            };
        }
        const filter = { id: user?.id };
        const result = await this.update(this.collection, filter, user || {}, 'usuario');
        return {
            status: result.status,
            message: result.message,
            user: result.item
        };
    }

    //ELIMINAR UN USUARIO SELECCIONADO
    async delete() {
        const id = this.getVariables().id;
        if (id === undefined || id === '') {
            return {
                status: false,
                message: 'Identificador del usuario no definido.',
                user: null
            };
        }
        const result = await this.del(this.collection, { id }, 'usuario');
        return {
            status: result.status,
            message: result.message
        };
    }
}


export default UsersService;