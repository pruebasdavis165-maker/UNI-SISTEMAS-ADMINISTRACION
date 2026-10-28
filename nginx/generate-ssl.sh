#!/usr/bin/env bash
# Generador de Certificados SSL para NicaLogistics Reverse Proxy (RNF-01)
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -subj "/C=NI/ST=Managua/L=Managua/O=NicaLogistics/OU=DevOps/CN=localhost"
echo "Certificados SSL generados exitosamente en nginx/ssl/"
