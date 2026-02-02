INSERT INTO "public"."user" ( "name", "username", "password", "email", "avatar", "auth", "position" ) SELECT
( 'a', 'a', 'a', 'a', 'a', gen_random_uuid ( ), COALESCE ( MAX ( "position" ) + 1, 0 ) ) 
FROM
	"user" RETURNING *