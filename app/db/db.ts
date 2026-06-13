import { App, Installation, InstallationQuery, InstallationStore } from '@slack/bolt';
import pg from 'pg';

let pool: pg.Pool;
let client: pg.PoolClient;

export async function init() {
    pool = new pg.Pool({
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        host: process.env.POSTGRES_HOST || 'localhost',
        port: Number(process.env.POSTGRES_PORT || 5432),
        database: process.env.POSTGRES_DATABASE
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
    try {
        console.log('Got code for user:', userId);
        const token = await slackClient.oauth.v2.access({
            client_id: process.env.SLACK_CLIENT_ID!,
            client_secret: process.env.SLACK_CLIENT_SECRET!,
            code,
            redirect_uri: `${process.env.OAUTH_REDIRECT_URI}/${userId}`
        });
        console.log('Got token for user:', userId);
        const res3 = await client.query('DELETE FROM user_oauth WHERE user_id = $1; INSERT INTO users (user_id, token) VALUES ($1, $2)', [userId, token]);
        return token;
    } catch (error) {
        console.error('Error getting oauth token', error);
        return null;
    }
}

export async function clearUserAuth(userId: string) {
    const res = await client.query('DELETE FROM users WHERE user_id = $1', [userId]);
    return res.rowCount && res.rowCount > 0;
}

export function getInstallationStore(): InstallationStore {
    return {
        storeInstallation: async (installation) => {
            // Org-wide installation
            if (installation.isEnterpriseInstall && installation.enterprise !== undefined) {
                await client.query('INSERT INTO installations (ws_id, installation) VALUES ($1, $2)', [installation.enterprise.id, installation]);
                return;
            }
            // Single team installation
            if (installation.team !== undefined) {
                await client.query('INSERT INTO installations (ws_id, installation) VALUES ($1, $2)', [installation.team.id, installation]);
                return;
            }
            throw new Error('Failed saving installation data to installationStore');
        },
        fetchInstallation: async (installQuery) => {
            // Org-wide installation lookup
            if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
                return (await client.query('SELECT * FROM installations WHERE ws_id = $1', [installQuery.enterpriseId])).rows[0]?.installation;
            }
            // Single team installation lookup
            if (installQuery.teamId !== undefined) {
                return (await client.query('SELECT * FROM installations WHERE ws_id = $1', [installQuery.teamId])).rows[0]?.installation;
            }
            throw new Error('Failed fetching installation');
        },
        deleteInstallation: async (installQuery) => {
            // Org-wide installation deletion
            if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
                await client.query('DELETE FROM installations WHERE ws_id = $1', [installQuery.enterpriseId]);
                return;
            }
            // Single team installation deletion
            if (installQuery.teamId !== undefined) {
                await client.query('DELETE FROM installations WHERE ws_id = $1', [installQuery.teamId]);
                return;
            }
            throw new Error('Failed to delete installation');
        },
    };
}
