import { createClient } from 'npm:@supabase/supabase-js@2.108.2';

type ErrorBody = {
  error: string;
};

function jsonResponse(body: { success: true } | ErrorBody, status: number): Response {
  return Response.json(body, {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Authentication is required.' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error('Missing required Supabase environment variables.');
    return jsonResponse({ error: 'Account deletion is temporarily unavailable.' }, 500);
  }

  const accessToken = authorization.slice('Bearer '.length);
  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser(accessToken);

  if (userError || !user) {
    return jsonResponse({ error: 'Your session is invalid or has expired.' }, 401);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id, false);

  if (deleteError) {
    console.error('Unable to delete authenticated user.', deleteError);
    return jsonResponse({ error: 'Unable to delete account.' }, 500);
  }

  return jsonResponse({ success: true }, 200);
});
