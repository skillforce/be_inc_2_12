import supertest from 'supertest';
import { initApp } from '../src/app';

export const req = supertest(initApp());
