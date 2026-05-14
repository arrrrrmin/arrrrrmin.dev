-- This script assumes you have a file called '42153-0003_de_flat.csv'
-- See the README for the exact links to download files.

DROP TABLE IF EXISTS prodindex;

CREATE TABLE prodindex AS (
    SELECT
        "time" as "year",
        cast(trim("1_variable_attribute_code", 'MONAT') AS UINTEGER) as month,
        "3_variable_attribute_code" as processed_level_code,
        "3_variable_attribute_label" as processed_level_label,
        "4_variable_attribute_code" as industry_code,
        "4_variable_attribute_label" as industry_label,
        try_cast(replace("value", ',', '.') as DOUBLE) as value,
        "value_unit",
        "value_q"
    from read_csv(
        'data/degen/42153-0003_de_flat.csv',
        delim=';',
        header=true,
        encoding='utf-8',
        ignore_errors=true,
        strict_mode=false
    )
);

COPY (
    SELECT
        year,
        month,
        processed_level_code,
        processed_level_label,
        industry_code,
        industry_label,
        value,
        value_unit,
        value_q
    FROM prodindex
    WHERE list_contains(['WZ08-29', 'WZ08-28','WZ08-20','WZ08-13','WZ08-1105','WZ08-272', 'WZ08-254', 'WZ08-261', 'WZ08-325'], industry_code)
) TO 'outputs/42153-minimal.parquet' (FORMAT parquet, COMPRESSION zstd);
