-- Sign in with username + password
SELECT
	COUNT(*)
FROM
	"user" 
WHERE
	"user"."username" = 'sanem444' 
	AND "user"."password" = '1234' -- Sign in with email + password
	
-- Sign in with username + password
SELECT
	COUNT(*)
FROM
	"user" 
WHERE
	"user"."email" = 'sanem444@gmail.com' 
	AND "user"."password" = '1234' -- Sign in with email + password