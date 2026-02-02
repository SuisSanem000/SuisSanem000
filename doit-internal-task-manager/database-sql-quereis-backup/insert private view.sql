INSERT INTO "public"."view" ( "title", "position", "creator_id", "data" ) SELECT
'x',
COALESCE ( MAX ( "position" ) + 1, 0 ),
1,
'{}' :: JSON 
FROM
	"view" 
WHERE
	is_public = 'f' RETURNING *;