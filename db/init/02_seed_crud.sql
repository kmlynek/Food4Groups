-- Food4Groups
-- Dane demonstracyjne do prezentacji najważniejszych procesów aplikacji
-- Skrypt jest wykonywany po 01_DB_schema.sql podczas pierwszego uruchomienia kontenera PostgreSQL

BEGIN;

SET LOCAL TIME ZONE 'UTC';

-- Role techniczne wymagane przez mechanizm autoryzacji
INSERT INTO public."AspNetRoles" ("Id", "Name", "NormalizedName", "ConcurrencyStamp")
VALUES
    ('549ffa74-c1f9-49be-a872-10a8aed3dcc0', 'Admin', 'ADMIN', 'f3fdcfbb-f3ba-46e8-8a83-c024b312f4ee'),
    ('26ee6281-437c-471f-a8c8-d528bfdd41cc', 'CateringEmployee', 'CATERINGEMPLOYEE', 'c15e772d-72f6-4eba-b7d4-aa48df72839c'),
    ('06e8a154-4cf6-463a-ae56-9cf1b3e8b5ec', 'Dietitian', 'DIETITIAN', 'be984943-6f07-4f8d-a07c-23b8319b8ea5'),
    ('919737cc-fa07-45fd-8a6a-1e5bfe01eb28', 'GroupCoordinator', 'GROUPCOORDINATOR', 'f19b7fcb-e6fe-48f4-851f-572107c0a429'),
    ('9f470979-32b5-4c46-8145-9a23203a3305', 'User', 'USER', '9c61f252-1c15-4c96-887c-17799bb7b10d')
ON CONFLICT ("NormalizedName") DO UPDATE SET
    "Name" = EXCLUDED."Name";

-- Konta demonstracyjne zgodne z danymi logowania używanymi przez backend
INSERT INTO public."AspNetUsers" (
    "Id",
    "UserName",
    "NormalizedUserName",
    "Email",
    "NormalizedEmail",
    "EmailConfirmed",
    "PasswordHash",
    "SecurityStamp",
    "ConcurrencyStamp",
    "PhoneNumber",
    "PhoneNumberConfirmed",
    "TwoFactorEnabled",
    "LockoutEnd",
    "LockoutEnabled",
    "AccessFailedCount"
)
VALUES
    (
        '87ec1dec-71df-4e20-b2b9-94f5adf1711f',
        'admin@food4groups.com',
        'ADMIN@FOOD4GROUPS.COM',
        'admin@food4groups.com',
        'ADMIN@FOOD4GROUPS.COM',
        true,
        'AQAAAAIAAYagAAAAEGY5jx4be1uclGwGrJssFHfnKzE4s6IUZEp7skzmtTqGD4lThKbBJaKwnYYZdBM3Pg==',
        'D3E7HTG6NGHOWGZNG2NSE7C3FSMD276A',
        'bcd93af0-e1ca-49f9-ab67-80a3168ea790',
        null,
        false,
        false,
        null,
        true,
        0
    ),
    (
        '5c00ea3b-5535-46cb-8158-2fd6c392783c',
        'catering@food4groups.com',
        'CATERING@FOOD4GROUPS.COM',
        'catering@food4groups.com',
        'CATERING@FOOD4GROUPS.COM',
        true,
        'AQAAAAIAAYagAAAAEPJRd52LsCQTNOvHE4Ixv0O0/OP2manboz86KaxiVC8KG6zKndrmEwqjdz1n5K3hYQ==',
        'DIOJI6F5RTSNGRIQN5NLFQBMN6SAME7C',
        '741d4da7-4ec1-4102-8379-bbcdef8b6da9',
        null,
        false,
        false,
        null,
        true,
        0
    ),
    (
        '8d6351d2-7e12-4113-9d3c-49c62bee3c63',
        'dietitian@food4groups.com',
        'DIETITIAN@FOOD4GROUPS.COM',
        'dietitian@food4groups.com',
        'DIETITIAN@FOOD4GROUPS.COM',
        true,
        'AQAAAAIAAYagAAAAECJUKMxUYzBou0fMmnPKsnVrFdqU+TZ3uDD78Tsd4XGkg1SVAgFe1FR0MSg00MNKAg==',
        'FOHXRE5SHQXCDR53OO33TNSQSRSIDISB',
        '12969292-00e5-411a-9579-37e1635759a9',
        null,
        false,
        false,
        null,
        true,
        0
    ),
    (
        'c569442e-6acf-4e06-9294-9b88d9771aab',
        'coordinator@food4groups.com',
        'COORDINATOR@FOOD4GROUPS.COM',
        'coordinator@food4groups.com',
        'COORDINATOR@FOOD4GROUPS.COM',
        true,
        'AQAAAAIAAYagAAAAEKqUF29NBq6GHdJ9eBM5ZiuPrdjNvFIOFyV6gQ9BscToRVFAdH9FNzAhLFNgMwpI4g==',
        'CF523I75YVNFID4T6R7Q2EH4X3H46RM4',
        'f0ae6520-60dd-4640-9c1a-8972a9323086',
        null,
        false,
        false,
        null,
        true,
        0
    ),
    (
        'ce4523ca-d148-462a-9105-4386e937b0d0',
        'user@food4groups.com',
        'USER@FOOD4GROUPS.COM',
        'user@food4groups.com',
        'USER@FOOD4GROUPS.COM',
        true,
        'AQAAAAIAAYagAAAAEJIrNyQalRxuibs4BF9CLvdl8GKBzUJeUznLVKKIoPzYlfDltEOZTbnsg3ZQoPON+g==',
        'RPBRFVRSVTKSE3X7WYUDEUWVZRE3NUA2',
        '9f09e9ef-b632-4362-821f-72cc6d533a0c',
        null,
        false,
        false,
        null,
        true,
        0
    )
ON CONFLICT ("NormalizedUserName") DO UPDATE SET
    "UserName" = EXCLUDED."UserName",
    "Email" = EXCLUDED."Email",
    "NormalizedEmail" = EXCLUDED."NormalizedEmail",
    "EmailConfirmed" = EXCLUDED."EmailConfirmed";

-- Przypisanie jednej roli do każdego konta
INSERT INTO public."AspNetUserRoles" ("UserId", "RoleId")
SELECT users."Id", roles."Id"
FROM (
    VALUES
        ('ADMIN@FOOD4GROUPS.COM', 'ADMIN'),
        ('CATERING@FOOD4GROUPS.COM', 'CATERINGEMPLOYEE'),
        ('DIETITIAN@FOOD4GROUPS.COM', 'DIETITIAN'),
        ('COORDINATOR@FOOD4GROUPS.COM', 'GROUPCOORDINATOR'),
        ('USER@FOOD4GROUPS.COM', 'USER')
) AS assignments("NormalizedUserName", "NormalizedRoleName")
JOIN public."AspNetUsers" AS users
    ON users."NormalizedUserName" = assignments."NormalizedUserName"
JOIN public."AspNetRoles" AS roles
    ON roles."NormalizedName" = assignments."NormalizedRoleName"
ON CONFLICT ("UserId", "RoleId") DO NOTHING;

-- Pięć kolejnych dni roboczych z jednym wcześniejszym dniem do prezentacji historii zamówień
CREATE TEMP TABLE food4groups_seed_dates (
    "Day0" timestamp with time zone NOT NULL,
    "Day1" timestamp with time zone NOT NULL,
    "Day2" timestamp with time zone NOT NULL,
    "Day3" timestamp with time zone NOT NULL,
    "Day4" timestamp with time zone NOT NULL
) ON COMMIT DROP;

WITH existing_dates AS (
    SELECT
        MAX("MenuDate") FILTER (WHERE "Id" = 'd5a5c09d-6dcb-4714-a5c1-c95d787d3453') AS "Day0",
        MAX("MenuDate") FILTER (WHERE "Id" = 'b5bce82c-238d-4341-9bf4-848c4c4ff304') AS "Day1",
        MAX("MenuDate") FILTER (WHERE "Id" = '34e4efd4-019c-4368-b329-838b27124ce3') AS "Day2",
        MAX("MenuDate") FILTER (WHERE "Id" = '7717b98d-1a8c-48ae-a3f5-9625968bf65a') AS "Day3",
        MAX("MenuDate") FILTER (WHERE "Id" = '46b7bf7e-0d50-42cf-8964-e1bef77dbd1a') AS "Day4",
        COUNT(*) AS existing_count
    FROM public."MenuDays"
    WHERE "Id" IN (
        'd5a5c09d-6dcb-4714-a5c1-c95d787d3453',
        'b5bce82c-238d-4341-9bf4-848c4c4ff304',
        '34e4efd4-019c-4368-b329-838b27124ce3',
        '7717b98d-1a8c-48ae-a3f5-9625968bf65a',
        '46b7bf7e-0d50-42cf-8964-e1bef77dbd1a'
    )
),
available_dates AS (
    SELECT candidate::date AS business_date
    FROM generate_series(
        CURRENT_DATE - INTERVAL '7 days',
        CURRENT_DATE + INTERVAL '14 days',
        INTERVAL '1 day'
    ) AS candidate
    WHERE EXTRACT(ISODOW FROM candidate) BETWEEN 1 AND 5
),
anchor_date AS (
    SELECT MIN(business_date) AS business_date
    FROM available_dates
    WHERE business_date >= CURRENT_DATE
),
future_dates AS (
    SELECT
        available_dates.business_date,
        ROW_NUMBER() OVER (ORDER BY available_dates.business_date) AS position
    FROM available_dates
    CROSS JOIN anchor_date
    WHERE available_dates.business_date >= anchor_date.business_date
),
generated_dates AS (
    SELECT
        (
            SELECT MAX(available_dates.business_date)
            FROM available_dates
            WHERE available_dates.business_date < anchor_date.business_date
        )::timestamp with time zone AS "Day0",
        MAX(future_dates.business_date) FILTER (WHERE future_dates.position = 1)::timestamp with time zone AS "Day1",
        MAX(future_dates.business_date) FILTER (WHERE future_dates.position = 2)::timestamp with time zone AS "Day2",
        MAX(future_dates.business_date) FILTER (WHERE future_dates.position = 3)::timestamp with time zone AS "Day3",
        MAX(future_dates.business_date) FILTER (WHERE future_dates.position = 4)::timestamp with time zone AS "Day4"
    FROM future_dates
    CROSS JOIN anchor_date
    GROUP BY anchor_date.business_date
)
INSERT INTO food4groups_seed_dates ("Day0", "Day1", "Day2", "Day3", "Day4")
SELECT "Day0", "Day1", "Day2", "Day3", "Day4"
FROM existing_dates
WHERE existing_count = 5
UNION ALL
SELECT "Day0", "Day1", "Day2", "Day3", "Day4"
FROM generated_dates
WHERE NOT EXISTS (
    SELECT 1
    FROM existing_dates
    WHERE existing_count = 5
);

-- Firma cateringowa i obsługiwana grupa
INSERT INTO public."CateringCompanies" (
    "Id", "Name", "IsActive", "CreatedAt", "UpdatedAt"
)
VALUES (
    'f0737d16-428a-4fff-a1a7-ee4464f227e4',
    'Catering Zielony Stół',
    true,
    CURRENT_TIMESTAMP - INTERVAL '2 years',
    CURRENT_TIMESTAMP
)
ON CONFLICT ("Id") DO UPDATE SET
    "Name" = EXCLUDED."Name",
    "IsActive" = EXCLUDED."IsActive",
    "UpdatedAt" = EXCLUDED."UpdatedAt";

INSERT INTO public."Groups" (
    "Id",
    "CateringCompanyId",
    "CoordinatorUserId",
    "Name",
    "MemberCount",
    "CreatedAt",
    "UpdatedAt"
)
VALUES (
    'c682c2aa-b385-4911-9bc6-caf922c8f035',
    'f0737d16-428a-4fff-a1a7-ee4464f227e4',
    (SELECT "Id" FROM public."AspNetUsers" WHERE "NormalizedUserName" = 'COORDINATOR@FOOD4GROUPS.COM'),
    'Biuro Parkowa 12',
    2,
    CURRENT_TIMESTAMP - INTERVAL '8 months',
    CURRENT_TIMESTAMP
)
ON CONFLICT ("Id") DO UPDATE SET
    "CateringCompanyId" = EXCLUDED."CateringCompanyId",
    "CoordinatorUserId" = EXCLUDED."CoordinatorUserId",
    "Name" = EXCLUDED."Name",
    "MemberCount" = EXCLUDED."MemberCount",
    "UpdatedAt" = EXCLUDED."UpdatedAt";

-- Aktywni uczestnicy grupy
INSERT INTO public."GroupMembers" (
    "Id", "GroupId", "UserId", "IsActive", "JoinedAt", "CreatedAt", "UpdatedAt"
)
VALUES
    (
        'd632a7e3-d9ed-40c2-a910-8ddcadd929b5',
        'c682c2aa-b385-4911-9bc6-caf922c8f035',
        (SELECT "Id" FROM public."AspNetUsers" WHERE "NormalizedUserName" = 'USER@FOOD4GROUPS.COM'),
        true,
        CURRENT_TIMESTAMP - INTERVAL '6 months',
        CURRENT_TIMESTAMP - INTERVAL '6 months',
        CURRENT_TIMESTAMP
    ),
    (
        '46d79db6-4ca6-4e8d-811d-0d2377116cdf',
        'c682c2aa-b385-4911-9bc6-caf922c8f035',
        (SELECT "Id" FROM public."AspNetUsers" WHERE "NormalizedUserName" = 'COORDINATOR@FOOD4GROUPS.COM'),
        true,
        CURRENT_TIMESTAMP - INTERVAL '8 months',
        CURRENT_TIMESTAMP - INTERVAL '8 months',
        CURRENT_TIMESTAMP
    )
ON CONFLICT ("Id") DO UPDATE SET
    "GroupId" = EXCLUDED."GroupId",
    "UserId" = EXCLUDED."UserId",
    "IsActive" = EXCLUDED."IsActive",
    "JoinedAt" = EXCLUDED."JoinedAt",
    "UpdatedAt" = EXCLUDED."UpdatedAt";

-- Naturalna oferta obiadowa
INSERT INTO public."Dishes" (
    "Id", "CateringCompanyId", "Name", "Description", "IsActive", "CreatedAt", "UpdatedAt"
)
VALUES
    (
        '75cbf0a6-39d8-4749-8caf-d4850a50b6fb',
        'f0737d16-428a-4fff-a1a7-ee4464f227e4',
        'Pieczony kurczak z ziemniakami i surówką',
        'Pierś z kurczaka pieczona z ziołami, ziemniaki oraz surówka z białej kapusty',
        true,
        CURRENT_TIMESTAMP - INTERVAL '10 months',
        CURRENT_TIMESTAMP
    ),
    (
        '41075ca7-fc49-4295-9d09-9f3b74be7e22',
        'f0737d16-428a-4fff-a1a7-ee4464f227e4',
        'Pulpety drobiowe w sosie koperkowym',
        'Pulpety z indyka podawane z kaszą jęczmienną i buraczkami',
        true,
        CURRENT_TIMESTAMP - INTERVAL '10 months',
        CURRENT_TIMESTAMP
    ),
    (
        '8f41eec7-8f81-467d-b4ba-f0ef643cf8cc',
        'f0737d16-428a-4fff-a1a7-ee4464f227e4',
        'Dorsz pieczony z ryżem i brokułami',
        'Filet z dorsza pieczony z cytryną, ryż oraz brokuły gotowane na parze',
        true,
        CURRENT_TIMESTAMP - INTERVAL '10 months',
        CURRENT_TIMESTAMP
    ),
    (
        'd6e84232-2972-489d-ab13-134658a97f89',
        'f0737d16-428a-4fff-a1a7-ee4464f227e4',
        'Makaron penne ze szpinakiem i suszonymi pomidorami',
        'Makaron w łagodnym sosie śmietanowym ze szpinakiem i suszonymi pomidorami',
        true,
        CURRENT_TIMESTAMP - INTERVAL '10 months',
        CURRENT_TIMESTAMP
    ),
    (
        '35faaa56-29d3-482b-8d1d-90a89c45ded2',
        'f0737d16-428a-4fff-a1a7-ee4464f227e4',
        'Kotleciki warzywne z kaszą bulgur',
        'Kotleciki z cukinii i marchewki podawane z kaszą bulgur oraz sosem jogurtowym',
        true,
        CURRENT_TIMESTAMP - INTERVAL '10 months',
        CURRENT_TIMESTAMP
    ),
    (
        '01e3ad4e-abe1-468f-b803-ccbeb66b69a8',
        'f0737d16-428a-4fff-a1a7-ee4464f227e4',
        'Naleśniki z twarogiem i owocami',
        'Naleśniki z delikatnym nadzieniem twarogowym i musem owocowym',
        true,
        CURRENT_TIMESTAMP - INTERVAL '10 months',
        CURRENT_TIMESTAMP
    )
ON CONFLICT ("Id") DO UPDATE SET
    "CateringCompanyId" = EXCLUDED."CateringCompanyId",
    "Name" = EXCLUDED."Name",
    "Description" = EXCLUDED."Description",
    "IsActive" = EXCLUDED."IsActive",
    "UpdatedAt" = EXCLUDED."UpdatedAt";

INSERT INTO public."Addons" (
    "Id", "CateringCompanyId", "Name", "Description", "IsActive", "CreatedAt", "UpdatedAt"
)
VALUES
    (
        'bc757a18-c214-4d21-a299-c84783ccc8fd',
        'f0737d16-428a-4fff-a1a7-ee4464f227e4',
        'Kompot domowy',
        'Kompot z sezonowych owoców',
        true,
        CURRENT_TIMESTAMP - INTERVAL '10 months',
        CURRENT_TIMESTAMP
    ),
    (
        'a95a9b72-b895-4bbc-99cb-a33a22602b67',
        'f0737d16-428a-4fff-a1a7-ee4464f227e4',
        'Sałatka owocowa',
        'Porcja świeżych owoców sezonowych',
        true,
        CURRENT_TIMESTAMP - INTERVAL '10 months',
        CURRENT_TIMESTAMP
    ),
    (
        'e2f0cbbe-a333-43d4-9ecc-38131de92061',
        'f0737d16-428a-4fff-a1a7-ee4464f227e4',
        'Jogurt naturalny z granolą',
        'Jogurt naturalny z granolą i owocami',
        true,
        CURRENT_TIMESTAMP - INTERVAL '10 months',
        CURRENT_TIMESTAMP
    )
ON CONFLICT ("Id") DO UPDATE SET
    "CateringCompanyId" = EXCLUDED."CateringCompanyId",
    "Name" = EXCLUDED."Name",
    "Description" = EXCLUDED."Description",
    "IsActive" = EXCLUDED."IsActive",
    "UpdatedAt" = EXCLUDED."UpdatedAt";

-- Pakiet przypisany do grupy
INSERT INTO public."Packages" (
    "Id", "CateringCompanyId", "Name", "PricePerPerson", "IsActive", "CreatedAt", "UpdatedAt"
)
VALUES (
    'f1aa49a4-1398-42f1-948b-f9f4215ed2b4',
    'f0737d16-428a-4fff-a1a7-ee4464f227e4',
    'Pakiet obiadowy',
    29.90,
    true,
    CURRENT_TIMESTAMP - INTERVAL '10 months',
    CURRENT_TIMESTAMP
)
ON CONFLICT ("Id") DO UPDATE SET
    "CateringCompanyId" = EXCLUDED."CateringCompanyId",
    "Name" = EXCLUDED."Name",
    "PricePerPerson" = EXCLUDED."PricePerPerson",
    "IsActive" = EXCLUDED."IsActive",
    "UpdatedAt" = EXCLUDED."UpdatedAt";

INSERT INTO public."PackageDishes" (
    "Id", "PackageId", "DishId", "IsActive", "CreatedAt", "UpdatedAt"
)
VALUES
    ('29650591-d708-4038-aa46-7587a7994ef7', 'f1aa49a4-1398-42f1-948b-f9f4215ed2b4', '75cbf0a6-39d8-4749-8caf-d4850a50b6fb', true, CURRENT_TIMESTAMP - INTERVAL '10 months', CURRENT_TIMESTAMP),
    ('0d8b1092-ae81-47be-9477-c9233129c61b', 'f1aa49a4-1398-42f1-948b-f9f4215ed2b4', '41075ca7-fc49-4295-9d09-9f3b74be7e22', true, CURRENT_TIMESTAMP - INTERVAL '10 months', CURRENT_TIMESTAMP),
    ('546a44f1-c5f6-4551-be15-283116c466de', 'f1aa49a4-1398-42f1-948b-f9f4215ed2b4', '8f41eec7-8f81-467d-b4ba-f0ef643cf8cc', true, CURRENT_TIMESTAMP - INTERVAL '10 months', CURRENT_TIMESTAMP),
    ('7bfe4f97-526a-42d4-8c4c-249a31eea3a7', 'f1aa49a4-1398-42f1-948b-f9f4215ed2b4', 'd6e84232-2972-489d-ab13-134658a97f89', true, CURRENT_TIMESTAMP - INTERVAL '10 months', CURRENT_TIMESTAMP),
    ('c47236cb-4b53-41fc-8e9b-ea4012fd5611', 'f1aa49a4-1398-42f1-948b-f9f4215ed2b4', '35faaa56-29d3-482b-8d1d-90a89c45ded2', true, CURRENT_TIMESTAMP - INTERVAL '10 months', CURRENT_TIMESTAMP),
    ('98fc2083-9d4a-40c3-b4c0-5bd4d1b14f70', 'f1aa49a4-1398-42f1-948b-f9f4215ed2b4', '01e3ad4e-abe1-468f-b803-ccbeb66b69a8', true, CURRENT_TIMESTAMP - INTERVAL '10 months', CURRENT_TIMESTAMP)
ON CONFLICT ("Id") DO UPDATE SET
    "PackageId" = EXCLUDED."PackageId",
    "DishId" = EXCLUDED."DishId",
    "IsActive" = EXCLUDED."IsActive",
    "UpdatedAt" = EXCLUDED."UpdatedAt";

INSERT INTO public."PackageAddons" (
    "Id", "PackageId", "AddonId", "IsActive", "CreatedAt", "UpdatedAt"
)
VALUES
    ('867e252e-09a2-43fb-9c7d-a2fecb9122f6', 'f1aa49a4-1398-42f1-948b-f9f4215ed2b4', 'bc757a18-c214-4d21-a299-c84783ccc8fd', true, CURRENT_TIMESTAMP - INTERVAL '10 months', CURRENT_TIMESTAMP),
    ('3f796ccf-e519-4a98-9a70-fb66fab65d02', 'f1aa49a4-1398-42f1-948b-f9f4215ed2b4', 'a95a9b72-b895-4bbc-99cb-a33a22602b67', true, CURRENT_TIMESTAMP - INTERVAL '10 months', CURRENT_TIMESTAMP),
    ('84dedb6c-8b5d-4371-a7f2-0fcfc7c2474b', 'f1aa49a4-1398-42f1-948b-f9f4215ed2b4', 'e2f0cbbe-a333-43d4-9ecc-38131de92061', true, CURRENT_TIMESTAMP - INTERVAL '10 months', CURRENT_TIMESTAMP)
ON CONFLICT ("Id") DO UPDATE SET
    "PackageId" = EXCLUDED."PackageId",
    "AddonId" = EXCLUDED."AddonId",
    "IsActive" = EXCLUDED."IsActive",
    "UpdatedAt" = EXCLUDED."UpdatedAt";

INSERT INTO public."GroupPackageAssignments" (
    "Id", "GroupId", "PackageId", "ActiveFrom", "ActiveTo", "IsActive", "CreatedAt", "UpdatedAt"
)
VALUES (
    '285bdc14-7ef8-4007-871a-82329c154f60',
    'c682c2aa-b385-4911-9bc6-caf922c8f035',
    'f1aa49a4-1398-42f1-948b-f9f4215ed2b4',
    (SELECT "Day0" - INTERVAL '30 days' FROM food4groups_seed_dates),
    null,
    true,
    CURRENT_TIMESTAMP - INTERVAL '1 month',
    CURRENT_TIMESTAMP
)
ON CONFLICT ("Id") DO UPDATE SET
    "GroupId" = EXCLUDED."GroupId",
    "PackageId" = EXCLUDED."PackageId",
    "ActiveFrom" = EXCLUDED."ActiveFrom",
    "ActiveTo" = EXCLUDED."ActiveTo",
    "IsActive" = EXCLUDED."IsActive",
    "UpdatedAt" = EXCLUDED."UpdatedAt";

-- Bieżące menu na pięć dni roboczych
INSERT INTO public."MenuPeriods" (
    "Id", "CateringCompanyId", "Name", "StartDate", "EndDate", "IsActive", "CreatedAt", "UpdatedAt"
)
SELECT
    'c6cb7975-8c21-4c13-8922-54ac23edf54e',
    'f0737d16-428a-4fff-a1a7-ee4464f227e4',
    'Menu tygodniowe ' || TO_CHAR("Day0", 'DD.MM') || '–' || TO_CHAR("Day4", 'DD.MM.YYYY'),
    "Day0",
    "Day4" + INTERVAL '1 day' - INTERVAL '1 second',
    true,
    CURRENT_TIMESTAMP - INTERVAL '7 days',
    CURRENT_TIMESTAMP
FROM food4groups_seed_dates
ON CONFLICT ("Id") DO UPDATE SET
    "CateringCompanyId" = EXCLUDED."CateringCompanyId",
    "Name" = EXCLUDED."Name",
    "StartDate" = EXCLUDED."StartDate",
    "EndDate" = EXCLUDED."EndDate",
    "IsActive" = EXCLUDED."IsActive",
    "UpdatedAt" = EXCLUDED."UpdatedAt";

INSERT INTO public."MenuDays" (
    "Id", "MenuPeriodId", "MenuDate", "IsActive", "CreatedAt", "UpdatedAt"
)
SELECT seed_day."Id", 'c6cb7975-8c21-4c13-8922-54ac23edf54e', seed_day."MenuDate", true, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP
FROM food4groups_seed_dates
CROSS JOIN LATERAL (
    VALUES
        ('d5a5c09d-6dcb-4714-a5c1-c95d787d3453'::uuid, "Day0"),
        ('b5bce82c-238d-4341-9bf4-848c4c4ff304'::uuid, "Day1"),
        ('34e4efd4-019c-4368-b329-838b27124ce3'::uuid, "Day2"),
        ('7717b98d-1a8c-48ae-a3f5-9625968bf65a'::uuid, "Day3"),
        ('46b7bf7e-0d50-42cf-8964-e1bef77dbd1a'::uuid, "Day4")
) AS seed_day("Id", "MenuDate")
ON CONFLICT ("Id") DO UPDATE SET
    "MenuPeriodId" = EXCLUDED."MenuPeriodId",
    "MenuDate" = EXCLUDED."MenuDate",
    "IsActive" = EXCLUDED."IsActive",
    "UpdatedAt" = EXCLUDED."UpdatedAt";

-- Trzy dania dostępne każdego dnia
INSERT INTO public."MenuItems" (
    "Id", "MenuDayId", "DishId", "IsActive", "CreatedAt", "UpdatedAt"
)
VALUES
    ('f310fb1e-32a4-496f-b2d2-9ac78c594369', 'd5a5c09d-6dcb-4714-a5c1-c95d787d3453', '75cbf0a6-39d8-4749-8caf-d4850a50b6fb', true, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP),
    ('5a80348c-a530-4004-80b2-743ed841ee67', 'd5a5c09d-6dcb-4714-a5c1-c95d787d3453', 'd6e84232-2972-489d-ab13-134658a97f89', true, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP),
    ('71530981-0c00-4dc5-8f73-671bf3098f1b', 'd5a5c09d-6dcb-4714-a5c1-c95d787d3453', '35faaa56-29d3-482b-8d1d-90a89c45ded2', true, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP),
    ('bd2b7061-c3f3-471c-8dfd-9bbc67f05967', 'b5bce82c-238d-4341-9bf4-848c4c4ff304', '41075ca7-fc49-4295-9d09-9f3b74be7e22', true, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP),
    ('8d507f62-0f52-43a1-a6a6-1c7ecfe7fa1b', 'b5bce82c-238d-4341-9bf4-848c4c4ff304', 'd6e84232-2972-489d-ab13-134658a97f89', true, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP),
    ('d55b0770-2bcf-4933-abc0-4495a0c1e765', 'b5bce82c-238d-4341-9bf4-848c4c4ff304', '01e3ad4e-abe1-468f-b803-ccbeb66b69a8', true, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP),
    ('806e6c9d-fd4a-4419-b161-9928eb08d3e9', '34e4efd4-019c-4368-b329-838b27124ce3', '8f41eec7-8f81-467d-b4ba-f0ef643cf8cc', true, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP),
    ('e67a681d-4a8a-41b0-bff2-d73ae516cee0', '34e4efd4-019c-4368-b329-838b27124ce3', '75cbf0a6-39d8-4749-8caf-d4850a50b6fb', true, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP),
    ('692c01aa-7664-4b6a-b840-6c48fe24c91f', '34e4efd4-019c-4368-b329-838b27124ce3', '35faaa56-29d3-482b-8d1d-90a89c45ded2', true, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP),
    ('c2e9257c-7bcb-478a-aaf5-43f8b547c64d', '7717b98d-1a8c-48ae-a3f5-9625968bf65a', '41075ca7-fc49-4295-9d09-9f3b74be7e22', true, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP),
    ('0b9a7ed8-fcba-46c6-b98b-17c164a42c3e', '7717b98d-1a8c-48ae-a3f5-9625968bf65a', 'd6e84232-2972-489d-ab13-134658a97f89', true, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP),
    ('fa91c207-b095-48ff-836e-1903163f355d', '7717b98d-1a8c-48ae-a3f5-9625968bf65a', '01e3ad4e-abe1-468f-b803-ccbeb66b69a8', true, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP),
    ('d25a65cd-7334-4cbc-b423-60f0ac0fca9c', '46b7bf7e-0d50-42cf-8964-e1bef77dbd1a', '8f41eec7-8f81-467d-b4ba-f0ef643cf8cc', true, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP),
    ('d9beb564-b075-4a93-b220-23f8de4521b8', '46b7bf7e-0d50-42cf-8964-e1bef77dbd1a', '75cbf0a6-39d8-4749-8caf-d4850a50b6fb', true, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP),
    ('50d78b21-a963-4c91-bf63-681f8a9c5755', '46b7bf7e-0d50-42cf-8964-e1bef77dbd1a', '35faaa56-29d3-482b-8d1d-90a89c45ded2', true, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP)
ON CONFLICT ("Id") DO UPDATE SET
    "MenuDayId" = EXCLUDED."MenuDayId",
    "DishId" = EXCLUDED."DishId",
    "IsActive" = EXCLUDED."IsActive",
    "UpdatedAt" = EXCLUDED."UpdatedAt";

-- Dwa opcjonalne dodatki dostępne każdego dnia
INSERT INTO public."MenuDayAddons" (
    "Id", "MenuDayId", "AddonId", "IsActive", "CreatedAt", "UpdatedAt"
)
VALUES
    ('280ea21f-8c0c-4e18-8fef-0b4d435366c5', 'd5a5c09d-6dcb-4714-a5c1-c95d787d3453', 'bc757a18-c214-4d21-a299-c84783ccc8fd', true, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP),
    ('31c731f4-5104-45a9-899e-6e3cb0692b91', 'd5a5c09d-6dcb-4714-a5c1-c95d787d3453', 'a95a9b72-b895-4bbc-99cb-a33a22602b67', true, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP),
    ('56c2f330-3004-4ac3-b2d5-542383e45aec', 'b5bce82c-238d-4341-9bf4-848c4c4ff304', 'a95a9b72-b895-4bbc-99cb-a33a22602b67', true, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP),
    ('4f497d7b-5ed9-4a49-b6fd-f3ce6628aeb8', 'b5bce82c-238d-4341-9bf4-848c4c4ff304', 'e2f0cbbe-a333-43d4-9ecc-38131de92061', true, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP),
    ('a50889cd-d925-44d0-97d9-ed3a57609acd', '34e4efd4-019c-4368-b329-838b27124ce3', 'bc757a18-c214-4d21-a299-c84783ccc8fd', true, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP),
    ('662540cd-e7c9-4737-b976-b79495330ec0', '34e4efd4-019c-4368-b329-838b27124ce3', 'e2f0cbbe-a333-43d4-9ecc-38131de92061', true, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP),
    ('840bdf54-1a9b-4946-a1b9-302b85b0e60e', '7717b98d-1a8c-48ae-a3f5-9625968bf65a', 'bc757a18-c214-4d21-a299-c84783ccc8fd', true, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP),
    ('f9a65b9f-1aa8-4636-ade8-ae99f3cf915c', '7717b98d-1a8c-48ae-a3f5-9625968bf65a', 'a95a9b72-b895-4bbc-99cb-a33a22602b67', true, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP),
    ('f4eef5c3-c02c-47b6-b13b-66998762071c', '46b7bf7e-0d50-42cf-8964-e1bef77dbd1a', 'bc757a18-c214-4d21-a299-c84783ccc8fd', true, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP),
    ('9cac58c0-93da-4f29-9768-ce8325a1816e', '46b7bf7e-0d50-42cf-8964-e1bef77dbd1a', 'e2f0cbbe-a333-43d4-9ecc-38131de92061', true, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP)
ON CONFLICT ("Id") DO UPDATE SET
    "MenuDayId" = EXCLUDED."MenuDayId",
    "AddonId" = EXCLUDED."AddonId",
    "IsActive" = EXCLUDED."IsActive",
    "UpdatedAt" = EXCLUDED."UpdatedAt";

-- Techniczne statusy zamówień
INSERT INTO public."OrderStatuses" (
    "Id", "Name", "IsFinal", "IsActive", "CreatedAt", "UpdatedAt"
)
VALUES
    ('31fafb1d-193b-4471-8c11-857484a6ff21', 'Created', false, true, CURRENT_TIMESTAMP - INTERVAL '1 year', CURRENT_TIMESTAMP),
    ('98957891-9668-4ccf-ac41-485dc2f4929b', 'Accepted', false, true, CURRENT_TIMESTAMP - INTERVAL '1 year', CURRENT_TIMESTAMP),
    ('e6159287-60a2-438e-bed6-164d54f7b6e2', 'Prepared', false, true, CURRENT_TIMESTAMP - INTERVAL '1 year', CURRENT_TIMESTAMP),
    ('54bcbf8a-6b54-4266-8fa4-769f5de495df', 'Completed', true, true, CURRENT_TIMESTAMP - INTERVAL '1 year', CURRENT_TIMESTAMP),
    ('d1612308-b0f9-4026-8e2c-3b84cec36fea', 'Cancelled', true, true, CURRENT_TIMESTAMP - INTERVAL '1 year', CURRENT_TIMESTAMP)
ON CONFLICT ("Name") DO UPDATE SET
    "IsFinal" = EXCLUDED."IsFinal",
    "IsActive" = EXCLUDED."IsActive",
    "UpdatedAt" = EXCLUDED."UpdatedAt";

-- Pięć zamówień pokazujących każdy etap obsługi
INSERT INTO public."Orders" (
    "Id", "GroupMemberId", "MenuDayId", "DishId", "OrderStatusId", "CreatedAt", "UpdatedAt"
)
VALUES
    (
        '5c1f767e-aa6e-48e0-a811-33ee07c41367',
        'd632a7e3-d9ed-40c2-a910-8ddcadd929b5',
        'd5a5c09d-6dcb-4714-a5c1-c95d787d3453',
        '75cbf0a6-39d8-4749-8caf-d4850a50b6fb',
        (SELECT "Id" FROM public."OrderStatuses" WHERE "Name" = 'Completed'),
        (SELECT "Day0" - INTERVAL '1 day' + INTERVAL '9 hours' FROM food4groups_seed_dates),
        (SELECT "Day0" + INTERVAL '13 hours' FROM food4groups_seed_dates)
    ),
    (
        'f97e811e-bbce-4226-8fc7-1390720c2504',
        '46d79db6-4ca6-4e8d-811d-0d2377116cdf',
        'd5a5c09d-6dcb-4714-a5c1-c95d787d3453',
        '35faaa56-29d3-482b-8d1d-90a89c45ded2',
        (SELECT "Id" FROM public."OrderStatuses" WHERE "Name" = 'Cancelled'),
        (SELECT "Day0" - INTERVAL '1 day' + INTERVAL '10 hours' FROM food4groups_seed_dates),
        (SELECT "Day0" - INTERVAL '1 day' + INTERVAL '12 hours' FROM food4groups_seed_dates)
    ),
    (
        'bfae6018-5fe4-47cc-a0dc-2c8fe6b4c0cd',
        'd632a7e3-d9ed-40c2-a910-8ddcadd929b5',
        'b5bce82c-238d-4341-9bf4-848c4c4ff304',
        '41075ca7-fc49-4295-9d09-9f3b74be7e22',
        (SELECT "Id" FROM public."OrderStatuses" WHERE "Name" = 'Prepared'),
        (SELECT "Day1" - INTERVAL '1 day' + INTERVAL '9 hours' FROM food4groups_seed_dates),
        (SELECT "Day1" - INTERVAL '1 day' + INTERVAL '11 hours' FROM food4groups_seed_dates)
    ),
    (
        'ba1a4e47-bd0c-4955-9828-50056a2e8049',
        '46d79db6-4ca6-4e8d-811d-0d2377116cdf',
        'b5bce82c-238d-4341-9bf4-848c4c4ff304',
        'd6e84232-2972-489d-ab13-134658a97f89',
        (SELECT "Id" FROM public."OrderStatuses" WHERE "Name" = 'Accepted'),
        (SELECT "Day1" - INTERVAL '1 day' + INTERVAL '10 hours' FROM food4groups_seed_dates),
        (SELECT "Day1" - INTERVAL '1 day' + INTERVAL '12 hours' FROM food4groups_seed_dates)
    ),
    (
        'b8936648-92af-4ff1-81a6-50ce8498b869',
        '46d79db6-4ca6-4e8d-811d-0d2377116cdf',
        '34e4efd4-019c-4368-b329-838b27124ce3',
        '8f41eec7-8f81-467d-b4ba-f0ef643cf8cc',
        (SELECT "Id" FROM public."OrderStatuses" WHERE "Name" = 'Created'),
        (SELECT "Day1" - INTERVAL '1 day' + INTERVAL '14 hours' FROM food4groups_seed_dates),
        (SELECT "Day1" - INTERVAL '1 day' + INTERVAL '14 hours' FROM food4groups_seed_dates)
    )
ON CONFLICT ("Id") DO UPDATE SET
    "GroupMemberId" = EXCLUDED."GroupMemberId",
    "MenuDayId" = EXCLUDED."MenuDayId",
    "DishId" = EXCLUDED."DishId",
    "OrderStatusId" = EXCLUDED."OrderStatusId",
    "CreatedAt" = EXCLUDED."CreatedAt",
    "UpdatedAt" = EXCLUDED."UpdatedAt";

-- Cztery zamówienia z dodatkiem i jedno bez dodatków
INSERT INTO public."OrderAddons" (
    "Id", "OrderId", "AddonId", "CreatedAt", "UpdatedAt"
)
VALUES
    ('0473ccb5-a7ce-478a-ac0d-049abf0d657b', '5c1f767e-aa6e-48e0-a811-33ee07c41367', 'bc757a18-c214-4d21-a299-c84783ccc8fd', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP),
    ('f2f73cbd-10ba-4961-9130-57ef1ec6988f', 'bfae6018-5fe4-47cc-a0dc-2c8fe6b4c0cd', 'e2f0cbbe-a333-43d4-9ecc-38131de92061', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP),
    ('206d680f-b8fd-4738-be74-f98667691dc1', 'ba1a4e47-bd0c-4955-9828-50056a2e8049', 'a95a9b72-b895-4bbc-99cb-a33a22602b67', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP),
    (
        'f8ecedef-eedf-41f1-afca-36382a24d4f2',
        'b8936648-92af-4ff1-81a6-50ce8498b869',
        'bc757a18-c214-4d21-a299-c84783ccc8fd',
        (SELECT "Day1" - INTERVAL '1 day' + INTERVAL '14 hours' FROM food4groups_seed_dates),
        (SELECT "Day1" - INTERVAL '1 day' + INTERVAL '14 hours' FROM food4groups_seed_dates)
    )
ON CONFLICT ("Id") DO UPDATE SET
    "OrderId" = EXCLUDED."OrderId",
    "AddonId" = EXCLUDED."AddonId",
    "CreatedAt" = EXCLUDED."CreatedAt",
    "UpdatedAt" = EXCLUDED."UpdatedAt";

-- Pełna i chronologiczna historia zmian statusów
INSERT INTO public."OrderStatusHistories" (
    "Id", "OrderId", "OrderStatusId", "ChangedByUserId", "ChangedAt"
)
VALUES
    (
        '8f6429ec-1d52-4e4f-b6a4-7a060137b606',
        '5c1f767e-aa6e-48e0-a811-33ee07c41367',
        (SELECT "Id" FROM public."OrderStatuses" WHERE "Name" = 'Created'),
        (SELECT "Id" FROM public."AspNetUsers" WHERE "NormalizedUserName" = 'USER@FOOD4GROUPS.COM'),
        (SELECT "Day0" - INTERVAL '1 day' + INTERVAL '9 hours' FROM food4groups_seed_dates)
    ),
    (
        '77abd8ed-d666-4aff-b111-eaccf906ecfb',
        '5c1f767e-aa6e-48e0-a811-33ee07c41367',
        (SELECT "Id" FROM public."OrderStatuses" WHERE "Name" = 'Accepted'),
        (SELECT "Id" FROM public."AspNetUsers" WHERE "NormalizedUserName" = 'CATERING@FOOD4GROUPS.COM'),
        (SELECT "Day0" - INTERVAL '1 day' + INTERVAL '10 hours' FROM food4groups_seed_dates)
    ),
    (
        '3838a464-8619-42f9-8c69-0af5396f7546',
        '5c1f767e-aa6e-48e0-a811-33ee07c41367',
        (SELECT "Id" FROM public."OrderStatuses" WHERE "Name" = 'Prepared'),
        (SELECT "Id" FROM public."AspNetUsers" WHERE "NormalizedUserName" = 'CATERING@FOOD4GROUPS.COM'),
        (SELECT "Day0" + INTERVAL '11 hours' FROM food4groups_seed_dates)
    ),
    (
        'be81accf-8322-4d5f-8404-60a4f60b9dbd',
        '5c1f767e-aa6e-48e0-a811-33ee07c41367',
        (SELECT "Id" FROM public."OrderStatuses" WHERE "Name" = 'Completed'),
        (SELECT "Id" FROM public."AspNetUsers" WHERE "NormalizedUserName" = 'CATERING@FOOD4GROUPS.COM'),
        (SELECT "Day0" + INTERVAL '13 hours' FROM food4groups_seed_dates)
    ),
    (
        'c49760bd-b634-4c1b-afce-2c06a082349d',
        'f97e811e-bbce-4226-8fc7-1390720c2504',
        (SELECT "Id" FROM public."OrderStatuses" WHERE "Name" = 'Created'),
        (SELECT "Id" FROM public."AspNetUsers" WHERE "NormalizedUserName" = 'COORDINATOR@FOOD4GROUPS.COM'),
        (SELECT "Day0" - INTERVAL '1 day' + INTERVAL '10 hours' FROM food4groups_seed_dates)
    ),
    (
        'e48e8a2c-0a44-47ef-8cb9-583419fd0d8e',
        'f97e811e-bbce-4226-8fc7-1390720c2504',
        (SELECT "Id" FROM public."OrderStatuses" WHERE "Name" = 'Cancelled'),
        (SELECT "Id" FROM public."AspNetUsers" WHERE "NormalizedUserName" = 'COORDINATOR@FOOD4GROUPS.COM'),
        (SELECT "Day0" - INTERVAL '1 day' + INTERVAL '12 hours' FROM food4groups_seed_dates)
    ),
    (
        'ceb1b94d-0b25-44e2-b282-72bfbb7f8e11',
        'bfae6018-5fe4-47cc-a0dc-2c8fe6b4c0cd',
        (SELECT "Id" FROM public."OrderStatuses" WHERE "Name" = 'Created'),
        (SELECT "Id" FROM public."AspNetUsers" WHERE "NormalizedUserName" = 'USER@FOOD4GROUPS.COM'),
        (SELECT "Day1" - INTERVAL '1 day' + INTERVAL '9 hours' FROM food4groups_seed_dates)
    ),
    (
        '05189e57-0eaf-4b11-90d0-ec3265690d3b',
        'bfae6018-5fe4-47cc-a0dc-2c8fe6b4c0cd',
        (SELECT "Id" FROM public."OrderStatuses" WHERE "Name" = 'Accepted'),
        (SELECT "Id" FROM public."AspNetUsers" WHERE "NormalizedUserName" = 'CATERING@FOOD4GROUPS.COM'),
        (SELECT "Day1" - INTERVAL '1 day' + INTERVAL '10 hours' FROM food4groups_seed_dates)
    ),
    (
        '83426061-6934-40ed-901d-89467c0617a9',
        'bfae6018-5fe4-47cc-a0dc-2c8fe6b4c0cd',
        (SELECT "Id" FROM public."OrderStatuses" WHERE "Name" = 'Prepared'),
        (SELECT "Id" FROM public."AspNetUsers" WHERE "NormalizedUserName" = 'CATERING@FOOD4GROUPS.COM'),
        (SELECT "Day1" - INTERVAL '1 day' + INTERVAL '11 hours' FROM food4groups_seed_dates)
    ),
    (
        'dbaf1ab9-5df8-441c-9d8c-bcdaa1ad65ca',
        'ba1a4e47-bd0c-4955-9828-50056a2e8049',
        (SELECT "Id" FROM public."OrderStatuses" WHERE "Name" = 'Created'),
        (SELECT "Id" FROM public."AspNetUsers" WHERE "NormalizedUserName" = 'COORDINATOR@FOOD4GROUPS.COM'),
        (SELECT "Day1" - INTERVAL '1 day' + INTERVAL '10 hours' FROM food4groups_seed_dates)
    ),
    (
        '9eecb2aa-dcb3-42db-9c67-aabdf8762765',
        'ba1a4e47-bd0c-4955-9828-50056a2e8049',
        (SELECT "Id" FROM public."OrderStatuses" WHERE "Name" = 'Accepted'),
        (SELECT "Id" FROM public."AspNetUsers" WHERE "NormalizedUserName" = 'CATERING@FOOD4GROUPS.COM'),
        (SELECT "Day1" - INTERVAL '1 day' + INTERVAL '12 hours' FROM food4groups_seed_dates)
    ),
    (
        '1a5f975b-6035-4536-874e-7cca9189c60c',
        'b8936648-92af-4ff1-81a6-50ce8498b869',
        (SELECT "Id" FROM public."OrderStatuses" WHERE "Name" = 'Created'),
        (SELECT "Id" FROM public."AspNetUsers" WHERE "NormalizedUserName" = 'COORDINATOR@FOOD4GROUPS.COM'),
        (SELECT "Day1" - INTERVAL '1 day' + INTERVAL '14 hours' FROM food4groups_seed_dates)
    )
ON CONFLICT ("Id") DO UPDATE SET
    "OrderId" = EXCLUDED."OrderId",
    "OrderStatusId" = EXCLUDED."OrderStatusId",
    "ChangedByUserId" = EXCLUDED."ChangedByUserId",
    "ChangedAt" = EXCLUDED."ChangedAt";

-- Szablon dokumentu rozliczeniowego
INSERT INTO public."PrintTemplates" (
    "Id",
    "Code",
    "Name",
    "TitleTemplate",
    "BodyTemplate",
    "FooterTemplate",
    "IsActive",
    "CreatedAt",
    "UpdatedAt"
)
VALUES (
    '05baa604-9aff-4597-869b-956c314c90bd',
    'GroupSettlementProforma',
    'Dokument rozliczeniowy proforma dla grupy',
    'Dokument rozliczeniowy proforma - {{GroupName}}',
    E'Grupa: {{GroupName}}\nOkres rozliczeniowy: {{DateFrom}} – {{DateTo}}\n\nLiczba dni menu: {{TotalMenuDays}}\nLiczba uczestników: {{TotalParticipants}}\nŁączna liczba dni abonamentowych: {{TotalSubscriptionUnits}}\n\nKwota do rozliczenia: {{TotalAmount}}',
    'Dokument ma charakter informacyjny i nie jest fakturą VAT.',
    true,
    CURRENT_TIMESTAMP - INTERVAL '1 year',
    CURRENT_TIMESTAMP
)
ON CONFLICT ("Code") DO UPDATE SET
    "Name" = EXCLUDED."Name",
    "TitleTemplate" = EXCLUDED."TitleTemplate",
    "BodyTemplate" = EXCLUDED."BodyTemplate",
    "FooterTemplate" = EXCLUDED."FooterTemplate",
    "IsActive" = EXCLUDED."IsActive",
    "UpdatedAt" = EXCLUDED."UpdatedAt";

COMMIT;
