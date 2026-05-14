-- This script assumes you have a file called '12411-0003_de_flat.csv'
-- See the README for the exact links to download files.

DROP TABLE IF EXISTS population;

CREATE TABLE population AS (
    SELECT
        "time",
        "2_variable_attribute_label" as gender,
        "value"
    from read_csv(
        'data/degen/12411-0003_de_flat.csv',
        delim=';',
        header=true,
        encoding='utf-8',
        ignore_errors=true,
        strict_mode=false
    )
);

COPY population TO 'outputs/12411-degen.parquet' (FORMAT parquet, COMPRESSION zstd);
