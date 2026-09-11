#!/bin/sh
# Runs automatically before nginx starts (official nginx image convention:
# every executable script in /docker-entrypoint.d/ is sourced on boot).
#
# FinOS's backend has no login system by design (see backend/app/main.py) —
# it's built for one person self-hosting their own instance, not a
# multi-tenant service. That means whoever can reach this container can
# read, edit, and delete all financial data with no password at all. This
# script is the only gate in front of that: if FINOS_BASIC_AUTH_USER and
# FINOS_BASIC_AUTH_PASSWORD are set, it turns on HTTP Basic Auth for the
# whole app (UI + API) at the nginx layer, in front of everything except
# the health check endpoint (which must stay reachable for Docker's own
# HEALTHCHECK and external uptime monitors).
set -eu

AUTH_FRAGMENT=/etc/nginx/basic-auth.conf

if [ -n "${FINOS_BASIC_AUTH_USER:-}" ] && [ -n "${FINOS_BASIC_AUTH_PASSWORD:-}" ]; then
  HASH="$(openssl passwd -apr1 "$FINOS_BASIC_AUTH_PASSWORD")"
  echo "${FINOS_BASIC_AUTH_USER}:${HASH}" > /etc/nginx/.htpasswd
  cat > "$AUTH_FRAGMENT" <<EOF
auth_basic "FinOS";
auth_basic_user_file /etc/nginx/.htpasswd;
EOF
  echo "[finos] Basic auth enabled for user '${FINOS_BASIC_AUTH_USER}'."
else
  : > "$AUTH_FRAGMENT"
  echo "[finos] WARNING: FINOS_BASIC_AUTH_USER / FINOS_BASIC_AUTH_PASSWORD are not set." >&2
  echo "[finos] This instance has NO authentication — anyone who can reach it can read," >&2
  echo "[finos] edit, and delete all financial data. Fine for 'localhost only'. Before" >&2
  echo "[finos] exposing this beyond your own machine, set both variables in .env." >&2
fi
