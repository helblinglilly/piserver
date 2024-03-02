#!/bin/bash

source /home/joel/dyndns/dyndns.config

IPV4=$(curl -s4 ifconfig.co)
IPV6=$(curl -s6 ifconfig.co)

RESOLVED_IP=$(dig +short "$A_RECORD.$DOMAIN" A)
echo "Resolved IPV4 address: $RESOLVED_IP"

RESOLVED_IPV6=$(dig +short "$A_RECORD.$DOMAIN" AAAA)
echo "Resolved IPV6 address: $RESOLVED_IPV6"

if [[ "$IPV4" != "$RESOLVED_IP" ]]; then
	echo "IPv4 Address has changed from $RESOLVED_IP to $IPV4 - Will update"

	IP4_DNS_ID=$(curl -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=A&name=$A_RECORD.$DOMAIN" \
		-H "Authorization: Bearer $TOKEN" \
		-H "Content-Type: application/json" | jq -r '.result[].id')
	echo "Result ID: $IP4_DNS_ID"

	IP4_RESULT=$(curl -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$IP4_DNS_ID" \
		-H "Authorization: Bearer $TOKEN" \
		-H "Content-Type: application/json" \
		--data '{"type":"A","name":"'$A_RECORD'","content":"'$IPV4'","description":"IPv4 Address to Home Network","proxied":false}')
	echo $IP4_RESULT
fi

if [[ "$IPV6" != "$RESOLVED_IPV6" ]]; then
	echo "IPv6 Address has changed from $RESOLVEDIPV6 to $IPV6 Will update"

	IP6_DNS_ID=$(curl -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=AAAA&name=$AAAA_RECORD.$DOMAIN" \
		-H "Authorization: Bearer $TOKEN" \
		-H "Content-Type: application/json" | jq -r '.result[].id')
	echo "Result ID: $IP6_DNS_ID"

	IP6_RESULT=$(curl -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$IP6_DNS_ID" \
		-H "Authorization: Bearer $TOKEN" \
		-H "Content-Type: application/json" \
		--data '{"type":"AAAA","name":"'$AAAA_RECORD'","content":"'$IPV6'","description":"IPv6 Address to Home Network","proxied":false}')
	echo $IP6_RESULT
fi