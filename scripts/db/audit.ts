import { FEATURE_TABLES_WITHOUT_LOCAL_MIGRATION, runAudit } from './shared';

function printSection(title: string): void {
    console.log(`\n## ${title}`);
}

async function main(): Promise<void> {
    const audit = await runAudit();

    console.log(`# Live DB Audit`);
    console.log(`Generated at: ${audit.generatedAt}`);

    printSection('Tables');
    audit.tables.forEach((table) => {
        const status = table.exists ? 'ok' : 'missing';
        console.log(
            `- ${table.table}: status=${status}, rowCount=${table.rowCount ?? 'n/a'}, missingColumns=${table.missingColumns.length}`,
        );
        if (table.missingColumns.length > 0) {
            console.log(`  missing: ${table.missingColumns.join(', ')}`);
        }
        if (table.sampleColumns.length > 0) {
            console.log(`  sample: ${table.sampleColumns.join(', ')}`);
        }
        if (table.error) {
            console.log(`  error: ${table.error}`);
        }
    });

    printSection('Issues');
    if (audit.issues.length === 0) {
        console.log('- none');
    } else {
        audit.issues.forEach((issue) => {
            console.log(`- [${issue.severity}] ${issue.key}: ${issue.message}`);
            if (issue.count !== undefined) {
                console.log(`  count: ${issue.count}`);
            }
            if (issue.sample !== undefined) {
                console.log(`  sample: ${JSON.stringify(issue.sample)}`);
            }
        });
    }

    printSection('Migration Gaps');
    FEATURE_TABLES_WITHOUT_LOCAL_MIGRATION.forEach((table) => {
        console.log(`- ${table}`);
    });
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
