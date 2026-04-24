param(
  [string]$RemoteUrl = "https://github.com/caoxuan5211/mineguai.git",
  [string]$Branch = "main",
  [string]$Message = "feat: 完成麻将记账器网页"
)

$ErrorActionPreference = "Stop"

function Invoke-Git {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
  & git @Args
  if ($LASTEXITCODE -ne 0) {
    throw "git $($Args -join ' ') 执行失败"
  }
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "未找到 git，请先安装 Git for Windows。"
}

if (-not (Test-Path ".git")) {
  Invoke-Git init
}

$currentBranch = (& git branch --show-current).Trim()
if ([string]::IsNullOrWhiteSpace($currentBranch)) {
  Invoke-Git checkout -b $Branch
} elseif ($currentBranch -ne $Branch) {
  Invoke-Git branch -M $Branch
}

$remoteExists = (& git remote) -contains "origin"
if ($remoteExists) {
  Invoke-Git remote set-url origin $RemoteUrl
} else {
  Invoke-Git remote add origin $RemoteUrl
}

Invoke-Git add .

$changes = (& git status --porcelain)
if ($changes) {
  Invoke-Git commit -m $Message
} else {
  Write-Host "没有检测到需要提交的文件变更。"
}

Invoke-Git push -u origin $Branch
Write-Host "已推送到 $RemoteUrl 的 $Branch 分支。"
