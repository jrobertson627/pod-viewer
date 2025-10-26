use tauri::command;
use std::process::Command;

#[command]
fn get_pods() -> Result<String, String> {
    let output = Command::new("minikube")
    .args(["kubectl", "--", "get", "pods", "-A"])
    .output()
    .map_err(|e| e.to_string())?;

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
        .invoke_handler(tauri::generate_handler![get_pods])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
