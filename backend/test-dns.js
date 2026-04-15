const dns = require('dns');

console.log('🔍 Probando resolución de DNS...');

dns.lookup('db.fbjvafoikjkdyfsvikvu.supabase.co', (err, address) => {
  if (err) {
    console.error('❌ Error DNS:', err.message);
  } else {
    console.log('✅ IP encontrada:', address);
  }
});

dns.lookup('google.com', (err, address) => {
  if (err) {
    console.error('❌ Google no resuelve:', err.message);
  } else {
    console.log('✅ Google resuelve a:', address);
  }
});