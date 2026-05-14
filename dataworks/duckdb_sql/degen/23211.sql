-- This script assumes you have a file called '23211-0002_de_flat.csv'
-- See the README for the exact links to download files.

SET VARIABLE table_name = "trafficaccidents";

DROP TABLE IF EXISTS table_name;

CREATE TABLE table_name AS (
    SELECT
        "time" as "year",
        "2_variable_attribute_label" as "gender",
        "3_variable_attribute_label" as "age_label",
        "4_variable_attribute_label" as "accident_type",
        TRY_CAST(regexp_replace(trim(value), '[-\.]', '') AS BIGINT) as "value",
        cast("value_variable_label" = 'Gestorbene' AS BOOLEAN) as "died"
    FROM read_csv(
        'data/degen/23211-0002_de_flat.csv',
        delim=';',
        header=true,
        encoding='utf-8',
        ignore_errors=true,
        strict_mode=false
    )
);

UPDATE table_name
SET gender = CASE lower(trim(gender))
  WHEN 'männlich'   THEN 'male'
  WHEN 'weiblich'   THEN 'female'
  WHEN 'insgesamt'  THEN 'total'
  ELSE gender
END;

UPDATE table_name
SET age_label = CASE trim(age_label)
    WHEN 'Insgesamt' THEN 'Total'
    WHEN 'unter 1 Jahr' THEN '<1 year'
    WHEN '1 bis unter 15 Jahre' THEN '1-15 years'
    WHEN '15 bis unter 20 Jahre' THEN '15-20 years'
    WHEN '20 bis unter 25 Jahre' THEN '20-25 years'
    WHEN '25 bis unter 30 Jahre' THEN '25-30 years'
    WHEN '30 bis unter 35 Jahre' THEN '30-35 years'
    WHEN '35 bis unter 40 Jahre' THEN '35-40 years'
    WHEN '40 bis unter 45 Jahre' THEN '40-45 years'
    WHEN '45 bis unter 50 Jahre' THEN '45-50 years'
    WHEN '50 bis unter 55 Jahre' THEN '50-55 years'
    WHEN '55 bis unter 60 Jahre' THEN '55-60 years'
    WHEN '60 bis unter 65 Jahre' THEN '60-65 years'
    WHEN '65 bis unter 70 Jahre' THEN '65-70 years'
    WHEN '70 bis unter 75 Jahre' THEN '70-75 years'
    WHEN '75 bis unter 80 Jahre' THEN '75-80 years'
    WHEN '80 bis unter 85 Jahre' THEN '80-85 years'
    WHEN '85 Jahre und mehr' THEN '85> year'
    WHEN 'Alter unbekannt' THEN 'Unknown'
  ELSE age_label
END;

COPY table_name TO 'outputs/23211.parquet' (FORMAT parquet, COMPRESSION zstd);
