$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8080/")
$listener.Start()

Write-Host "CommercePilot AI Server running on http://localhost:8080/"
Write-Host "Press Ctrl+C to stop the server"

$currentDir = Get-Location

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $localPath = $request.Url.LocalPath
        $localPath = $localPath -replace "/", "\"
        
        if ($localPath -eq "\") {
            $localPath = "\index.html"
        }
        
        $filePath = Join-Path $currentDir $localPath.Substring(1)
        
        if (Test-Path $filePath -PathType Leaf) {
            $contentType = "text/plain"
            
            if ($filePath -match "\.html$") {
                $contentType = "text/html"
            } elseif ($filePath -match "\.css$") {
                $contentType = "text/css"
            } elseif ($filePath -match "\.js$") {
                $contentType = "text/javascript"
            } elseif ($filePath -match "\.(jpg|jpeg)$") {
                $contentType = "image/jpeg"
            } elseif ($filePath -match "\.png$") {
                $contentType = "image/png"
            } elseif ($filePath -match "\.svg$") {
                $contentType = "image/svg+xml"
            }
            
            $content = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $contentType
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write($content, 0, $content.Length)
        } else {
            $response.StatusCode = 404
            $content = [System.Text.Encoding]::UTF8.GetBytes("File not found")
            $response.ContentType = "text/plain"
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write($content, 0, $content.Length)
        }
        
        $response.Close()
    }
} finally {
    $listener.Stop()
} 