SELECT
	tag."id",
	tag."name" 
FROM
	tag 
WHERE
	LOWER ( tag."name" ) LIKE LOWER ( '%L%' );