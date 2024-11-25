import { OrdersApp } from './app';
import { AxiosClientHttp } from './external/axios-client-http.external';
import { DynamoDatabase } from './external/dynamo-database.external';

const database = new DynamoDatabase();
const clientHttp = new AxiosClientHttp();

const app = new OrdersApp(database, clientHttp);

app.start();
