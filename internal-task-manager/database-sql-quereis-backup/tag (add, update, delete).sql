-- -- Add a tag 
INSERT INTO "public"."tag" ( "name", "background_color", "text_color", "position" ) SELECT
'a',
'a',
'a',
COALESCE ( MAX ( "position" ) + 1, 0 ) 
FROM
	"priority" tag *

-- -- Update a tag
UPDATE "public"."tag" 
SET "name" = 'b',
"background_color" = 'b',
"text_color" = 'b',
"position" = 1 
WHERE
	"id" = 4

-- -- Delete a tag
-- DELETE 
-- FROM
-- 	"public"."tag" 
-- WHERE
-- 	"id" = 4