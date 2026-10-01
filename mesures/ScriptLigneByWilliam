#!/usr/bin/env bash
# loc.sh : compte les lignes de code (LOC) d'un dossier, récursivement
# Usage : ./loc.sh [dossier] (par défaut : dossier courant)

DIR="${1:-.}"

if [ ! -d "$DIR" ]; then
    echo "Erreur : '$DIR' n'est pas un dossier." >&2
    exit 1
fi

total=0
fichiers=0

# -print0 / read -d '' : gère les noms avec espaces
while IFS= read -r -d '' f; do
    # Ignorer les fichiers binaires
    if grep -Iq . "$f" 2>/dev/null; then
        # Ne compte que les lignes non vides
        n=$(grep -cv '^[[:space:]]*$' "$f")
        printf "%8d  %s\n" "$n" "$f"
        total=$((total + n))
        fichiers=$((fichiers + 1))
    fi
done < <(find "$DIR" \
    \( -name .git -o -name node_modules -o -name .venv -o -name __pycache__ \) -prune \
    -o -type f -print0)

echo "------------------------------"
echo "Fichiers : $fichiers"
echo "Total LOC : $total"
