#!/bin/bash
# Soft-delete end-to-end check. Needs: throwaway Postgres container named chr-sd-pg (port 54329, db chr,
# user postgres, pw t), `prisma db push` + seed done with SEED_*_PASSWORD env below, and the built app
# running on 127.0.0.1:3399 (`next start -p 3399`, AUTH_SECRET + DATABASE_URL set). Run: bash tests/soft-delete/e2e.sh
B=http://127.0.0.1:3399; J=${TMPDIR:-/tmp}/chr-sd; mkdir -p $J; PASS=0; FAIL=0
q(){ docker exec chr-sd-pg psql -U postgres -d chr -tAc "$1"; }
ok(){ if [ "$2" = "$3" ]; then echo "PASS $1 ($2)"; PASS=$((PASS+1)); else echo "FAIL $1 expected=$3 got=$2"; FAIL=$((FAIL+1)); fi; }
rm -f $J/*.jar
adminlogin(){ rm -f $J/a.jar; CS=$(curl -s -c $J/a.jar $B/api/auth/csrf | sed 's/.*"csrfToken":"\([^"]*\)".*/\1/'); curl -s -o /dev/null -b $J/a.jar -c $J/a.jar -X POST $B/api/auth/callback/credentials -d "csrfToken=$CS&email=admin@cherishu.com&password=AdminPass_12345&json=true"; curl -s -b $J/a.jar $B/api/auth/session; }
curl -s -o /dev/null -c $J/s.jar -X POST $B/api/sup-min/login -H 'content-type: application/json' -d '{"email":"superadmin@cherishu.com","password":"SuperPass_12345"}'
S=$(adminlogin); echo "$S" | grep -q admin@cherishu.com && ok admin-login yes yes || ok admin-login no yes
WS=$(q "select id from \"Workspace\" where slug='acme'")
VN=$(q "select name from \"CompanyValue\" where \"workspaceId\"='$WS' order by name limit 1"); VID=$(q "select id from \"CompanyValue\" where \"workspaceId\"='$WS' and name='$VN'")
BN=$(q "select name from \"Badge\" where \"workspaceId\"='$WS' order by name limit 1"); BID=$(q "select id from \"Badge\" where \"workspaceId\"='$WS' and name='$BN'")
curl -s -b $J/a.jar -X POST $B/api/admin/rewards -H 'content-type: application/json' -d '{"name":"SDTestReward","description":"x","pointsCost":10,"type":"MERCHANDISE","provider":"MANUAL"}' > $J/rw.json; cat $J/rw.json | head -c 200; echo
RID=$(q "select id from \"Reward\" where name='SDTestReward'")
[ "$(curl -s -b $J/a.jar $B/admin/values | grep -c "$VN")" -gt 0 ] && ok value-listed yes yes || ok value-listed no yes
[ "$(curl -s -b $J/a.jar $B/admin/rewards | grep -c SDTestReward)" -gt 0 ] && ok reward-listed yes yes || ok reward-listed no yes
# admin deletes
ok del-value-http $(curl -s -o /dev/null -w '%{http_code}' -b $J/a.jar -X DELETE $B/api/admin/values/$VID) 200
ok del-badge-http $(curl -s -o /dev/null -w '%{http_code}' -b $J/a.jar -X DELETE $B/api/admin/badges/$BID) 200
ok del-reward-http $(curl -s -o /dev/null -w '%{http_code}' -b $J/a.jar -X DELETE $B/api/admin/rewards/$RID) 200
ok value-row-kept-deletedAt-set "$(q "select count(*) from \"CompanyValue\" where id='$VID' and \"deletedAt\" is not null")" 1
ok badge-row-kept-deletedAt-set "$(q "select count(*) from \"Badge\" where id='$BID' and \"deletedAt\" is not null")" 1
ok reward-row-kept-deletedAt-set "$(q "select count(*) from \"Reward\" where id='$RID' and \"deletedAt\" is not null")" 1
ok value-gone-from-admin-page "$(curl -s -b $J/a.jar $B/admin/values | grep -c "$VN")" 0
ok value-gone-from-send-page "$(curl -s -b $J/a.jar $B/dashboard/send | grep -c "\"$VN\"")" 0
ok reward-gone-from-admin-page "$(curl -s -b $J/a.jar $B/admin/rewards | grep -c SDTestReward)" 0
ok reward-gone-from-catalog "$(curl -s -b $J/a.jar $B/dashboard/rewards | grep -c SDTestReward)" 0
ok redeem-deleted-reward-404 "$(curl -s -o /dev/null -w '%{http_code}' -b $J/a.jar -X POST $B/api/redemptions -H 'content-type: application/json' -d "{\"rewardId\":\"$RID\"}")" 404
RCV=$(q "select id from \"User\" where \"workspaceId\"='$WS' and email like 'user@%' limit 1")
KC=$(curl -s -o $J/k.out -w '%{http_code}' -b $J/a.jar -X POST $B/api/recognitions -H 'content-type: application/json' -d "{\"receiverId\":\"$RCV\",\"message\":\"nice work here\",\"points\":5,\"badgeId\":\"$BID\"}"); echo "kudos body: $(head -c 120 $J/k.out)"
ok kudos-with-deleted-badge-400 "$KC" 400
# re-create same value name revives
curl -s -o /dev/null -b $J/a.jar -X POST $B/api/admin/values -H 'content-type: application/json' -d "{\"name\":\"$VN\",\"emoji\":\"X\"}"
ok recreate-revives-same-row "$(q "select count(*) from \"CompanyValue\" where id='$VID' and \"deletedAt\" is null")" 1
# platform workspace delete
[ "$(curl -s -b $J/s.jar $B/sup-min/workspaces | grep -c acme)" -gt 0 ] && ok ws-listed-before yes yes || ok ws-listed-before no yes
USERS=$(q "select count(*) from \"User\" where \"workspaceId\"='$WS'")
ok sup-del-ws-http "$(curl -s -o /dev/null -w '%{http_code}' -b $J/s.jar -X DELETE $B/api/sup-min/workspaces/$WS)" 200
ok ws-row-kept-deletedAt-set "$(q "select count(*) from \"Workspace\" where id='$WS' and \"deletedAt\" is not null")" 1
ok ws-users-not-wiped "$(q "select count(*) from \"User\" where \"workspaceId\"='$WS'")" "$USERS"
ok ws-data-not-wiped-recognitions-gt0 "$([ "$(q "select count(*) from \"Recognition\" where \"workspaceId\"='$WS'")" -gt 0 ] && echo yes)" yes
ok ws-gone-from-sup-min-list "$(curl -s -b $J/s.jar $B/sup-min/workspaces | grep -c '>acme<\|/acme')" 0
ok ws-gone-from-sup-min-detail "$(curl -s -o /dev/null -w '%{http_code}' -b $J/s.jar $B/sup-min/workspaces/$WS)" 404
ok existing-session-locked-out "$(curl -s -o /dev/null -w '%{http_code}' -b $J/a.jar $B/admin/values)" 307
ok existing-session-api-locked "$(curl -s -o /dev/null -w '%{http_code}' -b $J/a.jar -X POST $B/api/redemptions -H 'content-type: application/json' -d "{\"rewardId\":\"x\"}")" 307
S=$(adminlogin); echo "$S" | grep -q admin@cherishu.com && ok deleted-ws-admin-login-blocked still-logged-in blocked || ok deleted-ws-admin-login-blocked blocked blocked
# restore (platform admin) brings the workspace back
ok ws-restore-http "$(curl -s -o /dev/null -w '%{http_code}' -b $J/s.jar -X POST $B/api/sup-min/workspaces/$WS/restore)" 200
ok ws-restore-clears-deletedAt "$(q "select count(*) from \"Workspace\" where id='$WS' and \"deletedAt\" is null")" 1
ok ws-restore-twice-404 "$(curl -s -o /dev/null -w '%{http_code}' -b $J/s.jar -X POST $B/api/sup-min/workspaces/$WS/restore)" 404
ok ws-back-in-sup-min-list "$([ "$(curl -s -b $J/s.jar $B/sup-min/workspaces | grep -c acme)" -gt 0 ] && echo yes)" yes
echo "RESULT pass=$PASS fail=$FAIL"
