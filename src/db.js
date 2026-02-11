const { Sequelize } = require('sequelize');
const logger = require('./logger');

const isPostgres = !!process.env.POSTGRES_DB;

const sequelize = new Sequelize(
  process.env.POSTGRES_DB || 'devops_platform',
  process.env.POSTGRES_USER || 'antigravity',
  process.env.POSTGRES_PASSWORD || 'password123',
  {
    host: process.env.POSTGRES_HOST || 'localhost',
    dialect: isPostgres ? 'postgres' : 'sqlite',
    storage: isPostgres ? undefined : './database.sqlite',
    logging: (msg) => logger.debug(msg),
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
    // Sync models
    await sequelize.sync(); 
    logger.info('Database models synchronized.');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
  }
};

module.exports = { sequelize, connectDB };
