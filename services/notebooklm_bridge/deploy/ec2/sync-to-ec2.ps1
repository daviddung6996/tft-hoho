param(
    [Parameter(Mandatory = $true)]
    [string]$RemoteHost,

    [Parameter(Mandatory = $true)]
    [string]$KeyPath,

    [string]$User = "ubuntu",
    [string]$RemoteDir = "~/notebooklm-bridge"
)

$ErrorActionPreference = "Stop"

$serviceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$files = @(
    "app.py",
    "bridge.py",
    "requirements.txt",
    "Dockerfile",
    "docker-compose.yml",
    ".env.example",
    ".dockerignore"
)

ssh -i $KeyPath "$User@$RemoteHost" "mkdir -p $RemoteDir/deploy/ec2/nginx $RemoteDir/deploy/ec2/systemd"

foreach ($file in $files) {
    scp -i $KeyPath (Join-Path $serviceRoot $file) "${User}@${RemoteHost}:$RemoteDir/$file"
}

scp -i $KeyPath (Join-Path $serviceRoot "deploy\ec2\bootstrap.sh") "${User}@${RemoteHost}:$RemoteDir/deploy/ec2/bootstrap.sh"
scp -i $KeyPath (Join-Path $serviceRoot "deploy\ec2\notebooklm-bridge-deep-health.sh") "${User}@${RemoteHost}:$RemoteDir/deploy/ec2/notebooklm-bridge-deep-health.sh"
scp -i $KeyPath (Join-Path $serviceRoot "deploy\ec2\nginx\notebooklm-bridge.conf") "${User}@${RemoteHost}:$RemoteDir/deploy/ec2/nginx/notebooklm-bridge.conf"
scp -i $KeyPath (Join-Path $serviceRoot "deploy\ec2\systemd\notebooklm-bridge-deep-health.service") "${User}@${RemoteHost}:$RemoteDir/deploy/ec2/systemd/notebooklm-bridge-deep-health.service"
scp -i $KeyPath (Join-Path $serviceRoot "deploy\ec2\systemd\notebooklm-bridge-deep-health.timer") "${User}@${RemoteHost}:$RemoteDir/deploy/ec2/systemd/notebooklm-bridge-deep-health.timer"

ssh -i $KeyPath "$User@$RemoteHost" "chmod +x $RemoteDir/deploy/ec2/bootstrap.sh $RemoteDir/deploy/ec2/notebooklm-bridge-deep-health.sh"

Write-Host "Synced bridge files to ${User}@${RemoteHost}:$RemoteDir"
Write-Host "Next: copy storage_state.json to $RemoteDir/secrets/storage_state.json, edit $RemoteDir/.env, then run:"
Write-Host "ssh -i `"$KeyPath`" $User@$RemoteHost `"cd $RemoteDir && ./deploy/ec2/bootstrap.sh`""
