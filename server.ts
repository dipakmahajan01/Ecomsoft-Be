/* eslint-disable no-console */
import server from './src';
import { initializeFirebase } from './src/firebase';
import { logsError } from './src/lib/utils';
import { mongooseConnection } from './src/mongodb';

const port = process.env.PORT || 8081;
/** Connect to Mongo */
(async () => {
  try {
    if (await mongooseConnection()) {
      initializeFirebase();
      console.time(`⚡️ server started with 👍🏼 database connected http://localhost:${port} in `);
      server.listen(port, () => {
        console.timeEnd(`⚡️ server started with 👍🏼 database connected http://localhost:${port} in `);
      });
    }
  } catch (error) {
    logsError(error);
    console.timeEnd(`👎🏻 database connection has some problem : ${JSON.stringify(error)}`);
  }
})();
