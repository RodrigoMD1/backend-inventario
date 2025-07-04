/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('Subscriptions e2e', () => {
  let app: INestApplication;
  let jwt: string;
  let storeId: string; // Cambiado a string (UUID)
  let subscriptionId: string; // Cambiado a string (UUID)

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, transformOptions: { enableImplicitConversion: true } }));
    await app.init();

    // Registro y login de usuario store
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'store1@test.com', password: 'password123' });
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'store1@test.com', password: 'password123' });
    jwt = loginRes.body.access_token;

    // Crear tienda para el usuario store
    const tiendaRes = await request(app.getHttpServer())
      .post('/stores')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ name: 'Tienda Test' });
    storeId = tiendaRes.body.id;
    console.log('storeId asignado en test:', storeId);
    // Esperar y recargar la tienda para asegurar persistencia
    await new Promise(res => setTimeout(res, 300));
    // Opcional: intentar obtener la tienda explícitamente
    // const tiendaGet = await request(app.getHttpServer())
    //   .get(`/stores/${storeId}`)
    //   .set('Authorization', `Bearer ${jwt}`);
    // console.log('Tienda recargada:', tiendaGet.body);
  }, 20000); // Aumenta el timeout a 20 segundos

  it('debe crear una suscripción', async () => {
    const res = await request(app.getHttpServer())
      .post('/subscriptions')
      .set('Authorization', `Bearer ${jwt}`)
      .send({
        status: 'active',
        startDate: new Date().toISOString(),
        storeId: storeId,
      });
    if (res.status !== 201) {
      // Imprime el error para debug
      console.error('Error al crear suscripción:', res.body);
    }
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    subscriptionId = res.body.id;
  }, 20000);

  it('debe obtener la suscripción creada', async () => {
    const res = await request(app.getHttpServer())
      .get(`/subscriptions/${subscriptionId}`)
      .set('Authorization', `Bearer ${jwt}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(subscriptionId);
  }, 10000);

  it('debe listar todas las suscripciones', async () => {
    const res = await request(app.getHttpServer())
      .get('/subscriptions')
      .set('Authorization', `Bearer ${jwt}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  }, 10000);

  it('debe denegar acceso sin JWT', async () => {
    const res = await request(app.getHttpServer())
      .get('/subscriptions');
    expect(res.status).toBe(401);
  }, 5000);

  afterAll(async () => {
    await app.close();
  });
});
