SELECT COUNT
	( * ) 
FROM
	"user" 
WHERE
	( "user".username = 'username' ) 
	OR ( "user".email = 'email' )