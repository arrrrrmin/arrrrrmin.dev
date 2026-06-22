DROP TABLE IF EXISTS prodindex;

CREATE TABLE gross_value_added AS (
    SELECT
        "time" as "year",
        try_cast(replace("1_variable_attribute_code", 'QUART', '') as UINTEGER) * 3 as month,
        "3_variable_attribute_label" as value_type,
        "4_variable_attribute_label" as price_type,
        "5_variable_attribute_label" as sector,
        try_cast(replace("value", ',', '.') as DOUBLE) as value,
        "value_unit",
        "value_variable_label",
        "value_q"
    from read_csv(
        'data/degen/81000-0014_de_flat.csv',
        delim=';',
        header=true,
        encoding='utf-8',
        ignore_errors=true,
        strict_mode=false
    )
);

COPY (
    SELECT *
    FROM gross_value_added
) TO 'outputs/gross_value_by_sector.parquet' (FORMAT parquet, COMPRESSION zstd);
