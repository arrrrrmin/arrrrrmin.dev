INSTALL spatial;
LOAD spatial;

DROP TABLE IF EXISTS microcensus;

CREATE TABLE microcensus AS (
    SELECT
        time as year,
        "1_variable_attribute_label" as state,
        "2_variable_attribute_label" as gender,
        "3_variable_attribute_code" as income_code,
        "3_variable_attribute_label" as income_label,
        value_variable_label as employ_state,
        value_variable_code as employ_code,
        value_unit,
        try_cast(replace("value", ',', '.') as DOUBLE) as value,
    FROM read_csv(
        'data/degen/12211-1003_de_flat.csv',
        delim=';',
        header=true,
        encoding='utf-8',
        ignore_errors=true,
        strict_mode=false
    )
);

CREATE TABLE ger AS SELECT id, name as state, geom FROM ST_Read('others/geo/3_mittel.geo.json');

COPY microcensus TO 'outputs/12211-degen.csv';
COPY ger TO 'outputs/german-states.geo.json'
WITH (
    FORMAT gdal, DRIVER 'GeoJSON', LAYER_CREATION_OPTIONS 'WRITE_BBOX=YES', SRS 'EPSG:4326'
);