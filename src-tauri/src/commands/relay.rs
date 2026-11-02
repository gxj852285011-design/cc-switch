use std::fs;
#[allow(unused_imports)]
use std::path::{Path, PathBuf};
use serde_json::{json, Value};

#[tauri::command]
pub async fn apply_relay_config(
    tool_id: String,
    api_key: String,
    base_url: String,
) -> Result<bool, String> {
    tauri::async_runtime::spawn_blocking(move || {
        apply_relay_config_internal(&tool_id, &api_key, &base_url)
    })
    .await
    .map_err(|e| format!("专线配置执行失败: {e}"))?
}

#[tauri::command]
pub async fn apply_claude_relay_config(
    apiKey: String,
    baseUrl: String,
    #[allow(non_snake_case)] _model: Option<String>,
) -> Result<bool, String> {
    apply_relay_config("claude".to_string(), apiKey, baseUrl).await
}

#[tauri::command]
pub async fn apply_codex_relay_config(
    apiKey: String,
    baseUrl: String,
    #[allow(non_snake_case)] _model: Option<String>,
) -> Result<bool, String> {
    apply_relay_config("codex".to_string(), apiKey, baseUrl).await
}

#[tauri::command]
pub async fn apply_gemini_relay_config(
    apiKey: String,
    baseUrl: String,
    #[allow(non_snake_case)] _model: Option<String>,
) -> Result<bool, String> {
    apply_relay_config("gemini".to_string(), apiKey, baseUrl).await
}

fn apply_relay_config_internal(tool_id: &str, api_key: &str, base_url: &str) -> Result<bool, String> {
    let clean_key = api_key.trim();
    let clean_url = base_url.trim().trim_end_matches('/');

    match tool_id {
        "claude-desktop" => {
            apply_claude_desktop_config(clean_key, clean_url)?;
        }
        "claude" | "claude-code" => {
            apply_claude_code_config(clean_key, clean_url)?;
        }
        "codex" | "chatgpt" => {
            apply_codex_config(clean_key, clean_url)?;
        }
        "gemini" | "agy" => {
            apply_gemini_config(clean_key, clean_url)?;
        }
        _ => {
            log::info!("[relay] 针对通用工具写入默认配置: {tool_id}");
        }
    }
    Ok(true)
}

fn apply_claude_desktop_config(api_key: &str, base_url: &str) -> Result<(), String> {
    let home = crate::config::get_home_dir();
    
    #[cfg(target_os = "macos")]
    let (normal_dir, threep_dir) = {
        let app_support = home.join("Library").join("Application Support");
        (app_support.join("Claude"), app_support.join("Claude-3p"))
    };
    #[cfg(windows)]
    let (normal_dir, threep_dir) = {
        let local_app_data = std::env::var_os("LOCALAPPDATA")
            .map(PathBuf::from)
            .unwrap_or_else(|| home.join("AppData").join("Local"));
        (local_app_data.join("Claude"), local_app_data.join("Claude-3p"))
    };
    #[cfg(target_os = "linux")]
    let (normal_dir, threep_dir) = {
        let config_dir = home.join(".config");
        (config_dir.join("Claude"), config_dir.join("Claude-3p"))
    };

    let config_library_dir = threep_dir.join("configLibrary");
    fs::create_dir_all(&normal_dir).map_err(|e| format!("创建 Claude 目录失败: {e}"))?;
    fs::create_dir_all(&config_library_dir).map_err(|e| format!("创建 Claude-3p/configLibrary 目录失败: {e}"))?;

    // 1. 更新主目录 claude_desktop_config.json 中的 deploymentMode: "3p"
    let normal_cfg_file = normal_dir.join("claude_desktop_config.json");
    let mut normal_json: Value = if normal_cfg_file.exists() {
        fs::read_to_string(&normal_cfg_file)
            .ok()
            .and_then(|s| serde_json::from_str(&s).ok())
            .unwrap_or_else(|| json!({}))
    } else {
        json!({})
    };
    if let Some(obj) = normal_json.as_object_mut() {
        obj.insert("deploymentMode".to_string(), json!("3p"));
        obj.entry("coworkUserFilesPath".to_string()).or_insert_with(|| json!(home.join("Claude").to_string_lossy().to_string()));
    }
    fs::write(&normal_cfg_file, serde_json::to_string_pretty(&normal_json).unwrap_or_default())
        .map_err(|e| format!("写入 Claude 配置失败: {e}"))?;

    // 2. 更新 Claude-3p 目录中的 claude_desktop_config.json
    let threep_cfg_file = threep_dir.join("claude_desktop_config.json");
    let mut threep_json: Value = if threep_cfg_file.exists() {
        fs::read_to_string(&threep_cfg_file)
            .ok()
            .and_then(|s| serde_json::from_str(&s).ok())
            .unwrap_or_else(|| json!({}))
    } else {
        json!({})
    };
    if let Some(obj) = threep_json.as_object_mut() {
        obj.insert("deploymentMode".to_string(), json!("3p"));
        obj.entry("coworkUserFilesPath".to_string()).or_insert_with(|| json!(home.join("Claude").to_string_lossy().to_string()));
    }
    fs::write(&threep_cfg_file, serde_json::to_string_pretty(&threep_json).unwrap_or_default())
        .map_err(|e| format!("写入 Claude-3p 配置失败: {e}"))?;

    // 3. 写入 _meta.json 声明已挂载 AI Agent Hub 专线网关
    let meta_file = config_library_dir.join("_meta.json");
    let meta_json = json!({
        "entries": [
            {
                "id": "00000000-0000-4000-8000-000000157210",
                "name": "AI Agent Hub"
            }
        ],
        "appliedId": "00000000-0000-4000-8000-000000157210"
    });
    fs::write(&meta_file, serde_json::to_string_pretty(&meta_json).unwrap_or_default())
        .map_err(|e| format!("写入 _meta.json 失败: {e}"))?;

    // 4. 写入 00000000-0000-4000-8000-000000157210.json 网关 Profile
    let profile_file = config_library_dir.join("00000000-0000-4000-8000-000000157210.json");
    let profile_json = json!({
        "coworkEgressAllowedHosts": ["*"],
        "disableDeploymentModeChooser": true,
        "inferenceGatewayApiKey": api_key,
        "inferenceGatewayAuthScheme": "bearer",
        "inferenceGatewayBaseUrl": base_url,
        "inferenceProvider": "gateway",
        "inferenceModels": [
            {"name": "claude-sonnet-5"},
            {"name": "claude-opus-5"},
            {"name": "claude-haiku-4-5"}
        ]
    });
    fs::write(&profile_file, serde_json::to_string_pretty(&profile_json).unwrap_or_default())
        .map_err(|e| format!("写入 profile 失败: {e}"))?;

    log::info!("[relay] 成功写入 Claude Desktop 3p 专线网关配置 (Base: {base_url})");
    Ok(())
}

fn apply_claude_code_config(api_key: &str, base_url: &str) -> Result<(), String> {
    let home = crate::config::get_home_dir();
    let claude_dir = home.join(".claude");
    fs::create_dir_all(&claude_dir).map_err(|e| format!("创建 .claude 目录失败: {e}"))?;
    let settings_path = claude_dir.join("settings.json");

    let mut settings: Value = if settings_path.exists() {
        fs::read_to_string(&settings_path)
            .ok()
            .and_then(|s| serde_json::from_str(&s).ok())
            .unwrap_or_else(|| json!({}))
    } else {
        json!({})
    };

    if let Some(obj) = settings.as_object_mut() {
        let env_val = obj.entry("env").or_insert_with(|| json!({}));
        if let Some(env_obj) = env_val.as_object_mut() {
            env_obj.insert("ANTHROPIC_BASE_URL".to_string(), json!(base_url));
            env_obj.insert("ANTHROPIC_API_KEY".to_string(), json!(api_key));
        }
    }
    fs::write(&settings_path, serde_json::to_string_pretty(&settings).unwrap_or_default())
        .map_err(|e| format!("写入 Claude Code settings.json 失败: {e}"))?;

    log::info!("[relay] 成功写入 Claude Code ~/.claude/settings.json 专线配置");
    Ok(())
}

fn apply_codex_config(api_key: &str, base_url: &str) -> Result<(), String> {
    let home = crate::config::get_home_dir();
    let codex_dir = home.join(".codex");
    fs::create_dir_all(&codex_dir).map_err(|e| format!("创建 .codex 目录失败: {e}"))?;

    // 1. 更新 ~/.codex/auth.json
    let auth_path = codex_dir.join("auth.json");
    let mut auth: Value = if auth_path.exists() {
        fs::read_to_string(&auth_path)
            .ok()
            .and_then(|s| serde_json::from_str(&s).ok())
            .unwrap_or_else(|| json!({}))
    } else {
        json!({})
    };
    if let Some(obj) = auth.as_object_mut() {
        obj.insert("OPENAI_API_KEY".to_string(), json!(api_key));
    }
    let _ = fs::write(&auth_path, serde_json::to_string_pretty(&auth).unwrap_or_default());

    // 2. 更新 config.toml
    let config_path = codex_dir.join("config.toml");
    if !base_url.is_empty() {
        let mut config_str = fs::read_to_string(&config_path).unwrap_or_default();
        if !config_str.contains("openai_base_url") {
            config_str.push_str(&format!("\n# Relay Gateway\nopenai_base_url = \"{base_url}\"\n"));
            let _ = fs::write(&config_path, config_str);
        }
    }

    log::info!("[relay] 成功写入 Codex ~/.codex/auth.json 专线配置");
    Ok(())
}

fn apply_gemini_config(api_key: &str, base_url: &str) -> Result<(), String> {
    let home = crate::config::get_home_dir();
    let gemini_dir = home.join(".gemini");
    fs::create_dir_all(&gemini_dir).map_err(|e| format!("创建 .gemini 目录失败: {e}"))?;
    let settings_path = gemini_dir.join("settings.json");

    let mut settings: Value = if settings_path.exists() {
        fs::read_to_string(&settings_path)
            .ok()
            .and_then(|s| serde_json::from_str(&s).ok())
            .unwrap_or_else(|| json!({}))
    } else {
        json!({})
    };

    if let Some(obj) = settings.as_object_mut() {
        let env_val = obj.entry("env").or_insert_with(|| json!({}));
        if let Some(env_obj) = env_val.as_object_mut() {
            env_obj.insert("GEMINI_BASE_URL".to_string(), json!(base_url));
            env_obj.insert("GEMINI_API_KEY".to_string(), json!(api_key));
        }
    }
    let _ = fs::write(&settings_path, serde_json::to_string_pretty(&settings).unwrap_or_default());

    log::info!("[relay] 成功写入 Gemini ~/.gemini/settings.json 专线配置");
    Ok(())
}
