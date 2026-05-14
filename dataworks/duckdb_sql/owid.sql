DROP TABLE IF EXISTS co2percapita;
DROP TABLE IF EXISTS gdppercapita;

-- Create a table from owid url
CREATE TABLE co2percapita AS (SELECT * FROM read_csv(
    'https://ourworldindata.org/explorers/co2.csv?v=1&csvType=full&useColumnShortNames=true&Gas+or+Warming=CO%E2%82%82&Accounting=Territorial&Fuel+or+Land+Use+Change=All+fossil+emissions&Count=Per+capita',
    delim=',',
    header=true,
    encoding='utf-8',
    columns={
        'entity': 'VARCHAR',
        'code': 'VARCHAR',
        'year': 'UBIGINT',
        'emissions_total_per_capita': 'DOUBLE',
    })
);

-- Create a table from owid url
CREATE TABLE gdppercapita AS (SELECT * FROM read_csv(
    'https://ourworldindata.org/grapher/gdp-per-capita-worldbank.csv?v=1&csvType=full&useColumnShortNames=true',
    delim=',',
    header=true,
    encoding='utf-8',
    columns={
        'entity': 'VARCHAR',
        'code': 'VARCHAR',
        'year': 'UBIGINT',
        'ny_gdp_pcap_pp_kd': 'DOUBLE',
        'owid_region': 'VARCHAR',
    })
);

-- Create a table from owid url
CREATE TABLE life_expect AS (SELECT * FROM read_csv(
    'https://ourworldindata.org/grapher/life-expectancy.csv?v=1&csvType=full&useColumnShortNames=true',
    delim=',',
    header=true,
    encoding='utf-8',
    columns={
        'entity': 'VARCHAR',
        'code': 'VARCHAR',
        'year': 'UBIGINT',
        'life_expectancy_0': 'DOUBLE',
    })
);

CREATE TABLE fertility_rates AS (SELECT * FROM read_csv(
    'https://ourworldindata.org/grapher/children-born-per-woman.csv?v=1&csvType=full&useColumnShortNames=true',
    delim=',',
    header=true,
    encoding='utf-8',
    columns={
        'entity': 'VARCHAR',
        'code': 'VARCHAR',
        'year': 'UBIGINT',
        'fertility_rate_hist': 'DOUBLE',
    })
);

ALTER TABLE fertility_rates ADD column owid_region VARCHAR;
UPDATE fertility_rates AS f SET owid_region = g.owid_region FROM gdppercapita as g WHERE f.code = g.code;

-- Write read table to csv file for local inspection and debugging
COPY co2percapita TO 'data/co2_per_capita.csv';
COPY gdppercapita TO 'data/gdp_per_capita.csv';
COPY life_expect TO 'data/life_expect.csv';
COPY fertility_rates TO 'data/fertility_rates.csv';

-- Join data by year, code and entity
COPY (
    SELECT g.year, g.code, g.entity, c.emissions_total_per_capita, g.ny_gdp_pcap_pp_kd as gdp_per_capita, g.owid_region
    FROM gdppercapita AS g INNER JOIN co2percapita AS c ON g.year = c.year AND g.entity = c.entity
) TO 'outputs/co2_and_gdp_per_capita.csv';

COPY (
    SELECT g.year, g.code, g.entity, g.ny_gdp_pcap_pp_kd as gdp_per_capita, g.owid_region, l.life_expectancy_0
    FROM gdppercapita AS g INNER JOIN life_expect AS l ON g.year = l.year AND g.entity = l.entity
) TO 'outputs/lifeexpect_and_gdp.parquet' (FORMAT parquet, COMPRESSION zstd);

COPY (
    SELECT * FROM fertility_rates WHERE year >= 1990
) TO 'outputs/fertility_rates.csv' (FORMAT csv);
