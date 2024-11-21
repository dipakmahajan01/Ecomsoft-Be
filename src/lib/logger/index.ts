import * as winston from 'winston';
import dayjs from 'dayjs';

class TimestampFirst {
  enabled: boolean;

  constructor(enabled = true) {
    this.enabled = enabled;
  }

  transform(obj: any) {
    if (this.enabled) {
      return { timestamp: obj.timestamp, ...obj };
    }
    return obj;
  }
}

const myFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  new TimestampFirst(true),
  winston.format.json(),
);

const logger = winston.createLogger({
  level: 'info',
  // format: winston.format.json(),
  format: myFormat,
  transports: [
    new winston.transports.File({
      filename: `./logs/error_${dayjs(new Date()).format('DD-MM-YYYY')}.log`,
      level: 'error',
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

export default logger;
