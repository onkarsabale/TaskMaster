import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app.js';
import { env } from '../../config/env.js';

describe('Auth Module Integration Tests', () => {
    beforeAll(async () => {
        // Connect to a test database if possible, or use the dev one (be careful!)
        // Usually we use a separate test DB URI
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(env.MONGO_URI);
        }
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser' + Date.now(),
                email: `test${Date.now()}@example.com`,
                password: 'password123',
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body).toHaveProperty('username');
    });

    it('should not register a user with an existing email', async () => {
        const email = `duplicate${Date.now()}@example.com`;
        await request(app)
            .post('/api/auth/register')
            .send({
                username: 'user1',
                email,
                password: 'password123',
            });

        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'user2',
                email,
                password: 'password123',
            });

        expect(res.status).toBe(409);
        expect(res.body.message).toBe('User already exists');
    });
});
