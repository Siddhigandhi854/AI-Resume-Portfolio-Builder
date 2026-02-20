const isProduction = process.env.NODE_ENV === 'production';

const formatMessage = (level, message, meta) => {
  const base = {
    level,
    message,
    timestamp: new Date().toISOString()
  };

  if (meta) {
    base.meta = meta;
  }

  return isProduction ? JSON.stringify(base) : `[${base.timestamp}] [${level.toUpperCase()}] ${message}`;
};

const logger = {
  info(message, meta) {
    // eslint-disable-next-line no-console
    console.log(formatMessage('info', message, meta));
  },
  warn(message, meta) {
    // eslint-disable-next-line no-console
    console.warn(formatMessage('warn', message, meta));
  },
  error(messageOrError, meta) {
    const message =
      messageOrError instanceof Error
        ? `${messageOrError.message}${messageOrError.stack ? `\n${messageOrError.stack}` : ''}`
        : messageOrError;
    // eslint-disable-next-line no-console
    console.error(formatMessage('error', message, meta));
  }
};

module.exports = logger;

