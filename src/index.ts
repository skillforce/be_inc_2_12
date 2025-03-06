import { initApp } from './app';
import { APP_CONFIG } from './app_config';
import { db } from './db/composition-root';

const app = initApp();

const startServer = async () => {
  console.log(db);
  await db.connect(APP_CONFIG.MONGO_URL);

  app.listen(APP_CONFIG.PORT, () => {
    console.log('app started on port ' + APP_CONFIG.PORT);
  });
};

startServer();
