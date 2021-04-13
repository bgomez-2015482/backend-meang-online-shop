import { Db } from 'mongodb';
import Database from './database';
import { IPaginationOptions } from './../interfaces/pagination-options.interface';

/**
 * Obtener el ID que vamos a utilizar en el nuevo usuario
 * @param database Base de datos con la que estamos trabajando
 * @param collection Colección dónde queremos buscar el último elemento
 * @param sort Como queremos ordenarlo { <propietario>: -1 }
 */

export const asignDocumentId = async (
    database: Db,
    collection: string,
    sort: object = { registerDate: -1 }
) => {
    // COMPROBAR EL ÚLTIMO USUARIO REGISTRADO PARA ASIGNAR ID
    const lastElement = await database
        .collection(collection)
        .find()
        .limit(1)
        .sort(sort)
        .toArray();
    let exit = false;
    let index = 1;

    // Comprobamos que no existe el ID que vamos a asignar
    while (!exit) {
        const lastIndexPlus = lastElement.length === 0 ? '1' : String(+lastElement[0].id + index);
        const findItem = await findOneElement(database, collection, { id: String(+lastIndexPlus) });
        findItem ? index++ : exit = true;
    }
    return lastElement.length === 0 ? '1' : String(+lastElement[0].id + index);
};

export const findOneElement = async (
    database: Db,
    collection: string,
    filter: object
) => {
    return database.collection(collection).findOne(filter);
};

export const insertOneElement = async (
    database: Db,
    collection: string,
    document: object
) => {
    return database.collection(collection).insertOne(document);
};

export const updateOneElement = async (
    database: Db,
    collection: string,
    filter: object,
    updateObject: object
) => {
    return database.collection(collection).updateOne(
        filter,
        { $set: updateObject }
    );
};

export const deleteOneElement = async (
    database: Db,
    collection: string,
    filter: object = {}
) => {
    return await database.collection(collection).deleteOne(filter);
};

export const insertManyElements = async (
    database: Db,
    collection: string,
    document: Array<object>
) => {
    return await database.collection(collection).insertMany(document);
};

export const findElements = async (
    database: Db,
    collection: string,
    filter: object = {},
    paginationOptions: IPaginationOptions = {
        page: 1,
        pages: 1,
        itemsPage: -1,
        skip: 0,
        total: -1
    }
) => {
    if (paginationOptions.total === -1) {
        return await database.collection(collection).find(filter).toArray();
    }
    return await database.collection(collection).find(filter).limit(paginationOptions.itemsPage)
        .skip(paginationOptions.skip).toArray();
};

export const countElements = async (
    database: Db,
    collection: string,
    filter: object = {}
) => {
    return await database.collection(collection).countDocuments(filter);
};

