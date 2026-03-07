import { runAudit } from './shared';

async function main(): Promise<void> {
    const audit = await runAudit();
    const errors = audit.issues.filter((issue) => issue.severity === 'error');
    const warnings = audit.issues.filter((issue) => issue.severity === 'warn');

    console.log(`DB health-check generated at ${audit.generatedAt}`);
    console.log(`errors=${errors.length} warnings=${warnings.length}`);

    if (audit.tables.some((table) => !table.exists || table.missingColumns.length > 0)) {
        console.log('Schema drift detected:');
        audit.tables
            .filter((table) => !table.exists || table.missingColumns.length > 0)
            .forEach((table) => {
                console.log(`- ${table.table}: missingColumns=${table.missingColumns.join(', ') || 'none'} error=${table.error ?? 'none'}`);
            });
    }

    if (audit.issues.length > 0) {
        console.log('Issues:');
        audit.issues.forEach((issue) => {
            console.log(`- [${issue.severity}] ${issue.key}: ${issue.message}`);
            if (issue.count !== undefined) {
                console.log(`  count=${issue.count}`);
            }
        });
    }

    if (errors.length > 0) {
        process.exit(1);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
