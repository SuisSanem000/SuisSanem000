-- -- Add a project 
INSERT INTO "public"."project" ( "name", "creator_id", "position" )
SELECT
	'a', 1,COALESCE ( MAX ( "position" ) + 1, 0 ) 
	FROM
	"project" RETURNING *

-- -- Update a project
UPDATE "public"."project" 
SET "name" = 'b', 
"position" = 1
WHERE
	( "project"."id" = 1 ) 
	AND ( creator_id = 1 ) RETURNING *

-- -- Delete a project
-- DELETE FROM "public"."project" WHERE "name" = 'fdsd'
-- DELETE 
-- FROM
-- 	"project" 
-- WHERE
-- 	( "project"."id" = 15 ) 
-- 	AND ( creator_id = 3 ) RETURNING *