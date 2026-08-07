import dns from 'dns';

dns.resolve4('aws-1-eu-west-1.pooler.supabase.com', (err, addresses) => {
    if (err) {
        console.error('❌ Error resolving IPv4 1:', err);
    } else {
        console.log('✅ IPv4 1 Addresses:', addresses);
    }
});

dns.resolve4('aws-0-eu-central-1.pooler.supabase.com', (err, addresses) => {
    if (err) {
        console.error('❌ Error resolving IPv4 2:', err);
    } else {
        console.log('✅ IPv4 2 Addresses:', addresses);
    }
});
