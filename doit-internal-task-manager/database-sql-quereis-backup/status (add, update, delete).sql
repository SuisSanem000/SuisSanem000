-- -- INSERT
-- INSERT INTO "public"."status" ( "name", "background_color", "text_color", "position" ) SELECT
-- 'a',
-- 'a',
-- 'a',
-- COALESCE ( MAX ( "position" ) + 1, 0 ) 
-- FROM
-- 	"status" RETURNING *
	
	 -- -- UPDATE
	UPDATE "public"."status" 
	SET "name" = 'b',
	"background_color" = 'b',
	"text_color" = 'b',
	"position" = 1 
WHERE
	"id" = 5 -- -- DELETE 
-- DELETE 
-- FROM
-- 	"public"."status" 
-- WHERE
-- 	"id" = 5