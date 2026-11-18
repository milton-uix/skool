const SUPABASE_URL = 'https://kmzcdnhukctlelxhpftu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttemNkbmh1a2N0bGVseGhwZnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQzNTA3MzAsImV4cCI6MjEwOTkyNjczMH0.TJ8fZELddK6LSYDPG9np-L9lGL2Ds4iVEIxgOwNwYJo';

async function testSignIn(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const json = await res.json();
  return json;
}

async function main() {
  const s1 = await testSignIn('blessing@skool.local', 'SkoolParent2026!');
  console.log('Blessing Login Status:', s1.access_token ? 'SUCCESS, Token issued for ' + s1.user.email : s1);

  const s2 = await testSignIn('vime.gold@skool.local', 'SkoolParent2026!');
  console.log('Vime Gold Login Status:', s2.access_token ? 'SUCCESS, Token issued for ' + s2.user.email : s2);
}

main();

