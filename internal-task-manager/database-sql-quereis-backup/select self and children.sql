WITH RECURSIVE GetALLChild ( "id", title, "parent_id", "position" ) AS (
	SELECT
		"id",
		title,
		"parent_id",
		"position" 
	FROM
		task 
	WHERE
		"id" = 6 UNION ALL
	SELECT
		task."id",
		task.title,
		task."parent_id",
		task."position" 
	FROM
		GetALLChild
		INNER JOIN task ON GetALLChild."id" = task."parent_id" 
	) SELECT
	* 
FROM
	GetALLChild 
ORDER BY
	parent_id,
	"position";