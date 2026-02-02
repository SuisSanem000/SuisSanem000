SELECT
	*,
-- 	Cast json
	"data" :: JSON 
FROM
	"view" 
WHERE
	title = 'Inbox'