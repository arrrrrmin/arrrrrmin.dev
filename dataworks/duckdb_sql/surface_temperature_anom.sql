
-- Create a table from owid url
CREATE TABLE surface_temperatures AS (
    SELECT
        entity,
        code,
        year as month,
        "_2025","_2024","_2023","_2022","_2021","_2020","_2019","_2018","_2017","_2016","_2015","_2014","_2013","_2012","_2011","_2010","_2009","_2008","_2007","_2006","_2005","_2004","_2003","_2002","_2001","_2000","_1999","_1998","_1997","_1996","_1995","_1994","_1993","_1992","_1991","_1990","_1989","_1988","_1987","_1986","_1985","_1984","_1983","_1982","_1981","_1980","_1979"
    FROM read_csv(
        'https://ourworldindata.org/grapher/monthly-surface-temperature-anomalies-by-year.csv?v=1&csvType=full&useColumnShortNames=true',
        header=true,
        encoding='utf-8'
    )
);


-- Create a table from owid url
CREATE TABLE surface_temperatures AS (
    SELECT
        entity,
        code,
        year as month,
        "_2025","_2024","_2023","_2022","_2021","_2020","_2019","_2018","_2017","_2016","_2015","_2014","_2013","_2012","_2011","_2010","_2009","_2008","_2007","_2006","_2005","_2004","_2003","_2002","_2001","_2000","_1999","_1998","_1997","_1996","_1995","_1994","_1993","_1992","_1991","_1990","_1989","_1988","_1987","_1986","_1985","_1984","_1983","_1982","_1981","_1980","_1979"
    FROM read_csv(
        'https://ourworldindata.org/grapher/monthly-surface-temperature-anomalies-by-year.csv?v=1&csvType=full&useColumnShortNames=true',
        header=true,
        encoding='utf-8'
    )
);

COPY surface_temperatures TO 'data/surface_temperatures_anomalies.csv';
COPY surface_temperatures TO 'data/surface_temperatures_anomalies.csv';
