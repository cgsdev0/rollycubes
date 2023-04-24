use anyhow::Error;
use tokio_postgres::Client;

mod embedded {
    use refinery::embed_migrations;
    embed_migrations!("migrations");
}

pub async fn run_migrations(client: &mut Client) -> std::result::Result<(), Error> {
    println!("Running DB migrations...");
    let migration_report = embedded::migrations::runner().run_async(client).await?;

    for migration in migration_report.applied_migrations() {
        println!(
            "Migration Applied -  Name: {}, Version: {}",
            migration.name(),
            migration.version()
        );
    }

    println!("DB migrations finished!");

    Ok(())
}
