import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
const app: Application = express();

//<------------------ All Router Import-------------->
import { globalErrorHandeler } from './apps/middlewares/globalErrorHandelar';
import httpStatus from 'http-status';
import router from './apps/routes';
import cookieParser from 'cookie-parser';

app.use(bodyParser.json({ limit: '10mb' }));
// cors use & cookieparse
const allowedOrigins = [
  'http://localhost:3000',
  'http://192.168.31.103:3000',
  'https://note-management-iota.vercel.app',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // mobile apps / postman

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
  })
);

app.options('*', cors());
app.use(cookieParser());
//data base first data load

// parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/Iuploads', express.static(path.join(__dirname, 'Iuploads')));

// router
app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  res.send('server is runing');
});

//global Error Handelar
app.use(globalErrorHandeler);

//route not found handlendeling
app.use((req: Request, res: Response, next: NextFunction) => {
  if (!res.headersSent) {
    res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: 'Not Found',
      errorMessages: [
        {
          path: req.originalUrl,
          message: 'API Not Found',
        },
      ],
    });
  }
  next();
});

export default app;
