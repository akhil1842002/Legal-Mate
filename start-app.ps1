$serverJob = Start-Job -ScriptBlock {
    Set-Location "server"
    npm start
}

$clientJob = Start-Job -ScriptBlock {
    Set-Location "client"
    npm start
}

Write-Host "Starting servers..."
Write-Host "Backend running on http://localhost:8000"
Write-Host "Frontend running on http://localhost:3000"
Write-Host "Press Ctrl+C to stop (you may need to manually kill node processes)"

# Keep script running to maintain jobs
try {
    while ($true) {
        Receive-Job -Job $serverJob -Keep
        Receive-Job -Job $clientJob -Keep
        Start-Sleep -Seconds 1
    }
}
finally {
    Stop-Job -Job $serverJob
    Stop-Job -Job $clientJob
}
