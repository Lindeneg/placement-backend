export const COORDINATES_FROM_ADDRESS_FAILED_VALUE: number   = 0xFFFF << 2;
export const isDebug                              : boolean  = process.env.NODE_ENV === 'development';
export const requiredEnvVars                      : string[] = [
    'MAP_QUEST_API_KEY',
    'MONGO_DB_USER',
    'MONGO_DB_KEY',
    'MONGO_DB_NAME',
    'MONGO_DB_CLUSTER',
    'JWT_PRIVATE_TOKEN',
    'WHITELISTED_DOMAIN',
    'PORT'
];