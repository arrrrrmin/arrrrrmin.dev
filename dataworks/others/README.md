# Other data

## PMK cases 2024

Manually collected the PMK (politically motivated crimes) from the last report regarding data
up to 2024. [Statement](https://www.bka.de/DE/UnsereAufgaben/Deliktsbereiche/PMK/PMKZahlen2024/PMKZahlen2024_node.html)
and [File download](https://www.bka.de/SharedDocs/Downloads/DE/UnsereAufgaben/Deliktsbereiche/PMK/2024PMKFallzahlen.pdf?__blob=publicationFile&v=2)
are provided by the [Bundes Kriminal Amt](https://www.bka.de).

Data was collected by the cases reported in the file, from diagram 1 on page 4 (Entwicklung des Gesamtstraftatenaufkommens der PMK nach Phänomenbereichen im
Verlauf der letzten zehn Jahre (2015–2024)).

## GeoJSON of germany

Provided by the maintainers of [deutschlandGeoJSON](https://github.com/isellsoap/deutschlandGeoJSON), which is publically archived and not maintained but the source should still be valid - for our purposes.

## Glacial lake outburst data

Provided by the university of potsdam [Glacier Lake Outburst Flood Database V4.2](https://zenodo.org/records/7330345)
Convert it to csv: `uv run src/dataworks/ods_convert/glofs_convert.py` and find the output in `outputs/glofdatabase_v4-2.csv`.
