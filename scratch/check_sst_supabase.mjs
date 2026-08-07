async function check() {
    const url = `https://ubdevaemtwbzxksjlhjg.supabase.co/storage/v1/object/public/vigilance-captures/sst_france.png?t=${Date.now()}`;
    const res = await fetch(url, { method: 'HEAD' });
    console.log('SST Image status:', res.status, res.statusText);
    console.log('Content-Length:', res.headers.get('content-length'));
    console.log('Last-Modified:', res.headers.get('last-modified'));

    const metaUrl = `https://ubdevaemtwbzxksjlhjg.supabase.co/storage/v1/object/public/vigilance-captures/sst_metadata.json?t=${Date.now()}`;
    const metaRes = await fetch(metaUrl);
    if (metaRes.ok) {
        const meta = await metaRes.json();
        console.log('SST Metadata:', JSON.stringify(meta, null, 2));
    } else {
        console.log('SST Metadata: NOT FOUND yet (status', metaRes.status, ')');
    }
}
check();
