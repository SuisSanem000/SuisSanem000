SELECT
	s.relname AS seq,
	n.nspname AS sch,
	T.relname AS tab,
	A.attname AS col 
FROM
	pg_class s
	JOIN pg_depend d ON d.objid = s.OID 
	AND d.classid = 'pg_class' :: REGCLASS 
	AND d.refclassid = 'pg_class' ::
	REGCLASS JOIN pg_class T ON T.OID = d.refobjid
	JOIN pg_namespace n ON n.OID = T.relnamespace
	JOIN pg_attribute A ON A.attrelid = T.OID 
	AND A.attnum = d.refobjsubid 
WHERE
	s.relkind = 'S' 
	AND d.deptype = 'a'
	AND T.relname = 'task';
	