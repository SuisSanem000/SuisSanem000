SELECT
	"id",
	title,
	"position",
	creator_id,
	created_at,
	updated_at,
	"data" 
FROM
	"view" 
WHERE
	( is_public = 'f' ) 
	AND ( creator_id = 1 )