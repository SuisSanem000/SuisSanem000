-- DELETE 
FROM
	"public"."user" 
WHERE
	"id" = 25 
	AND ( ( SELECT COUNT ( * ) FROM project WHERE creator_id = 25 ) = 0 ) RETURNING *