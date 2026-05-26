DO $$
DECLARE
    target_user_id uuid;
    tenant_count integer;
    property_count integer;
BEGIN
    SELECT id
    INTO target_user_id
    FROM "user"
    WHERE lower(email) = 'valeryaleshka@gmail.com';

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User valeryaleshka@gmail.com was not found';
    END IF;

    WITH tenant_source AS (
        SELECT
            n,
            'Tenant' AS first_name,
            'Demo ' || lpad(n::text, 4, '0') AS last_name,
            '+1555' || lpad(n::text, 7, '0') AS phone_number,
            'valeryaleshka.seed.' || lpad(n::text, 4, '0') || '@example.com' AS email
        FROM generate_series(1, 1000) AS n
    )
    INSERT INTO tenant (first_name, last_name, phone_number, email, user_id)
    SELECT first_name, last_name, phone_number, email, target_user_id
    FROM tenant_source s
    WHERE NOT EXISTS (
        SELECT 1
        FROM tenant t
        WHERE t.user_id = target_user_id
          AND t.email = s.email
    );

    WITH property_source AS (
        SELECT
            n,
            'Seed Unit ' || lpad(n::text, 4, '0') AS name,
            CASE (n % 4)
                WHEN 0 THEN 'Apartment'
                WHEN 1 THEN 'Condo'
                WHEN 2 THEN 'Townhouse'
                ELSE 'Studio'
            END AS type,
            (1000 + n)::text || ' Demo Street, Unit ' || lpad(n::text, 4, '0') AS address,
            (900 + (n % 20) * 75)::numeric(18, 2) AS price,
            1 + (n % 25) AS level,
            date '2026-01-01' + ((n % 365)::int) AS start_date,
            date '2027-01-01' + ((n % 365)::int) AS end_date,
            'valeryaleshka.seed.' || lpad(n::text, 4, '0') || '@example.com' AS tenant_email
        FROM generate_series(1, 1000) AS n
    )
    INSERT INTO property (name, type, address, price, level, user_id, tenant_id, start_date, end_date)
    SELECT
        s.name,
        s.type,
        s.address,
        s.price,
        s.level,
        target_user_id,
        t.id,
        s.start_date,
        s.end_date
    FROM property_source s
    JOIN tenant t
      ON t.user_id = target_user_id
     AND t.email = s.tenant_email
    WHERE NOT EXISTS (
        SELECT 1
        FROM property p
        WHERE p.user_id = target_user_id
          AND p.name = s.name
          AND p.address = s.address
    );

    SELECT count(*)
    INTO tenant_count
    FROM tenant
    WHERE user_id = target_user_id
      AND email LIKE 'valeryaleshka.seed.%@example.com';

    SELECT count(*)
    INTO property_count
    FROM property
    WHERE user_id = target_user_id
      AND name LIKE 'Seed Unit %'
      AND address LIKE '% Demo Street, Unit %';

    RAISE NOTICE 'Generated tenant rows for valeryaleshka@gmail.com: %', tenant_count;
    RAISE NOTICE 'Generated property rows for valeryaleshka@gmail.com: %', property_count;
END $$;
