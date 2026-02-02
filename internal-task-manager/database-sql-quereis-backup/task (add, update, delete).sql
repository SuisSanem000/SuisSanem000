-- INSERT simple
INSERT INTO "public"."task" ( "title", "parent_id", "position" )
VALUES
	( 'a', 1, 1 )


-- -- DELETE 
DELETE 
FROM
	"public"."task" 
WHERE
	"id" = 7