#!/bin/sh
set -e

# Print received variables for debugging (excluding secrets)
echo "Injecting environment variables into the frontend..."
echo "VITE_API_AUTH_URL: $VITE_API_AUTH_URL"
echo "VITE_API_ALIAS_URL: $VITE_API_ALIAS_URL"

# Find JS files in the Vite build directory
for file in /usr/share/nginx/html/assets/*.js; do
  if [ -f "$file" ]; then
    # Use sed to replace localhost fallbacks with the injected variables
    # Only if the variables exist
    if [ ! -z "$VITE_API_AUTH_URL" ]; then
      sed -i "s|http://localhost:3000|${VITE_API_AUTH_URL}|g" "$file"
    fi
    
    if [ ! -z "$VITE_API_ALIAS_URL" ]; then
      sed -i "s|http://localhost:3001|${VITE_API_ALIAS_URL}|g" "$file"
    fi
    
    if [ ! -z "$VITE_API_SUBMISSION_URL" ]; then
      sed -i "s|http://localhost:3003|${VITE_API_SUBMISSION_URL}|g" "$file"
    fi
    
    if [ ! -z "$VITE_API_ADMIN_URL" ]; then
      sed -i "s|http://localhost:3009|${VITE_API_ADMIN_URL}|g" "$file"
    fi
  fi
done

# Inject backend IP into Nginx configuration for Reverse Proxy
if [ ! -z "$MS_CORE_IP" ]; then
  echo "Injecting MS_CORE_IP: $MS_CORE_IP into Nginx proxy_pass..."
  sed -i "s|MS_CORE_IP|${MS_CORE_IP}|g" /etc/nginx/conf.d/default.conf
fi

if [ ! -z "$MS_PROCESSING_IP" ]; then
  echo "Injecting MS_PROCESSING_IP: $MS_PROCESSING_IP into Nginx proxy_pass..."
  sed -i "s|MS_PROCESSING_IP|${MS_PROCESSING_IP}|g" /etc/nginx/conf.d/default.conf
fi

echo "Injection completed. Starting Nginx..."

# Execute the Docker CMD command (which starts Nginx by default)
exec "$@"
