import { App } from '@slack/bolt';
import pg from 'pg';

let pool: pg.Pool;
let client: pg.PoolClient;

export async function init() {
    pool = new pg.Pool({

    });
    client = await pool.connect();
}

export async function authorizeUser(slackClient: App['client'], userId: string) {
    const res0 = await client.query('SELECT token FROM users WHERE user_id = $1', [userId]);
    if (res0.rowCount) return res0.rows[0].token;

    const res1 = await client.query('DELETE FROM users WHERE user_id = $1', [userId]);

    const res2 = await client.query('SELECT code FROM user_oauth WHERE user_id = $1', [userId]).catch(e => null);
    if (!res2?.rowCount) return null;
    const code = res2.rows[0].code;
    const token = await slackClient.oauth.v2.access({
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        code
    });
    const res3 = await client.query('DELETE FROM user_oauth WHERE user_id = $1; INSERT INTO users (user_id, token) VALUES ($1, $2)', [userId, token]);
    return token;
}

export async function clearUserAuth(userId: string) {
    const res = await client.query('DELETE FROM users WHERE user_id = $1', [userId]);
    return res.rowCount && res.rowCount > 0;
}