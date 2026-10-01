<#
.SYNOPSIS
  Tests end-to-end de l'API Medias + Upload.

.DESCRIPTION
  Vérifie le happy path (texte / upload / image), les contrôles de sécurité
  (auth manquante, MIME non whitelisté) et les invariants du domaine
  (texte+url incohérent, image sans url, video sans durée).

  Compatible PowerShell 5.1 (Windows) — gère l'encodage UTF-8 du body JSON
  et utilise curl.exe pour le multipart/form-data (faute de -Form en 5.1).

.PARAMETER BaseUrl
  Racine de l'API (par défaut : XAMPP local sur LPMF_projet_stage).

.PARAMETER AdminKey
  Valeur attendue par AdminAuthMiddleware (cf. ADMIN_API_KEY dans .env).

.PARAMETER TestImagePath
  Chemin vers une image à uploader. Si vide, le script génère un PNG 1×1.

.EXAMPLE
  .\test_medias_api.ps1
  .\test_medias_api.ps1 -AdminKey "mon_token" -TestImagePath "C:\photo.jpg"
#>

param(
    [string]$BaseUrl       = "http://localhost/LPMF_projet_stage/app/backend/public/api",
    [string]$AdminKey      = "test",
    [string]$TestImagePath = ""
)

# ============================================================
# Encodage : curl.exe ecrit ses bytes en UTF-8 sur stdout, mais PowerShell
# decode par defaut avec le code page console (CP850 sur Windows-FR), ce
# qui transforme les accents en mojibake (├® a la place de é).
# On force UTF-8 pour la duree du script.
# ============================================================
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding           = [System.Text.Encoding]::UTF8

# ============================================================
# Helpers
# ============================================================

$Global:Pass = 0
$Global:Fail = 0

function Write-Section($title) {
    Write-Host ""
    Write-Host ("=" * 60) -ForegroundColor Cyan
    Write-Host " $title" -ForegroundColor Cyan
    Write-Host ("=" * 60) -ForegroundColor Cyan
}

function Write-Pass($message) {
    Write-Host "  [OK]   $message" -ForegroundColor Green
    $Global:Pass++
}

function Write-Fail($message) {
    Write-Host "  [FAIL] $message" -ForegroundColor Red
    $Global:Fail++
}

function To-Utf8Bytes($obj) {
    $json = $obj | ConvertTo-Json -Depth 5 -Compress
    return [System.Text.Encoding]::UTF8.GetBytes($json)
}

function Try-Api {
    param(
        [string]$Method,
        [string]$Path,
        $Body = $null,
        [string]$Token = $null
    )
    $url = "$BaseUrl$Path"

    # PS 5.1 + Invoke-WebRequest avec body byte[] envoie n'importe quoi sur le
    # wire (encodage flou). On passe par curl.exe + fichier temp UTF-8 sans BOM
    # pour garantir des bytes exacts cote serveur.
    $curlArgs = @("-s", "-o", "-", "-w", "`n__HTTP_CODE__:%{http_code}",
                  "-X", $Method, $url)
    if ($Token) { $curlArgs += @("-H", "Authorization: Bearer $Token") }

    $tmpFile = $null
    if ($null -ne $Body) {
        $json = $Body | ConvertTo-Json -Depth 5 -Compress
        $tmpFile = [System.IO.Path]::GetTempFileName()
        # UTF-8 sans BOM
        [System.IO.File]::WriteAllText($tmpFile, $json, [System.Text.UTF8Encoding]::new($false))
        $curlArgs += @("-H", "Content-Type: application/json; charset=utf-8",
                       "--data-binary", "@$tmpFile")
    }

    $lines = & curl.exe @curlArgs
    if ($tmpFile) { Remove-Item $tmpFile -Force -ErrorAction SilentlyContinue }

    $raw = if ($lines -is [array]) { $lines -join "`n" } else { [string]$lines }

    $marker = "__HTTP_CODE__:"
    $idx = $raw.LastIndexOf($marker)
    $status = 0
    if ($idx -ge 0) {
        $bodyText = $raw.Substring(0, $idx).TrimEnd("`r", "`n")
        [int]::TryParse($raw.Substring($idx + $marker.Length).Trim(), [ref]$status) | Out-Null
    } else {
        $bodyText = $raw
    }

    $payload = $null
    if ($bodyText -and -not [string]::IsNullOrWhiteSpace($bodyText)) {
        try { $payload = $bodyText | ConvertFrom-Json } catch { $payload = $bodyText }
    }
    $ok = ($status -ge 200 -and $status -lt 300)
    return @{ Ok = $ok; Status = $status; Body = $payload }
}

function Format-Body($body) {
    if ($null -eq $body) { return "(empty)" }
    if ($body -is [string]) {
        if ([string]::IsNullOrWhiteSpace($body)) { return "(empty)" }
        return $body
    }
    return ($body | ConvertTo-Json -Depth 5 -Compress)
}

function Invoke-Upload {
    param([string]$FilePath, [string]$Token = $null)
    $headers = @()
    if ($Token) { $headers += @("-H", "Authorization: Bearer $Token") }

    # `& curl.exe ...` renvoie un TABLEAU de lignes a PowerShell, pas une seule
    # string. On joint en une string puis on extrait via LastIndexOf, robuste
    # vis-a-vis des fins de ligne LF/CRLF.
    $lines = & curl.exe -s -o - -w "`n__HTTP_CODE__:%{http_code}" `
        -X POST "$BaseUrl/medias/upload" `
        @headers `
        -F "file=@$FilePath"

    $raw = if ($lines -is [array]) { $lines -join "`n" } else { [string]$lines }

    $marker = "__HTTP_CODE__:"
    $idx = $raw.LastIndexOf($marker)
    if ($idx -ge 0) {
        $bodyText = $raw.Substring(0, $idx).TrimEnd("`r", "`n")
        $statusStr = $raw.Substring($idx + $marker.Length).Trim()
        $status = 0
        [int]::TryParse($statusStr, [ref]$status) | Out-Null
    } else {
        $bodyText = $raw
        $status = 0
    }

    $body = $null
    if ($bodyText) {
        try { $body = $bodyText | ConvertFrom-Json } catch { $body = $bodyText }
    }
    return @{ Status = $status; Body = $body }
}

function Ensure-TestImage {
    if ($TestImagePath -and (Test-Path $TestImagePath)) {
        return (Resolve-Path $TestImagePath).Path
    }
    # PNG 1×1 rouge valide (~70 octets), encodé base64
    $tmp = Join-Path $env:TEMP "lpmf_test_image.png"
    $pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
    [IO.File]::WriteAllBytes($tmp, [Convert]::FromBase64String($pngBase64))
    return $tmp
}

# ============================================================
# Tests
# ============================================================

Write-Host ""
Write-Host "Test API : $BaseUrl" -ForegroundColor Yellow
Write-Host "Admin    : Bearer $AdminKey" -ForegroundColor Yellow

# -----------------------------------------------------------------
Write-Section "0. Connectivité"
# -----------------------------------------------------------------
$r = Try-Api -Method GET -Path "/medias"
if ($r.Ok -and $r.Status -eq 200) {
    Write-Pass "GET /medias → 200"
} else {
    Write-Fail "GET /medias → $($r.Status). Apache + MySQL démarrés ? Migration faite ?"
    Write-Host ("  Body: " + (Format-Body $r.Body))
    Write-Host ""
    Write-Host "Abandon des tests." -ForegroundColor Red
    return
}

# -----------------------------------------------------------------
Write-Section "1. Création média TEXTE (sans upload)"
# -----------------------------------------------------------------
$createdTexteId = $null
$texteContent = "Cours annulé aujourd'hui à 14h. Reporté à mercredi en salle B12."
$r = Try-Api -Method POST -Path "/medias" -Token $AdminKey -Body @{
    titre         = "Test texte - $(Get-Date -Format HH:mm:ss)"
    type          = "texte"
    contenu_texte = $texteContent
    duree_sec     = 10
    actif         = $true
}
if ($r.Ok -and $r.Status -eq 201) {
    $createdTexteId = $r.Body.data.id
    Write-Pass "POST /medias type=texte → 201 (id=$createdTexteId)"
    if ($r.Body.data.contenu_texte -eq $texteContent) {
        Write-Pass "contenu_texte conservé tel quel (UTF-8 OK)"
    } else {
        Write-Fail "contenu_texte modifié : '$($r.Body.data.contenu_texte)'"
    }
    if ($null -eq $r.Body.data.url_fichier) {
        Write-Pass "url_fichier = null"
    } else {
        Write-Fail "url_fichier devrait être null : '$($r.Body.data.url_fichier)'"
    }
} else {
    Write-Fail "POST /medias type=texte → $($r.Status) : $(Format-Body $r.Body)"
}

# -----------------------------------------------------------------
Write-Section "2. Upload d'une image"
# -----------------------------------------------------------------
$imagePath = Ensure-TestImage
Write-Host "  Fichier source : $imagePath"
$up = Invoke-Upload -FilePath $imagePath -Token $AdminKey
$uploadedUrl = $null
if ($up.Status -eq 201) {
    $uploadedUrl = $up.Body.data.url
    Write-Pass "POST /medias/upload → 201"
    Write-Host "         URL  : $uploadedUrl"
    Write-Host "         MIME : $($up.Body.data.mime_type)"
    Write-Host "         Size : $($up.Body.data.size_bytes) o"
} else {
    Write-Fail "POST /medias/upload → $($up.Status) : $($up.Body | ConvertTo-Json -Compress)"
}

# -----------------------------------------------------------------
Write-Section "3. Vérification du fichier servi par Apache"
# -----------------------------------------------------------------
if ($uploadedUrl) {
    # Le publicPrefix '/uploads' est relatif au DocumentRoot d'Apache,
    # qui ici est la racine XAMPP. On reconstruit l'URL complète.
    $fileUrl = "http://localhost/LPMF_projet_stage/app/backend/public$uploadedUrl"
    try {
        $head = Invoke-WebRequest -Uri $fileUrl -Method HEAD -UseBasicParsing -ErrorAction Stop
        if ($head.StatusCode -eq 200) {
            Write-Pass "HEAD $uploadedUrl → 200 (Apache sert bien le fichier)"
        } else {
            Write-Fail "HEAD $uploadedUrl → $($head.StatusCode)"
        }
    } catch {
        Write-Fail "HEAD $uploadedUrl → erreur réseau : $($_.Exception.Message)"
    }
} else {
    Write-Host "  (sauté : pas d'URL retournée à l'étape 2)" -ForegroundColor DarkGray
}

# -----------------------------------------------------------------
Write-Section "4. Création média IMAGE avec URL uploadée"
# -----------------------------------------------------------------
$createdImageId = $null
if ($uploadedUrl) {
    $r = Try-Api -Method POST -Path "/medias" -Token $AdminKey -Body @{
        titre       = "Test image - $(Get-Date -Format HH:mm:ss)"
        type        = "image"
        url_fichier = $uploadedUrl
        duree_sec   = 8
        actif       = $true
    }
    if ($r.Ok -and $r.Status -eq 201) {
        $createdImageId = $r.Body.data.id
        Write-Pass "POST /medias type=image → 201 (id=$createdImageId)"
    } else {
        Write-Fail "POST /medias type=image → $($r.Status) : $(Format-Body $r.Body)"
    }
} else {
    Write-Host "  (sauté)" -ForegroundColor DarkGray
}

# -----------------------------------------------------------------
Write-Section "5. Mise à jour du texte"
# -----------------------------------------------------------------
if ($createdTexteId) {
    $r = Try-Api -Method PUT -Path "/medias/$createdTexteId" -Token $AdminKey -Body @{
        contenu_texte = "Nouveau message - edite avec accent et apostrophe d'."
    }
    if ($r.Ok -and $r.Status -eq 200) {
        if ($r.Body.data.contenu_texte -like "Nouveau message*") {
            Write-Pass "PUT /medias/$createdTexteId → contenu_texte mis à jour"
        } else {
            Write-Fail "PUT → contenu_texte non mis à jour : '$($r.Body.data.contenu_texte)'"
        }
    } else {
        Write-Fail "PUT /medias/$createdTexteId → $($r.Status)"
    }
} else {
    Write-Host "  (sauté)" -ForegroundColor DarkGray
}

# -----------------------------------------------------------------
Write-Section "6. Cas d'erreur attendus"
# -----------------------------------------------------------------

# 6.1 Auth manquante
$r = Try-Api -Method POST -Path "/medias" -Body @{ titre = "X"; type = "texte"; contenu_texte = "hi" }
if (-not $r.Ok -and $r.Status -eq 401) {
    Write-Pass "POST sans Bearer → 401"
} else {
    Write-Fail "POST sans Bearer devrait être 401, reçu $($r.Status)"
}

# 6.2 texte + url_fichier (incohérent)
$r = Try-Api -Method POST -Path "/medias" -Token $AdminKey -Body @{
    titre = "X"; type = "texte"; contenu_texte = "hi"; url_fichier = "/uploads/x.jpg"
}
if (-not $r.Ok -and $r.Status -eq 422) {
    Write-Pass "type=texte + url_fichier → 422 (rejeté par le domaine)"
} else {
    Write-Fail "type=texte+url devrait être 422, reçu $($r.Status)"
}

# 6.3 image sans url_fichier
$r = Try-Api -Method POST -Path "/medias" -Token $AdminKey -Body @{ titre = "X"; type = "image" }
if (-not $r.Ok -and $r.Status -eq 422) {
    Write-Pass "type=image sans url_fichier → 422"
} else {
    Write-Fail "type=image sans url devrait être 422, reçu $($r.Status)"
}

# 6.4 video sans duree_sec
$r = Try-Api -Method POST -Path "/medias" -Token $AdminKey -Body @{
    titre = "X"; type = "video"; url_fichier = "/uploads/x.mp4"
}
if (-not $r.Ok -and $r.Status -eq 422) {
    Write-Pass "type=video sans duree_sec → 422"
} else {
    Write-Fail "type=video sans duree devrait être 422, reçu $($r.Status)"
}

# 6.5 Upload d'un MIME non whitelisté
$badPath = Join-Path $env:TEMP "lpmf_test_bad.txt"
"hello world" | Out-File -FilePath $badPath -Encoding ASCII
$bad = Invoke-Upload -FilePath $badPath -Token $AdminKey
if ($bad.Status -eq 422) {
    Write-Pass "Upload .txt → 422 (MIME non whitelisté)"
} else {
    Write-Fail "Upload .txt devrait être 422, reçu $($bad.Status)"
}
Remove-Item $badPath -Force -ErrorAction SilentlyContinue

# -----------------------------------------------------------------
Write-Section "7. Nettoyage"
# -----------------------------------------------------------------
foreach ($id in @($createdTexteId, $createdImageId)) {
    if ($id) {
        $r = Try-Api -Method DELETE -Path "/medias/$id" -Token $AdminKey
        if ($r.Ok -and ($r.Status -eq 200 -or $r.Status -eq 204)) {
            Write-Pass "DELETE /medias/$id → $($r.Status)"
        } else {
            Write-Fail "DELETE /medias/$id → $($r.Status)"
        }
    }
}

# ============================================================
# Résumé
# ============================================================
Write-Host ""
Write-Host ("=" * 60)
$totalColor = if ($Global:Fail -eq 0) { "Green" } else { "Red" }
Write-Host "  Total OK   : $Global:Pass" -ForegroundColor Green
Write-Host "  Total FAIL : $Global:Fail" -ForegroundColor $totalColor
Write-Host ("=" * 60)
