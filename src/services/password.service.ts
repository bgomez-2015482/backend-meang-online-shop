import { COLLECTIONS, EXPIRETIME } from '../config/constants';
import { findOneElement, updateOneElement } from '../lib/db-operations';
import JWT from '../lib/jwt';
import { IContextData } from './../interfaces/context.data.intreface';
import MailService from './mail.service';
import ResolversOperationsService from './resolvers.operations.service';
import bcrypt from 'bcrypt';

class PasswordService extends ResolversOperationsService {
    constructor(root: object, variables: object, context: IContextData) {
        super(root, variables, context);
    }

    async sendMail() {
        const email = this.getVariables().user?.email || '';
        if (email === undefined || email === '') {
            return {
                status: false,
                message: 'El email no se ha definido correctamente'
            };
        }
        // EXTRAER INFORMACIÓN DEL USUARIO
        const user = await findOneElement(this.getDb(), COLLECTIONS.USERS, { email });
        console.log(user);
        // SI EL USUARIO ES INDEFINIDO MOSTRAR MENSAJE QUE NO EXISTE EL USUARIO
        if (user === undefined || user === null) {
            return {
                status: false,
                message: `Usuario con el ${email} no existe`
            };
        }
        const newUser = {
            id: user.id,
            email
        };
        const token = new JWT().sign({ user: newUser }, EXPIRETIME.M15);
        const html = `Para cambiar la contraseña haz click en el siguiente botón. <a href="${process.env.CLIENT_URL}/#/reset/${token}"><button>Cambiar contraseña</button></a>`;
        const mail = {
            to: email,
            subject: 'Cambio de contraseña',
            html
        };
        return new MailService().send(mail);
    }

    async change() {
        const id = this.getVariables().user?.id;
        let password = this.getVariables().user?.password;
        // COMPROBAR QUE EL ID ES CORRECTO Y NO EN BLANCO
        if (id === undefined || id === '') {
            return {
                status: false,
                message: 'El ID necesita información correcta'
            };
        }
        // COMPROBAR QUE LA CONTRASEÑA ES CORRECTA: QUE EL ID ES CORRECTO Y NO EN BLANCO
        if (password === undefined || password === '' || password === '1234') {
            return {
                status: false,
                message: 'La contraseña necesita información correcta'
            };
        }
        // ENCRIPTAR LA CONTRASEÑA
        password = bcrypt.hashSync(password, 10);

        //ACTUALIZAR EN EL ID SELECCIONADO DE LA COLECCIÓN USUARIOS
        const result = await this.update(
            COLLECTIONS.USERS,
            { id },
            { password },
            'users'
        );
        return {
            status: result.status,
            message: (result.status) ? 'Contraseña modificada correctamente' : result.message
        };
    }
}

export default PasswordService;