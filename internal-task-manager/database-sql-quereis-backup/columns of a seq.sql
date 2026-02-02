SELECT *, t.oid::regclass AS table_name,
       a.attname AS column_name,
       s.relname AS sequence_name
FROM pg_class AS t
   JOIN pg_attribute AS a
      ON a.attrelid = t.oid
   JOIN pg_depend AS d
      ON d.refobjid = t.oid
         AND d.refobjsubid = a.attnum
   JOIN pg_class AS s
      ON s.oid = d.objid
WHERE d.classid = 'pg_catalog.pg_class'::regclass
  AND d.refclassid = 'pg_catalog.pg_class'::regclass
  AND d.deptype IN ('i', 'a')
  AND t.relkind IN ('r', 'P')
  AND s.relkind = 'S'; 
	
	
	ORDER BY
	sequence_name
	