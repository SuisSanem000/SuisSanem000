WITH table_with_sequence as (
SELECT
    d.refobjid::regclass::text tablename,
    c.relname::text sequencename,
    np.nspname::text schemaname,
    a.attname::text attname,
    u.usename::text
FROM
    pg_depend d
    INNER JOIN pg_class c ON c.oid = d.objid
        AND c.relkind = 'S'
    INNER JOIN pg_namespace np ON np.oid = c.relnamespace
        AND (np.nspname NOT LIKE 'pg_%'
            AND np.nspname != 'information_schema')
        INNER JOIN pg_user u ON u.usesysid = c.relowner
        INNER JOIN pg_attribute a ON a.attrelid = d.refobjid
            AND a.attnum = d.refobjsubid
)

SELECT
    'ALTER SEQUENCE '|| QUOTE_LITERAL(QUOTE_IDENT(schemaname) || '.' || QUOTE_IDENT(sequencename)) ||' OWNED BY ' || tablename || '.' || QUOTE_IDENT(attname)
FROM table_with_sequence 