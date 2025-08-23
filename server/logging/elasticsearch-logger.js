const winston = require('winston');
require('dotenv').config();

class ElasticsearchLogger {
  constructor() {
    this.logger = null;
    this.initializeLogger();
  }

  initializeLogger() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'arcsphere' },
      transports: [
        // Console transport for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        // File transport for persistence
        new winston.transports.File({
          filename: 'logs/arcsphere.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        })
      ]
    });
  }

  // Log levels
  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  error(message, meta = {}) {
    this.logger.error(message, meta);
  }

  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }

  // Specialized logging methods
  logUserInteraction(userId, action, details = {}) {
    this.info('User interaction', {
      userId,
      action,
      ...details
    });
  }

  logAIRequest(userId, model, prompt, responseTime, success = true) {
    this.info('AI request processed', {
      userId,
      model,
      promptLength: prompt.length,
      responseTime,
      success
    });
  }

  logAPIRequest(method, url, statusCode, responseTime, userId = null, ip = null) {
    this.info('API request', {
      method,
      url,
      statusCode,
      responseTime,
      userId,
      ip
    });
  }

  logSystemEvent(eventType, details = {}) {
    this.info('System event', {
      eventType,
      ...details
    });
  }

  logError(error, context = {}) {
    this.error('Application error', {
      error: error.message,
      stack: error.stack,
      ...context
    });
  }
}

module.exports = new ElasticsearchLogger();
