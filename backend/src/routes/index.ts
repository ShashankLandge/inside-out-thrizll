import { Router } from 'express';
import { authRouter } from './auth';
import { usersRouter } from './users';
import { requestsRouter } from './requests';
import { roomsRouter } from './rooms';

export const api = Router();

api.use('/auth', authRouter);
api.use('/users', usersRouter);
api.use('/requests', requestsRouter);
api.use('/rooms', roomsRouter);
