use tokio_postgres::NoTls;

mod embedded {
    use refinery::embed_migrations;
    embed_migrations!("migrations");
}

#[tokio::main]
async fn main() {
    run_migrations().await.expect("can run DB migrations: {}");
}

type Error = Box<dyn std::error::Error + Send + Sync + 'static>;

async fn run_migrations() -> std::result::Result<(), Error> {
    println!("Running DB migrations...");
    let (mut client, con) = tokio_postgres::connect("host=localhost user=test password=test", NoTls).await?;

    tokio::spawn(async move {
        if let Err(e) = con.await {
            eprintln!("connection error: {}", e);
        }
    });
    let migration_report = embedded::migrations::runner()
        .run_async(&mut client)
        .await?;

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
