import supertest from 'supertest';
import { initApp } from '../src/app';

export const testApp = initApp();
export const req = supertest(testApp);
