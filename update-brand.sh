#!/bin/bash

# Brand Configuration Update Script
# This script updates all remaining "Biponi" references to use BRAND_CONFIG

set -e

FILES=(
  "src/components/app-sidebar.tsx"
  "src/components/mobile-bottom-nav.tsx"
  "src/components/MobileDrawerNav.tsx"
  "src/coreComponents/navbar.tsx"
  "src/components/pdf/TransactionPDF.tsx"
)

echo "🚀 Starting brand configuration update..."

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Processing: $file"

    # Add BRAND_CONFIG import after the last import statement
    if ! grep -q "BRAND_CONFIG" "$file"; then
      # Find the correct import path based on file location
      if [[ $file == src/components/* ]]; then
        sed -i '1s/^/import { BRAND_CONFIG } from "..\/..\/config\/brand";\n/' "$file"
      elif [[ $file == src/coreComponents/* ]]; then
        sed -i '1s/^/import { BRAND_CONFIG } from "..\/config\/brand";\n/' "$file"
      elif [[ $file == src/components/pdf/* ]]; then
        sed -i '1s/^/import { BRAND_CONFIG } from "..\/..\/config\/brand";\n/' "$file"
      fi
    fi

    # Replace "Biponi" with BRAND_CONFIG.shortName in alt text and labels
    sed -i "s/'Biponi Logo'/\`\${BRAND_CONFIG.shortName} Logo\`/g" "$file"
    sed -i "s/'Biponi'/BRAND_CONFIG.shortName/g" "$file"
    sed -i "s/Biponi Admin Panel/BRAND_CONFIG.name Panel/g" "$file"
    sed -i "s/Biponi Transaction Management System/BRAND_CONFIG.name Transaction Management System/g" "$file"

    echo "✅ Updated: $file"
  else
    echo "⚠️  File not found: $file"
  fi
done

echo ""
echo "✨ Brand configuration update complete!"
echo "📝 Please review the changes and test the application."
echo ""
echo "Remaining manual updates needed:"
echo "  - public/index.html (page title)"
echo "  - public/manifest.json (PWA manifest)"
echo "  - PDF generator files in src/utils/"
echo ""
echo "Environment variables to set in .env:"
echo "  REACT_APP_BRAND_NAME=\"Prior Admin\""
echo "  REACT_APP_BRAND_SHORT_NAME=\"Prior\""
echo "  REACT_APP_BRAND_COMPANY_NAME=\"PriorBD\""
echo "  REACT_APP_BRAND_WEBSITE=\"https://priorbd.com\""
echo "  REACT_APP_BRAND_EMAIL=\"prior.retailshop.info.bd@gmail.com\""
