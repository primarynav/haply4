#!/usr/bin/env bash
# Build archive, export IPA, upload to App Store Connect via API key (JWT).
#
# Prerequisites:
# 1. App Store Connect → Users and Access → Integrations → App Store Connect API:
#    Create a key with "App Manager" or "Admin", download AuthKey_XXXXXX.p8 (once).
# 2. Place the file as:  ~/private_keys/AuthKey_<KEY_ID>.p8
#    (or set API_PRIVATE_KEYS_DIR to the folder containing it)
# 3. Export env vars before running:
#    export ASC_ISSUER_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # Issuer ID from same page
#    export ASC_KEY_ID="6CVRZNRB6K"   # your Key ID
#
# Optional: export ASC_TEAM_ID="MB8JL45C87" if your team ID differs (update ios/ExportOptions-appstore.plist too).

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export DEVELOPER_DIR="${DEVELOPER_DIR:-/Applications/Xcode.app/Contents/Developer}"
ARCHIVE="$ROOT/ios/dist/App.xcarchive"
EXPORT_DIR="$ROOT/ios/dist/export"
PLIST="$ROOT/ios/ExportOptions-appstore.plist"

: "${ASC_ISSUER_ID:?Set ASC_ISSUER_ID (Issuer ID from App Store Connect API keys page)}"
: "${ASC_KEY_ID:?Set ASC_KEY_ID (e.g. 6CVRZNRB6K)}"

mkdir -p "$ROOT/ios/dist"

echo "==> Building web + Capacitor sync"
(cd "$ROOT" && npm run build && npx cap sync ios)

echo "==> Archiving (Release)"
xcodebuild -project "$ROOT/ios/App/App.xcodeproj" \
  -scheme App \
  -configuration Release \
  -archivePath "$ARCHIVE" \
  -destination 'generic/platform=iOS' \
  -allowProvisioningUpdates \
  archive \
  DEVELOPMENT_TEAM="${ASC_TEAM_ID:-MB8JL45C87}" \
  CODE_SIGN_STYLE=Automatic

echo "==> Exporting IPA for App Store Connect"
rm -rf "$EXPORT_DIR"
xcodebuild -exportArchive \
  -archivePath "$ARCHIVE" \
  -exportPath "$EXPORT_DIR" \
  -exportOptionsPlist "$PLIST" \
  -allowProvisioningUpdates

IPA=$(ls "$EXPORT_DIR"/*.ipa 2>/dev/null | head -1)
if [[ -z "$IPA" || ! -f "$IPA" ]]; then
  echo "No .ipa found in $EXPORT_DIR" >&2
  exit 1
fi

echo "==> Uploading: $IPA"
xcrun altool --upload-app -f "$IPA" -t ios --api-key "$ASC_KEY_ID" --api-issuer "$ASC_ISSUER_ID"

echo "==> Done. Check App Store Connect → TestFlight / Builds."
