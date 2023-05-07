const DB_NAMES = {
    node: 'node-api'
};

const PRODUCTS_MESSAGES = {
    ADD_PRODUCT: 'Product created successfully',
    GET_PRODUCTS: 'Products data fetched successfully'
}

const USERS_MESSAGES = {
    ADD_USER: 'User created successfully',
    GET_USERS: 'Users data fetched successfully'
}

const MESSAGES = {
    SENT_MESSAGE: 'Message sent successfully',
    GET_MESSAGES: 'Messages data fetched successfully'
}

const ACTIONS = {
    UPDATE: 'update',
    DELETE: 'delete',
    STATUS: 'status'
}

const USER_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    DELETED: 'deleted'
}

module.exports = { DB_NAMES, PRODUCTS_MESSAGES, ACTIONS, USERS_MESSAGES, USER_STATUS, MESSAGES };