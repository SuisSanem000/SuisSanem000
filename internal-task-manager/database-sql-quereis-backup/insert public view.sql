INSERT INTO "public"."view" ( "title", "position", "creator_id", "data", "is_public" ) SELECT
'x',
COALESCE ( MAX ( "position" ) + 1, 0 ),
1,
'{}' :: JSON,
't' 
FROM
	"view" 
WHERE
	is_public = 't' RETURNING *;