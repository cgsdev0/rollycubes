// Copyright 2023 Oxide Computer Company

use std::{env, fs, path::Path};

use typify::{TypeSpace, TypeSpaceImpl, TypeSpaceSettings};

fn main() {
    println!("cargo:rerun-if-changed=../schema.json");
    let mut ofile = Path::new(&env::var("SCHEMA_PATH").map_or_else(|_| "..".to_string(), |ok| ok))
        .to_path_buf();
    ofile.push("schema.json");
    let content = std::fs::read_to_string(ofile).unwrap();
    let schema = serde_json::from_str::<schemars::schema::RootSchema>(&content).unwrap();

    let mut type_space = TypeSpace::new(
        TypeSpaceSettings::default()
            .with_struct_builder(true)
            .with_conversion(
                schemars::schema::SchemaObject {
                    instance_type: Some(schemars::schema::InstanceType::String.into()),
                    format: Some("date".to_string()),
                    ..Default::default()
                },
                "chrono::DateTime<chrono::Utc>",
                [TypeSpaceImpl::Display].into_iter(),
            ),
    );
    type_space.add_root_schema(schema).unwrap();

    let contents = format!(
        "{}\n{}",
        "use serde::{Deserialize, Serialize};",
        prettyplease::unparse(&syn::parse2::<syn::File>(type_space.to_stream()).unwrap())
    );

    let mut out_file = Path::new(&env::var("OUT_DIR").unwrap()).to_path_buf();
    out_file.push("generated.rs");
    fs::write(out_file, contents).unwrap();
}
