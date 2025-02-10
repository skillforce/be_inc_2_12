import supertest from 'supertest';
import { initApp } from '../../src/app';

export const testApp = initApp();
export const req = supertest(testApp);

export const cleanDB = async () => {
  await req.delete('/testing/all-data').expect(204);
};

export const accessTokenHeaderGenerator = (accessToken: string) => `Bearer ${accessToken}`;

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
