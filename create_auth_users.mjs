const SUPABASE_URL = 'https://kmzcdnhukctlelxhpftu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttemNkbmh1a2N0bGVseGhwZnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQzNTA3MzAsImV4cCI6MjEwOTkyNjczMH0.TJ8fZELddK6LSYDPG9np-L9lGL2Ds4iVEIxgOwNwYJo';

async function signupUser(email, password, fullName, roleLabel) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password,
      data: {
        full_name: fullName,
        role_label: roleLabel
      }
    })
  });

  const json = await res.json();
  return json;
}

async function main() {
  const u1 = await signupUser('blessing.parent@skoolapp.com', 'SkoolParent2026!', 'Blessing', 'Mother');
  console.log('Blessing result:', u1?.user?.id ? 'Created ' + u1.user.id : u1);

  const u2 = await signupUser('vime.parent@skoolapp.com', 'SkoolParent2026!', 'Vime Gold', 'Father');
  console.log('Vime Gold result:', u2?.user?.id ? 'Created ' + u2.user.id : u2);
}

main();
