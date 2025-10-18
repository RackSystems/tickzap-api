import express, {Express} from 'express';
import dotenv from 'dotenv';
import routes from './routes/api';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import ErrorHandler from "./app/middlewares/ErrorHandler";

// Import and start BullMQ workers
import './app/workers/agentProcessingWorker';
import './app/workers/agentResponseWorker';

dotenv.config();

const app: Express = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3001'],
  credentials: true,
}));

app.use('/', routes);

app.use(ErrorHandler)

const port = process.env.PORT ?? 3000;

console.log('[Server] BullMQ workers initialized.');

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
