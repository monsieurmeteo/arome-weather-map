const fs = require('fs');
async function getLogs() {
    try {
        const resp = await fetch('https://api.github.com/repos/monsieurmeteo/minisite-douai/actions/workflows/archive-history.yml/runs?per_page=5', {
            headers: { 'Accept': 'application/vnd.github+json' }
        });
        const json = await resp.json();
        const runs = json.workflow_runs.filter(r => r.conclusion === 'failure');
        if (runs.length > 0) {
            const runId = runs[0].id;
            console.log("Failed run ID:", runId);
            const jobsResp = await fetch(`https://api.github.com/repos/monsieurmeteo/minisite-douai/actions/runs/${runId}/jobs`, {
                headers: { 'Accept': 'application/vnd.github+json' }
            });
            const jobsJson = await jobsResp.json();
            const jobId = jobsJson.jobs[0].id;
            console.log("Job ID:", jobId);
            
            // We can't easily download the raw log without authentication if it's a private repo, 
            // but we can try to fetch the job steps to see which step failed
            const steps = jobsJson.jobs[0].steps;
            const failedStep = steps.find(s => s.conclusion === 'failure');
            console.log("Failed step:", failedStep.name);
        }
    } catch(e) { console.error(e); }
}
getLogs();
