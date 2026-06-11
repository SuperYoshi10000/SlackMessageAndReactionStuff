import { OAUTH_RETURN_URL } from '$env/static/private';

export async function GET({  }) {
    return new Response("", { status: 301, headers: { Location: OAUTH_RETURN_URL } });
}