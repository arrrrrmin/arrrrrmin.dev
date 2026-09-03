import json
from pathlib import Path

import earthaccess
import pandas as pd
import geopandas as gpd

CONCEPT_ID = "C3249539102-NSIDC_CPRD"
OUTPUT_DIR = Path("outputs/glofs/")
GLACIAL_MIN_SIZE = 0.05  # km²


date_cols = ["Date", "Date_Min", "Date_Max"]


def extract_year(series):
    text = series.astype("string").str.strip()

    # Years only
    year_only = text.str.fullmatch(r"\d{4}")
    result = pd.Series(pd.NA, index=series.index, dtype="Int64")
    result.loc[year_only] = pd.to_numeric(text.loc[year_only], errors="coerce").astype(
        "Int64"
    )

    # Parse full date values separately
    full_dates = pd.to_datetime(text.loc[~year_only], errors="coerce")
    result.loc[~year_only] = full_dates.dt.year.astype("Int64")

    return result


if __name__ == "__main__":
    # Assumes a file in others/glofdatabase_v4-2.ods (see README.md) and a
    # .netrc file including an entry for 'machine urs.earthdata.nasa.gov' providing login and password

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Prepare climate change data (OWID)
    print("*** Prepare climate change data (OWID) ***")
    climate_change_file = OUTPUT_DIR / "climate-global-warming.csv"
    if not climate_change_file.exists():
        df = pd.read_csv(
            "https://ourworldindata.org/explorers/climate-change.csv?v=1&csvType=filtered&useColumnShortNames=true&time=earliest..2026&Metric=Temperature+anomaly&Long-run+series=false&country=OWID_WRL~ATA~Gulkana+Glacier~Lemon+Creek+Glacier~OWID_NAM~South+Cascade+Glacier~Wolverine+Glacier~Hawaii~Arctic+Ocean",
            storage_options={"User-Agent": "Our World In Data data fetch/1.0"},
        )
        # Write data to file
        df.to_csv(climate_change_file, index=False)
    else:
        print(f"{climate_change_file} found - skipped repeated download.")

    # Prepare GLOF database statistics
    print("*** Prepare GLOF database statistics ***")
    sheets = pd.read_excel(
        "others/glofdatabase_v4-2.ods", engine="odf", sheet_name=None, skiprows=[1, 2]
    )
    df = (
        pd.concat(sheets, names=["region"])
        .reset_index(level="region")
        .reset_index(drop=True)
    )

    years = pd.DataFrame(
        {col: extract_year(df[col]) for col in date_cols}, index=df.index
    )
    df["year"] = years.bfill(axis=1).iloc[:, 0].astype("Int64")

    df = df[df["year"].notna()]

    # Write GLOF database statistics
    df.to_csv(OUTPUT_DIR / "glofdatabase_v4-2.csv", index=False)

    # Download HMA dataset
    print("*** Download HMA dataset ***")
    earthaccess.login()
    results = earthaccess.search_data(concept_id=CONCEPT_ID)
    files = earthaccess.download(results, str(OUTPUT_DIR))
    files = [Path(f) for f in files]
    print(f"Downloaded {len(files)} file(s) to {OUTPUT_DIR}.")

    # Prepare HMA data
    print("*** Prepare HMA data ***")
    glacial_lakes_per_epoch = []
    glacial_lake_locations_per_epoch = []
    shp_files = list(OUTPUT_DIR.glob("*.shp"))
    for i, file in enumerate(shp_files):
        gdf = gpd.read_file(shp_files[i])
        gdf.drop(
            columns=[
                "BUFF_DIST",
                "FID_GTNG_2",
                "RGI_CODE",
                "WGMS_CODE",
                "FID_GTN_G_",
                "FULL_NAME_",
                "RGI_CODE_1",
                "WGMS_CODE_",
                "FID_UIA_Wo",
                "FID_1",
            ],
            inplace=True,
        )

        for start, entry in gdf.groupby("Year_Start"):
            print("Processing")
            print(entry[["Year_Start", "Lat", "Lon", "FULL_NAME"]].head(3))
            print(entry.columns)

            # Lakes > 0.05 km2
            entry["Area_km2"] = entry["Area_m2"] / 1_000_000
            filtered = entry[entry["Area_km2"] >= GLACIAL_MIN_SIZE]
            assert filtered["Area_km2"].min() >= GLACIAL_MIN_SIZE
            assert len(filtered) > 1

            end = start[:2] + entry["YearRange"].unique().item().split(".")[1]

            filtered["Latitude"] = filtered["CENTROID_Y"]
            filtered["Longitude"] = filtered["CENTROID_X"]

            filtered = filtered.drop(
                columns=["geometry", "CENTROID_Y", "CENTROID_X", "Geo_ID"]
            )

            glacial_lakes_per_epoch.append(
                {
                    "start": int(start),
                    "end": int(end),
                    "lakes": len(filtered),
                    "total_area": float(filtered["Area_km2"].sum()),
                }
            )
            glacial_lake_locations_per_epoch.append(
                {
                    "start": int(start),
                    "end": int(end),
                    "children": filtered.to_dict(orient="records"),
                }
            )

    # Write HMA statistics
    print("***Write HMA statistics***")
    with open(OUTPUT_DIR / "HMA_statistics.json", "w") as f:
        json.dump(glacial_lakes_per_epoch, f, indent=4, ensure_ascii=False)

    with open(OUTPUT_DIR / "HMA_locations.json", "w") as f:
        json.dump(glacial_lake_locations_per_epoch, f, indent=4, ensure_ascii=False)

    # Download per capita CO2 emission
    # counties = [
    #     "GRL",
    #     "BTN",
    #     "USA",
    #     "CHN",
    #     "CHL",
    #     "CAN",
    #     "NOR",
    #     "PER",
    #     "IND",
    #     "PAK",
    #     "ARG",
    #     "NPL",
    #     "AFG",
    #     "KGZ",
    #     "ISL",
    #     "TJK",
    #     "KAZ",
    #     "BOL",
    #     "SWE",
    #     "NZL",
    #     "CHE",
    #     "ITA",
    #     "AUT",
    #     "MNG",
    #     "FRA",
    #     "GEO",
    #     "COL",
    #     "ECU",
    # ]
    # df = pd.read_csv(
    #     f"https://ourworldindata.org/grapher/co-emissions-per-capita.csv?v=1&csvType=filtered&useColumnShortNames=true&country={'~'.join(counties)}",
    #     storage_options={"User-Agent": "Our World In Data data fetch/1.0"},
    # )
    # # Write per capita CO2 emission
    # df.to_csv(OUTPUT_DIR / "co2-emissions-2.csv", index=False)
