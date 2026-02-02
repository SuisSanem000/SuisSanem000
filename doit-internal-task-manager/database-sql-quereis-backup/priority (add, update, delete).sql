-- INSERT
INSERT INTO "public"."priority" ( "name", "background_color", "text_color", "position" ) SELECT
'a',
'a',
'a',
COALESCE ( MAX ( "position" ) + 1, 0 ) 
FROM
	"priority" RETURNING *
	
-- -- -- UPDATE
-- UPDATE "public"."priority" 
-- SET "name" = 'b',
-- "background_color" = 'b',
-- "text_color" = 'b', 
-- "position" =1
-- WHERE
-- 	"id" = 8 RETURNING *

-- -- -- 	DELETE
-- DELETE 
-- FROM
-- 	"public"."priority" 
-- WHERE
-- 	"id" = 6 RETURNING *