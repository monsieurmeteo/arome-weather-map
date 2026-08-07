// Vérification via API GitHub si le workflow archive-history a tourné récemment
// URL : GET /repos/monsieurmeteo/minisite-douai/actions/workflows/archive-history.yml/runs

async function checkWorkflowRuns() {
    const resp = await fetch(
        'https://api.github.com/repos/monsieurmeteo/minisite-douai/actions/workflows/archive-history.yml/runs?per_page=7',
        { headers: { 'Accept': 'application/vnd.github+json' } }
    );
    const json = await resp.json();
    
    if (!json.workflow_runs) {
        console.log('Impossible de récupérer les runs (repo privé sans token)');
        return;
    }

    console.log('=== DERNIÈRES EXÉCUTIONS archive-history ===\n');
    json.workflow_runs.forEach(run => {
        const date = new Date(run.created_at).toLocaleString('fr-FR');
        const status = run.conclusion === 'success' ? '✅' : run.conclusion === 'failure' ? '❌' : '⏳';
        console.log(`${status} ${date} — ${run.conclusion || run.status}`);
    });
}

checkWorkflowRuns();
