const fs = require('fs');
const files = [
    '20260307_001_backfill_missing_feature_tables.sql',
    '20260307_002_cleanup_orphans_and_normalize.sql',
    '20260307_003_harden_constraints_and_rls.sql'
];
for (const f of files) {
    const content = fs.readFileSync('d:/TFT-hoho/supabase/migrations/' + f, 'utf8');
    fs.writeFileSync('d:/TFT-hoho/tmp_' + f + '.txt', content);
}
console.log('Done writing files.');
