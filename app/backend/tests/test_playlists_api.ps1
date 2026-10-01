<#
.SYNOPSIS
  Tests end-to-end de l'API Playlists + PlaylistMedia.

.DESCRIPTION
  Verifie :
   - CRUD playlist (create, read, update, list, delete)
   - Filtre ?active=true sur la liste
   - Attach / list / update ordre / detach de medias dans une playlist
   - Endpoint /playlists/active (signale le mock en cours)
   - Cas d'erreur (auth manquante, nom vide, id inexistant, payload invalide)

  Compatible PowerShell 5.1.

.EXAMPLE
  .\test_playlists_api.ps1
  .\test_playlists_api.ps1 -AdminKey "ma_cle"
#>

param(
    [string]$BaseUrl  = "http://localhost/LPMF_projet_stage/app/backend/public/api",
    [string]$AdminKey = "test"
)

# ============================================================
# Encodage : curl.exe ecrit en UTF-8, PowerShell decode en CP850 par defaut.
# On force UTF-8 le temps du script.
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

function Format-Body($body) {
    if ($null -eq $body) { return "(empty)" }
    if ($body -is [string]) {
        if ([string]::IsNullOrWhiteSpace($body)) { return "(empty)" }
        return $body
    }
    return ($body | ConvertTo-Json -Depth 5 -Compress)
}

function Try-Api {
    param(
        [string]$Method,
        [string]$Path,
        $Body = $null,
        [string]$Token = $null
    )
    $url = "$BaseUrl$Path"
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

# ============================================================
# Tests
# ============================================================

Write-Host ""
Write-Host "Test API : $BaseUrl" -ForegroundColor Yellow
Write-Host "Admin    : Bearer $AdminKey" -ForegroundColor Yellow

# Variables capturees pour le cleanup
$createdPlaylistId = $null
$createdMediaId    = $null

# -----------------------------------------------------------------
Write-Section "0. Connectivite"
# -----------------------------------------------------------------
$r = Try-Api -Method GET -Path "/playlists"
if ($r.Ok -and $r.Status -eq 200) {
    Write-Pass "GET /playlists -> 200"
} else {
    Write-Fail "GET /playlists -> $($r.Status). Apache+MySQL OK ? Body: $(Format-Body $r.Body)"
    Write-Host ""
    Write-Host "Abandon des tests." -ForegroundColor Red
    return
}

# -----------------------------------------------------------------
Write-Section "1. Creation de playlist"
# -----------------------------------------------------------------
$nom = "Affichage test - $(Get-Date -Format HH:mm:ss)"
$r = Try-Api -Method POST -Path "/playlists" -Token $AdminKey -Body @{
    nom    = $nom
    active = $false
}
if ($r.Ok -and $r.Status -eq 201) {
    $createdPlaylistId = $r.Body.data.id
    Write-Pass "POST /playlists -> 201 (id=$createdPlaylistId)"
    if ($r.Body.data.nom -eq $nom) { Write-Pass "nom conserve" }
    else { Write-Fail "nom different : $($r.Body.data.nom)" }
    if ($r.Body.data.active -eq $false) { Write-Pass "active = false (defaut explicite)" }
    else { Write-Fail "active devrait etre false : $($r.Body.data.active)" }
} else {
    Write-Fail "POST /playlists -> $($r.Status) : $(Format-Body $r.Body)"
    Write-Host ""
    Write-Host "Abandon des tests." -ForegroundColor Red
    return
}

# -----------------------------------------------------------------
Write-Section "2. Lecture par id et liste"
# -----------------------------------------------------------------
$r = Try-Api -Method GET -Path "/playlists/$createdPlaylistId"
if ($r.Ok -and $r.Status -eq 200 -and $r.Body.data.id -eq $createdPlaylistId) {
    Write-Pass "GET /playlists/$createdPlaylistId -> 200"
} else {
    Write-Fail "GET /playlists/$createdPlaylistId -> $($r.Status)"
}

$r = Try-Api -Method GET -Path "/playlists"
if ($r.Ok -and $r.Status -eq 200) {
    $found = @($r.Body.data) | Where-Object { $_.id -eq $createdPlaylistId }
    if ($found) {
        Write-Pass "GET /playlists contient la playlist creee"
    } else {
        Write-Fail "GET /playlists ne contient pas la playlist creee"
    }
} else {
    Write-Fail "GET /playlists -> $($r.Status)"
}

# -----------------------------------------------------------------
Write-Section "3. Mise a jour : passage en active"
# -----------------------------------------------------------------
$r = Try-Api -Method PUT -Path "/playlists/$createdPlaylistId" -Token $AdminKey -Body @{
    active = $true
}
if ($r.Ok -and $r.Status -eq 200) {
    if ($r.Body.data.active -eq $true) {
        Write-Pass "PUT active=true -> 200, applique"
    } else {
        Write-Fail "PUT active=true -> 200 mais active vaut $($r.Body.data.active)"
    }
} else {
    Write-Fail "PUT /playlists/$createdPlaylistId -> $($r.Status) : $(Format-Body $r.Body)"
}

# Verification via le filtre ?active=true
$r = Try-Api -Method GET -Path "/playlists?active=true"
if ($r.Ok -and $r.Status -eq 200) {
    $found = @($r.Body.data) | Where-Object { $_.id -eq $createdPlaylistId }
    if ($found) {
        Write-Pass "GET /playlists?active=true contient la playlist"
    } else {
        Write-Fail "Filtre ?active=true ne renvoie pas la playlist (alors qu'elle est active)"
    }
} else {
    Write-Fail "GET /playlists?active=true -> $($r.Status)"
}

# -----------------------------------------------------------------
Write-Section "4. Preparation : creation d'un media pour l'association"
# -----------------------------------------------------------------
$r = Try-Api -Method POST -Path "/medias" -Token $AdminKey -Body @{
    titre         = "Texte test playlist - $(Get-Date -Format HH:mm:ss)"
    type          = "texte"
    contenu_texte = "Message de test pour les tests playlist"
    duree_sec     = 10
    actif         = $true
}
if ($r.Ok -and $r.Status -eq 201) {
    $createdMediaId = $r.Body.data.id
    Write-Pass "POST /medias type=texte -> 201 (id=$createdMediaId)"
} else {
    Write-Fail "Impossible de creer un media pour le test : $(Format-Body $r.Body)"
    Write-Host ""
    Write-Host "Abandon des tests playlist_media." -ForegroundColor Red
}

# -----------------------------------------------------------------
Write-Section "5. Attachement d'un media a la playlist"
# -----------------------------------------------------------------
if ($createdMediaId) {
    $r = Try-Api -Method POST -Path "/playlists/$createdPlaylistId/medias" -Token $AdminKey -Body @{
        media_id = $createdMediaId
        ordre    = 1
    }
    if ($r.Ok -and ($r.Status -eq 200 -or $r.Status -eq 201)) {
        Write-Pass "POST attach media -> $($r.Status)"
    } else {
        Write-Fail "POST attach -> $($r.Status) : $(Format-Body $r.Body)"
    }
} else {
    Write-Host "  (saute : pas de media cree)" -ForegroundColor DarkGray
}

# -----------------------------------------------------------------
Write-Section "6. Liste des medias de la playlist"
# -----------------------------------------------------------------
$r = Try-Api -Method GET -Path "/playlists/$createdPlaylistId/medias"
if ($r.Ok -and $r.Status -eq 200) {
    $items = @($r.Body.data)
    $found = $items | Where-Object { $_.media_id -eq $createdMediaId }
    if ($found) {
        Write-Pass "GET /playlists/.../medias contient le media (ordre=$($found.ordre))"
    } else {
        Write-Fail "Media attache pas trouve dans la liste"
    }
} else {
    Write-Fail "GET /playlists/.../medias -> $($r.Status)"
}

# -----------------------------------------------------------------
Write-Section "7. Mise a jour de l'ordre du media dans la playlist"
# -----------------------------------------------------------------
if ($createdMediaId) {
    $r = Try-Api -Method PUT -Path "/playlists/$createdPlaylistId/medias/$createdMediaId" `
                 -Token $AdminKey -Body @{ ordre = 5 }
    if ($r.Ok -and $r.Status -eq 200) {
        if ($r.Body.data.ordre -eq 5) {
            Write-Pass "PUT ordre=5 -> 200, applique"
        } else {
            Write-Fail "PUT ordre=5 -> 200 mais ordre vaut $($r.Body.data.ordre)"
        }
    } else {
        Write-Fail "PUT ordre -> $($r.Status) : $(Format-Body $r.Body)"
    }
} else {
    Write-Host "  (saute)" -ForegroundColor DarkGray
}

# -----------------------------------------------------------------
Write-Section "8. Endpoint /playlists/active (audit du mock)"
# -----------------------------------------------------------------
$r = Try-Api -Method GET -Path "/playlists/active"
if ($r.Ok -and $r.Status -eq 200) {
    Write-Pass "GET /playlists/active -> 200"
    Write-Host "         Body : $(Format-Body $r.Body)" -ForegroundColor DarkGray
    # Signature du mock : un seul item avec titre='Test' et chemin='/test.mp4'
    $isMock = $r.Body.medias -and $r.Body.medias.Count -eq 1 -and $r.Body.medias[0].titre -eq 'Test'
    if ($isMock) {
        Write-Host "         WARN : la route renvoie un mock hardcode" -ForegroundColor Yellow
        Write-Host "                (cf. audit du ticket #51 : pas de vrai use case)" -ForegroundColor Yellow
    }
} else {
    Write-Fail "GET /playlists/active -> $($r.Status)"
}

# -----------------------------------------------------------------
Write-Section "9. Cas d'erreur attendus"
# -----------------------------------------------------------------

# 9.1 POST sans Bearer
$r = Try-Api -Method POST -Path "/playlists" -Body @{ nom = "X" }
if (-not $r.Ok -and $r.Status -eq 401) {
    Write-Pass "POST sans Bearer -> 401"
} else {
    Write-Fail "POST sans Bearer devrait etre 401, recu $($r.Status)"
}

# 9.2 POST avec nom vide
$r = Try-Api -Method POST -Path "/playlists" -Token $AdminKey -Body @{ nom = "" }
if (-not $r.Ok -and $r.Status -eq 422) {
    Write-Pass "POST nom vide -> 422"
} else {
    Write-Fail "POST nom vide devrait etre 422, recu $($r.Status) : $(Format-Body $r.Body)"
}

# 9.3 GET d'une playlist inexistante
$r = Try-Api -Method GET -Path "/playlists/999999"
if (-not $r.Ok -and $r.Status -eq 404) {
    Write-Pass "GET /playlists/999999 -> 404"
} else {
    Write-Fail "GET id inexistant devrait etre 404, recu $($r.Status)"
}

# 9.4 PUT sur une playlist inexistante
$r = Try-Api -Method PUT -Path "/playlists/999999" -Token $AdminKey -Body @{ nom = "X" }
if (-not $r.Ok -and $r.Status -eq 404) {
    Write-Pass "PUT /playlists/999999 -> 404"
} else {
    Write-Fail "PUT id inexistant devrait etre 404, recu $($r.Status)"
}

# 9.5 Attach sans media_id (payload invalide)
$r = Try-Api -Method POST -Path "/playlists/$createdPlaylistId/medias" -Token $AdminKey -Body @{
    ordre = 1
}
if (-not $r.Ok -and $r.Status -eq 422) {
    Write-Pass "POST attach sans media_id -> 422"
} else {
    Write-Fail "POST attach sans media_id devrait etre 422, recu $($r.Status)"
}

# 9.6 Attach sans ordre
if ($createdMediaId) {
    $r = Try-Api -Method POST -Path "/playlists/$createdPlaylistId/medias" -Token $AdminKey -Body @{
        media_id = $createdMediaId
    }
    if (-not $r.Ok -and $r.Status -eq 422) {
        Write-Pass "POST attach sans ordre -> 422"
    } else {
        Write-Fail "POST attach sans ordre devrait etre 422, recu $($r.Status)"
    }
}

# 9.7 DELETE sans auth
$r = Try-Api -Method DELETE -Path "/playlists/$createdPlaylistId"
if (-not $r.Ok -and $r.Status -eq 401) {
    Write-Pass "DELETE sans Bearer -> 401"
} else {
    Write-Fail "DELETE sans Bearer devrait etre 401, recu $($r.Status)"
}

# -----------------------------------------------------------------
Write-Section "10. Nettoyage (detach + delete)"
# -----------------------------------------------------------------

# Detach
if ($createdPlaylistId -and $createdMediaId) {
    $r = Try-Api -Method DELETE -Path "/playlists/$createdPlaylistId/medias/$createdMediaId" -Token $AdminKey
    if ($r.Ok -and ($r.Status -eq 200 -or $r.Status -eq 204)) {
        Write-Pass "DELETE attach media -> $($r.Status)"
    } else {
        Write-Fail "DELETE attach -> $($r.Status)"
    }
}

# Delete playlist
if ($createdPlaylistId) {
    $r = Try-Api -Method DELETE -Path "/playlists/$createdPlaylistId" -Token $AdminKey
    if ($r.Ok -and ($r.Status -eq 200 -or $r.Status -eq 204)) {
        Write-Pass "DELETE /playlists/$createdPlaylistId -> $($r.Status)"
    } else {
        Write-Fail "DELETE /playlists/$createdPlaylistId -> $($r.Status)"
    }
}

# Delete media
if ($createdMediaId) {
    $r = Try-Api -Method DELETE -Path "/medias/$createdMediaId" -Token $AdminKey
    if ($r.Ok -and ($r.Status -eq 200 -or $r.Status -eq 204)) {
        Write-Pass "DELETE /medias/$createdMediaId -> $($r.Status)"
    } else {
        Write-Fail "DELETE /medias/$createdMediaId -> $($r.Status)"
    }
}

# ============================================================
# Resume
# ============================================================
Write-Host ""
Write-Host ("=" * 60)
$totalColor = if ($Global:Fail -eq 0) { "Green" } else { "Red" }
Write-Host "  Total OK   : $Global:Pass" -ForegroundColor Green
Write-Host "  Total FAIL : $Global:Fail" -ForegroundColor $totalColor
Write-Host ("=" * 60)
