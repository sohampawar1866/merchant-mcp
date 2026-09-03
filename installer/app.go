package main

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

// DockerStatus represents the current state of Docker on the system
type DockerStatus struct {
	Installed   bool   `json:"installed"`
	Running     bool   `json:"running"`
	ComposeCmd  string `json:"composeCmd"` // "docker compose" or "docker-compose"
	Message     string `json:"message"`
}

// LaunchResult is returned after docker compose up
type LaunchResult struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
}

// App holds application state
type App struct {
	ctx           context.Context
	projectRoot   string
	polling       bool
}

// NewApp creates the application instance
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. Finds the project root and begins Docker polling.
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// Resolve project root: installer is a subdirectory of the repo
	exe, _ := os.Executable()
	dir := filepath.Dir(exe)
	// In dev mode (wails dev), exe is in a temp dir; walk up to find docker-compose.yml
	a.projectRoot = findProjectRoot(dir)

	// Begin polling Docker status every 2 seconds
	go a.pollDockerStatus()
}

// findProjectRoot walks up from dir until it finds docker-compose.yml
func findProjectRoot(start string) string {
	dir := start
	for i := 0; i < 8; i++ {
		if _, err := os.Stat(filepath.Join(dir, "docker-compose.yml")); err == nil {
			return dir
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
	}
	// Fallback: use the directory one level above the installer binary
	return filepath.Dir(start)
}

// pollDockerStatus emits docker status to frontend every 2s
func (a *App) pollDockerStatus() {
	a.polling = true
	for a.polling {
		status := a.CheckDockerStatus()
		wailsRuntime.EventsEmit(a.ctx, "docker:status", status)
		time.Sleep(2 * time.Second)
	}
}

// CheckDockerStatus checks whether Docker is installed and running
func (a *App) CheckDockerStatus() DockerStatus {
	// 1. Is docker binary present?
	dockerPath, err := exec.LookPath("docker")
	if err != nil || dockerPath == "" {
		return DockerStatus{
			Installed:  false,
			Running:    false,
			ComposeCmd: "",
			Message:    "Docker is not installed on this machine.",
		}
	}

	// 2. Is the Docker daemon running?
	cmd := exec.Command("docker", "info")
	cmd.Env = os.Environ()
	if err := cmd.Run(); err != nil {
		return DockerStatus{
			Installed:  true,
			Running:    false,
			ComposeCmd: "",
			Message:    "Docker is installed but not running. Please start Docker Desktop.",
		}
	}

	// 3. Detect compose command (v2 built-in vs v1 standalone)
	composeCmd := detectComposeCmd()

	return DockerStatus{
		Installed:  true,
		Running:    true,
		ComposeCmd: composeCmd,
		Message:    "Docker is ready.",
	}
}

func detectComposeCmd() string {
	// Try docker compose (v2, built-in plugin)
	cmd := exec.Command("docker", "compose", "version")
	if err := cmd.Run(); err == nil {
		return "docker compose"
	}
	// Fall back to docker-compose (v1 standalone)
	if _, err := exec.LookPath("docker-compose"); err == nil {
		return "docker-compose"
	}
	return "docker compose" // best guess
}

// OpenDockerDesktop tries to launch Docker Desktop on the current OS
func (a *App) OpenDockerDesktop() {
	switch runtime.GOOS {
	case "darwin":
		exec.Command("open", "-a", "Docker").Start()
	case "windows":
		exec.Command("cmd", "/c", "start", "", `C:\Program Files\Docker\Docker\Docker Desktop.exe`).Start()
	case "linux":
		exec.Command("systemctl", "--user", "start", "docker-desktop").Start()
	}
}

// OpenInstallPage opens the OS-appropriate Docker install page in the browser
func (a *App) OpenInstallPage() {
	var url string
	switch runtime.GOOS {
	case "darwin":
		url = "https://docs.docker.com/desktop/install/mac-install/"
	case "windows":
		url = "https://docs.docker.com/desktop/install/windows-install/"
	default:
		url = "https://docs.docker.com/engine/install/"
	}
	openBrowser(url)
}

// SavedEnv represents persisted credentials and port configurations from .env
type SavedEnv struct {
	KeyID         string `json:"keyId"`
	KeySecret     string `json:"keySecret"`
	WebhookSecret string `json:"webhookSecret"`
	Transport     string `json:"transport"`
	Port          string `json:"port"`
}

// GetSavedEnv reads existing credentials and port settings from .env in the project root
func (a *App) GetSavedEnv() SavedEnv {
	envPath := filepath.Join(a.projectRoot, ".env")
	file, err := os.Open(envPath)
	if err != nil {
		return SavedEnv{
			Port:      "8080",
			Transport: "streamablehttp",
		}
	}
	defer file.Close()

	res := SavedEnv{
		Port:      "8080",
		Transport: "streamablehttp",
	}

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}
		k := strings.TrimSpace(parts[0])
		v := strings.Trim(strings.TrimSpace(parts[1]), `"'`)

		switch k {
		case "RAZORPAY_KEY_ID":
			res.KeyID = v
		case "RAZORPAY_KEY_SECRET":
			res.KeySecret = v
		case "RAZORPAY_WEBHOOK_SECRET":
			res.WebhookSecret = v
		case "MCP_TRANSPORT":
			if v != "" {
				res.Transport = v
			}
		case "PORT":
			if v != "" {
				res.Port = v
			}
		}
	}

	return res
}

// OpenRazorpayDashboard opens the Razorpay test dashboard
func (a *App) OpenRazorpayDashboard() {
	openBrowser("https://dashboard.razorpay.com/app/keys")
}

// WriteEnvAndLaunch writes credentials to .env and runs docker compose up -d
// Streams live log output back to the frontend via events.
func (a *App) WriteEnvAndLaunch(keyID, keySecret, webhookSecret, transport, port string) LaunchResult {
	// Validate inputs
	if strings.TrimSpace(keyID) == "" || strings.TrimSpace(keySecret) == "" {
		return LaunchResult{Success: false, Error: "Razorpay Key ID and Key Secret are required."}
	}
	if transport == "" {
		transport = "streamablehttp"
	}
	if port == "" {
		port = "8080"
	}

	// Persist to .env in projectRoot so future runs remember these settings
	envPath := filepath.Join(a.projectRoot, ".env")
	envContent := fmt.Sprintf(`# Auto-configured by AgenticCheckout Desktop Installer
RAZORPAY_KEY_ID=%s
RAZORPAY_KEY_SECRET=%s
RAZORPAY_WEBHOOK_SECRET=%s
MCP_TRANSPORT=%s
PORT=%s
`, keyID, keySecret, webhookSecret, transport, port)

	if err := os.WriteFile(envPath, []byte(envContent), 0644); err != nil {
		wailsRuntime.EventsEmit(a.ctx, "log", fmt.Sprintf("⚠️ Could not write .env: %v (continuing)", err))
	} else {
		wailsRuntime.EventsEmit(a.ctx, "log", "✓ Saved configuration to .env")
	}

	wailsRuntime.EventsEmit(a.ctx, "log", "✓ Configuring store credentials & launching containers...")

	// Build compose command
	status := a.CheckDockerStatus()
	var composeArgs []string
	if status.ComposeCmd == "docker-compose" {
		composeArgs = []string{"docker-compose", "-f", filepath.Join(a.projectRoot, "docker-compose.yml"), "up", "-d", "--build"}
	} else {
		composeArgs = []string{"docker", "compose", "-f", filepath.Join(a.projectRoot, "docker-compose.yml"), "up", "-d", "--build"}
	}

	wailsRuntime.EventsEmit(a.ctx, "log", fmt.Sprintf("▶ Running: %s", strings.Join(composeArgs, " ")))

	cmd := exec.Command(composeArgs[0], composeArgs[1:]...)
	cmd.Dir = a.projectRoot
	cmd.Env = append(os.Environ(),
		"RAZORPAY_KEY_ID="+keyID,
		"RAZORPAY_KEY_SECRET="+keySecret,
		"RAZORPAY_WEBHOOK_SECRET="+webhookSecret,
		"MCP_TRANSPORT="+transport,
		"PORT="+port,
	)

	// Stream stdout + stderr live to frontend
	stdout, _ := cmd.StdoutPipe()
	stderr, _ := cmd.StderrPipe()

	if err := cmd.Start(); err != nil {
		return LaunchResult{Success: false, Error: fmt.Sprintf("Failed to start docker compose: %v", err)}
	}

	// Stream stdout
	go func() {
		scanner := bufio.NewScanner(stdout)
		for scanner.Scan() {
			wailsRuntime.EventsEmit(a.ctx, "log", scanner.Text())
		}
	}()
	// Stream stderr (docker compose writes progress to stderr)
	go func() {
		scanner := bufio.NewScanner(stderr)
		for scanner.Scan() {
			wailsRuntime.EventsEmit(a.ctx, "log", scanner.Text())
		}
	}()

	if err := cmd.Wait(); err != nil {
		return LaunchResult{Success: false, Error: fmt.Sprintf("docker compose failed: %v", err)}
	}

	wailsRuntime.EventsEmit(a.ctx, "log", "✓ All services started successfully!")
	return LaunchResult{Success: true}
}

// OpenDashboard opens the merchant dashboard in the browser
func (a *App) OpenDashboard() {
	openBrowser("http://localhost:3000")
}

// GetOS returns the current operating system for OS-specific UI hints
func (a *App) GetOS() string {
	return runtime.GOOS
}

func openBrowser(url string) {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "darwin":
		cmd = exec.Command("open", url)
	case "windows":
		cmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", url)
	default:
		cmd = exec.Command("xdg-open", url)
	}
	cmd.Start()
}
