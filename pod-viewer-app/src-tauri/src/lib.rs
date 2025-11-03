use tauri::command;
use std::process::Command;

#[command]
fn get_pods(namespace: Option<String>) -> Result<String, String> {
    let mut cmd = Command::new("minikube");

    let mut args: Vec<String> = vec!["kubectl".into(), "--".into(), "get".into(), "pods".into()];

    match namespace {
        Some(ns) if ns.to_lowercase() != "all" => {
            args.push("-n".into());
            args.push(ns);
        }
        _ => {
            args.push("-A".into());
        }
    }

    let arg_refs: Vec<&str> = args.iter().map(|s| s.as_str()).collect();

    cmd.args(&arg_refs);

    let output = cmd.output().map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).into_owned())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).into_owned())
    }
}

#[command]
fn get_namespaces() -> Result<String, String> {
    let output = Command::new("minikube")
        .args(["kubectl", "--", "get", "namespaces", "-o", "name"])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).into_owned())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).into_owned())
    }
}

#[command]
fn get_logs(pod_name: String, namespace: Option<String>) -> Result<String, String> {
    let mut cmd = Command::new("minikube");

    let mut args: Vec<String> = vec![
        "kubectl".into(),
        "--".into(),
        "logs".into(),
        "-f".into(),
        pod_name,
    ];

    if let Some(ns) = namespace {
        if ns.to_lowercase() != "all" {
            args.push("-n".into());
            args.push(ns);
        }
    }

    let arg_refs: Vec<&str> = args.iter().map(|s| s.as_str()).collect();

    cmd.args(&arg_refs);

    let output = cmd.output().map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).into_owned())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).into_owned())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_pods,
            get_namespaces,
            get_logs
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
