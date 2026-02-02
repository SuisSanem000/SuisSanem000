ALTER SEQUENCE priority_id_seq RESTART WITH 1;
ALTER SEQUENCE project_id_seq RESTART WITH 1;
ALTER SEQUENCE status_id_seq RESTART WITH 1;
ALTER SEQUENCE tag_id_seq RESTART WITH 1;
ALTER SEQUENCE task_id_seq RESTART WITH 1;
ALTER SEQUENCE task_assignee_id_seq RESTART WITH 1;
ALTER SEQUENCE task_member_id_seq RESTART WITH 1;
ALTER SEQUENCE task_tag_id_seq RESTART WITH 1;
ALTER SEQUENCE user_id_seq RESTART WITH 1;
ALTER SEQUENCE view_id_seq RESTART WITH 1;


-- SELECT setval('status_id_seq', coalesce((select max(status."id")+1 from status), 0), false); 