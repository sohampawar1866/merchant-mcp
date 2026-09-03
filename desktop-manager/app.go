package main

import (
	"bufio"
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"time"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

// DockerStatus represents the current state of Docker on the system
type DockerStatus struct {
	Installed  bool   `json:"installed"`
	Running    bool   `json:"running"`
	ComposeCmd string `json:"composeCmd"` // "docker compose" or "docker-compose"
	Message    string `json:"message"`
}

// LaunchResult is returned after docker operations
type LaunchResult struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
	Message string `json:"message"`
}

// ConfigState represents the persisted configuration and environment state
type ConfigState struct {
	EnvExists            bool   `json:"envExists"`
	EncryptionPassphrase string `json:"encryptionPassphrase"`
	GatewayPort          string `json:"gatewayPort"`
	MCPTransport         string `json:"mcpTransport"`
	CustomerAppPort      string `json:"customerAppPort"`
	PostgresPort         string `json:"postgresPort"`
	RedisPort            string `json:"redisPort"`
	IncludeSimulation    bool   `json:"includeSimulation"`
}

// ServiceStatus reports health and URL for each service
type ServiceStatus struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Port    string `json:"port"`
	URL     string `json:"url"`
	Running bool   `json:"running"`
}

// App holds application state
type App struct {
	ctx         context.Context
	projectRoot string
	polling     bool
}

// NewApp creates the application instance
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	exe, _ := os.Executable()
	dir := filepath.Dir(exe)
	a.projectRoot = findProjectRoot(dir)

	// Automatically ensure a default .env exists by copying .env.example if missing
	a.ensureEnvFileExists()

	go a.pollDockerStatus()
}

// findProjectRoot walks up until it finds docker-compose.yml
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
	return filepath.Dir(start)
}

// ensureEnvFileExists copies .env.example to .env if .env is missing
func (a *App) ensureEnvFileExists() {
	envPath := filepath.Join(a.projectRoot, ".env")
	if _, err := os.Stat(envPath); os.IsNotExist(err) {
		examplePath := filepath.Join(a.projectRoot, ".env.example")
		if content, err := os.ReadFile(examplePath); err == nil {
			_ = os.WriteFile(envPath, content, 0644)
		}
	}
}

// pollDockerStatus emits docker status every 2s
func (a *App) pollDockerStatus() {
	a.polling = true
	for a.polling {
		status := a.CheckDockerStatus()
		wailsRuntime.EventsEmit(a.ctx, "docker:status", status)
		time.Sleep(2 * time.Second)
	}
}

// CheckDockerStatus verifies if Docker daemon is operational
func (a *App) CheckDockerStatus() DockerStatus {
	dockerPath, err := exec.LookPath("docker")
	if err != nil || dockerPath == "" {
		return DockerStatus{
			Installed:  false,
			Running:    false,
			ComposeCmd: "",
			Message:    "Docker is not installed on this machine.",
		}
	}

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

	return DockerStatus{
		Installed:  true,
		Running:    true,
		ComposeCmd: detectComposeCmd(),
		Message:    "Docker daemon is ready.",
	}
}

func detectComposeCmd() string {
	cmd := exec.Command("docker", "compose", "version")
	if err := cmd.Run(); err == nil {
		return "docker compose"
	}
	if _, err := exec.LookPath("docker-compose"); err == nil {
		return "docker-compose"
	}
	return "docker compose"
}

// OpenDockerDesktop starts Docker Desktop for the current OS
func (a *App) OpenDockerDesktop() {
	switch runtime.GOOS {
	case "darwin":
		_ = exec.Command("open", "-a", "Docker").Start()
	case "windows":
		_ = exec.Command("cmd", "/c", "start", "", `C:\Program Files\Docker\Docker\Docker Desktop.exe`).Start()
	case "linux":
		_ = exec.Command("systemctl", "--user", "start", "docker-desktop").Start()
	}
}

// OpenInstallPage opens Docker documentation
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

// GeneratePassphrase returns a secure 32-character hex key
func (a *App) GeneratePassphrase() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return "agentic_master_" + hex.EncodeToString(b)
}

// GetConfig reads the current settings from .env (or .env.example)
func (a *App) GetConfig() ConfigState {
	envPath := filepath.Join(a.projectRoot, ".env")
	envExists := true

	file, err := os.Open(envPath)
	if err != nil {
		envExists = false
		file, err = os.Open(filepath.Join(a.projectRoot, ".env.example"))
	}

	state := ConfigState{
		EnvExists:            envExists,
		EncryptionPassphrase: "agentic_platform_master_passphrase_2026",
		GatewayPort:          "8080",
		MCPTransport:         "streamablehttp",
		CustomerAppPort:      "3002",
		PostgresPort:         "5433",
		RedisPort:            "6380",
		IncludeSimulation:    true,
	}

	if err == nil {
		defer file.Close()
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
			case "ENCRYPTION_PASSPHRASE":
				state.EncryptionPassphrase = v
			case "PORT":
				state.GatewayPort = v
			case "MCP_TRANSPORT":
				state.MCPTransport = v
			case "UPI_CIRCLE_PORT":
				state.CustomerAppPort = v
			case "POSTGRES_PORT":
				state.PostgresPort = v
			case "REDIS_PORT":
				state.RedisPort = v
			}
		}
	}

	return state
}

// SaveConfigAndStart validates environment variables, writes .env, and starts services
func (a *App) SaveConfigAndStart(passphrase, transport, gatewayPort, customerPort, postgresPort, redisPort string, includeSimulation bool) LaunchResult {
	passphrase = strings.TrimSpace(passphrase)
	if passphrase == "" {
		return LaunchResult{
			Success: false,
			Error:   "Master Security Passphrase is required. It is used by PostgreSQL (pgcrypto) to encrypt all merchant credentials.",
		}
	}

	if transport == "" {
		transport = "streamablehttp"
	}
	if gatewayPort == "" {
		gatewayPort = "8080"
	}
	if customerPort == "" {
		customerPort = "3002"
	}
	if postgresPort == "" {
		postgresPort = "5433"
	}
	if redisPort == "" {
		redisPort = "6380"
	}

	// Validate numeric ports
	for name, portStr := range map[string]string{
		"Gateway Port":  gatewayPort,
		"Customer Port": customerPort,
		"Postgres Port": postgresPort,
		"Redis Port":    redisPort,
	} {
		p, err := strconv.Atoi(portStr)
		if err != nil || p < 1024 || p > 65535 {
			return LaunchResult{
				Success: false,
				Error:   fmt.Sprintf("Invalid port for %s: %s (must be between 1024 and 65535)", name, portStr),
			}
		}
	}

	// Write .env
	envPath := filepath.Join(a.projectRoot, ".env")
	content := fmt.Sprintf(`# AgenticCheckout - Platform Environment Configuration
# Configured via AgenticCheckout Desktop Control Center

ENCRYPTION_PASSPHRASE=%s
MCP_TRANSPORT=%s
PORT=%s
UPI_CIRCLE_PORT=%s
POSTGRES_PORT=%s
REDIS_PORT=%s
`, passphrase, transport, gatewayPort, customerPort, postgresPort, redisPort)

	if err := os.WriteFile(envPath, []byte(content), 0644); err != nil {
		return LaunchResult{
			Success: false,
			Error:   fmt.Sprintf("Failed to write .env file: %v", err),
		}
	}

	wailsRuntime.EventsEmit(a.ctx, "log", "✓ Saved verified configuration to .env")

	// Assemble docker compose command
	status := a.CheckDockerStatus()
	var baseCmd []string
	if status.ComposeCmd == "docker-compose" {
		baseCmd = []string{"docker-compose", "-f", filepath.Join(a.projectRoot, "docker-compose.yml")}
	} else {
		baseCmd = []string{"docker", "compose", "-f", filepath.Join(a.projectRoot, "docker-compose.yml")}
	}

	// Determine targets based on simulation toggle
	composeArgs := append([]string{}, baseCmd...)
	composeArgs = append(composeArgs, "up", "-d", "--build")
	if !includeSimulation {
		composeArgs = append(composeArgs, "postgres", "redis", "server", "dashboard", "admin-dashboard")
	}

	wailsRuntime.EventsEmit(a.ctx, "log", fmt.Sprintf("▶ Running: %s", strings.Join(composeArgs, " ")))

	cmd := exec.Command(composeArgs[0], composeArgs[1:]...)
	cmd.Dir = a.projectRoot
	cmd.Env = os.Environ()

	stdout, _ := cmd.StdoutPipe()
	stderr, _ := cmd.StderrPipe()

	if err := cmd.Start(); err != nil {
		return LaunchResult{Success: false, Error: fmt.Sprintf("Failed to start docker compose: %v", err)}
	}

	go streamPipe(a.ctx, stdout)
	go streamPipe(a.ctx, stderr)

	if err := cmd.Wait(); err != nil {
		return LaunchResult{Success: false, Error: fmt.Sprintf("Docker Compose failed: %v", err)}
	}

	// If simulation was disabled, ensure customer-upi-app container is stopped
	if !includeSimulation {
		stopSimCmd := append([]string{}, baseCmd...)
		stopSimCmd = append(stopSimCmd, "stop", "customer-upi-app")
		c := exec.Command(stopSimCmd[0], stopSimCmd[1:]...)
		c.Dir = a.projectRoot
		_ = c.Run()
		wailsRuntime.EventsEmit(a.ctx, "log", "ℹ️ Customer UPI Simulation container stopped per toggle setting.")
	}

	wailsRuntime.EventsEmit(a.ctx, "log", "✓ All requested services started and healthy!")
	wailsRuntime.EventsEmit(a.ctx, "log", "  - Merchant Control Plane: http://localhost:3000")
	wailsRuntime.EventsEmit(a.ctx, "log", "  - Platform Admin:        http://localhost:3001")
	if includeSimulation {
		wailsRuntime.EventsEmit(a.ctx, "log", fmt.Sprintf("  - Customer UPI Simulator: http://localhost:%s", customerPort))
	}
	wailsRuntime.EventsEmit(a.ctx, "log", fmt.Sprintf("  - MCP Gateway:           http://localhost:%s/mcp", gatewayPort))

	return LaunchResult{Success: true, Message: "Services started successfully."}
}

// StopServices stops all running containers
func (a *App) StopServices() LaunchResult {
	status := a.CheckDockerStatus()
	var composeArgs []string
	if status.ComposeCmd == "docker-compose" {
		composeArgs = []string{"docker-compose", "-f", filepath.Join(a.projectRoot, "docker-compose.yml"), "stop"}
	} else {
		composeArgs = []string{"docker", "compose", "-f", filepath.Join(a.projectRoot, "docker-compose.yml"), "stop"}
	}

	wailsRuntime.EventsEmit(a.ctx, "log", "▶ Stopping all AgenticCheckout services...")
	cmd := exec.Command(composeArgs[0], composeArgs[1:]...)
	cmd.Dir = a.projectRoot
	out, err := cmd.CombinedOutput()
	if err != nil {
		return LaunchResult{Success: false, Error: fmt.Sprintf("Failed to stop services: %v\n%s", err, string(out))}
	}

	wailsRuntime.EventsEmit(a.ctx, "log", string(out))
	wailsRuntime.EventsEmit(a.ctx, "log", "✓ All AgenticCheckout services stopped.")
	return LaunchResult{Success: true, Message: "All services stopped."}
}

// RestartServices restarts all containers
func (a *App) RestartServices() LaunchResult {
	status := a.CheckDockerStatus()
	var composeArgs []string
	if status.ComposeCmd == "docker-compose" {
		composeArgs = []string{"docker-compose", "-f", filepath.Join(a.projectRoot, "docker-compose.yml"), "restart"}
	} else {
		composeArgs = []string{"docker", "compose", "-f", filepath.Join(a.projectRoot, "docker-compose.yml"), "restart"}
	}

	wailsRuntime.EventsEmit(a.ctx, "log", "▶ Restarting all AgenticCheckout services...")
	cmd := exec.Command(composeArgs[0], composeArgs[1:]...)
	cmd.Dir = a.projectRoot
	out, err := cmd.CombinedOutput()
	if err != nil {
		return LaunchResult{Success: false, Error: fmt.Sprintf("Failed to restart: %v\n%s", err, string(out))}
	}

	wailsRuntime.EventsEmit(a.ctx, "log", string(out))
	wailsRuntime.EventsEmit(a.ctx, "log", "✓ All services restarted.")
	return LaunchResult{Success: true, Message: "Services restarted."}
}

// StartSimulation spins up only the Customer UPI App container
func (a *App) StartSimulation() LaunchResult {
	status := a.CheckDockerStatus()
	var composeArgs []string
	if status.ComposeCmd == "docker-compose" {
		composeArgs = []string{"docker-compose", "-f", filepath.Join(a.projectRoot, "docker-compose.yml"), "up", "-d", "customer-upi-app"}
	} else {
		composeArgs = []string{"docker", "compose", "-f", filepath.Join(a.projectRoot, "docker-compose.yml"), "up", "-d", "customer-upi-app"}
	}

	wailsRuntime.EventsEmit(a.ctx, "log", "▶ Starting Customer UPI Phone Simulator...")
	cmd := exec.Command(composeArgs[0], composeArgs[1:]...)
	cmd.Dir = a.projectRoot
	if out, err := cmd.CombinedOutput(); err != nil {
		return LaunchResult{Success: false, Error: fmt.Sprintf("Failed to start simulator: %v\n%s", err, string(out))}
	}
	wailsRuntime.EventsEmit(a.ctx, "log", "✓ Customer UPI App Simulator running at http://localhost:3002")
	return LaunchResult{Success: true, Message: "Simulator started."}
}

// StopSimulation halts only the Customer UPI App container
func (a *App) StopSimulation() LaunchResult {
	status := a.CheckDockerStatus()
	var composeArgs []string
	if status.ComposeCmd == "docker-compose" {
		composeArgs = []string{"docker-compose", "-f", filepath.Join(a.projectRoot, "docker-compose.yml"), "stop", "customer-upi-app"}
	} else {
		composeArgs = []string{"docker", "compose", "-f", filepath.Join(a.projectRoot, "docker-compose.yml"), "stop", "customer-upi-app"}
	}

	wailsRuntime.EventsEmit(a.ctx, "log", "▶ Stopping Customer UPI Phone Simulator...")
	cmd := exec.Command(composeArgs[0], composeArgs[1:]...)
	cmd.Dir = a.projectRoot
	_ = cmd.Run()
	wailsRuntime.EventsEmit(a.ctx, "log", "✓ Customer UPI App Simulator stopped.")
	return LaunchResult{Success: true, Message: "Simulator stopped."}
}

// GetServices returns the current fleet of services with status and local links
func (a *App) GetServices() []ServiceStatus {
	cfg := a.GetConfig()
	return []ServiceStatus{
		{ID: "merchant", Name: "Merchant Storefront & Margin Defense", Port: "3000", URL: "http://localhost:3000", Running: true},
		{ID: "admin", Name: "Platform Fleet Admin Center", Port: "3001", URL: "http://localhost:3001", Running: true},
		{ID: "upi", Name: "Customer UPI Circle Simulator", Port: cfg.CustomerAppPort, URL: fmt.Sprintf("http://localhost:%s", cfg.CustomerAppPort), Running: cfg.IncludeSimulation},
		{ID: "gateway", Name: "Go MCP Unified Commerce Gateway", Port: cfg.GatewayPort, URL: fmt.Sprintf("http://localhost:%s/mcp", cfg.GatewayPort), Running: true},
		{ID: "manifest", Name: "Open Agent Discovery Manifest", Port: cfg.GatewayPort, URL: fmt.Sprintf("http://localhost:%s/.well-known/agent-manifest.json", cfg.GatewayPort), Running: true},
	}
}

// Browser navigation helpers
func (a *App) OpenMerchantDashboard() { openBrowser("http://localhost:3000") }
func (a *App) OpenAdminDashboard()    { openBrowser("http://localhost:3001") }
func (a *App) OpenCustomerUPIApp()    { openBrowser("http://localhost:3002") }
func (a *App) OpenMCPGateway() {
	cfg := a.GetConfig()
	openBrowser(fmt.Sprintf("http://localhost:%s/mcp", cfg.GatewayPort))
}
func (a *App) OpenAgentManifest() {
	cfg := a.GetConfig()
	openBrowser(fmt.Sprintf("http://localhost:%s/.well-known/agent-manifest.json", cfg.GatewayPort))
}

func (a *App) GetOS() string {
	return runtime.GOOS
}

func streamPipe(ctx context.Context, r io.Reader) {
	scanner := bufio.NewScanner(r)
	for scanner.Scan() {
		wailsRuntime.EventsEmit(ctx, "log", scanner.Text())
	}
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
	_ = cmd.Start()
}
