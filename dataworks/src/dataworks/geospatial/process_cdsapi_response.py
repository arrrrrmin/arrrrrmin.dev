import argparse
import enum
import json
from pathlib import Path

import numpy as np
import xarray as xr


def call_for_arguments():
    argparser = argparse.ArgumentParser(
        "Processing NetCDF Copernicus Data Store outputs to a "
        "visualisable structure."
    )

    argparser.add_argument(
        "--nc-dir",
        dest="nc_dir",
        type=Path,
        help="Path to directory where .nc files live",
        required=True,
    )
    return argparser.parse_args()


def main(nc_dir: Path = None):
    ds = xr.open_mfdataset(
        f"{nc_dir}/*", engine="netcdf4", join="outer", compat="no_conflicts"
    )

    vt = ds["valid_time"].values
    print(
        "valid_time:", vt.size, "unique:", np.unique(vt).size
    )  # doubled => duplicates
    print("tp finite:", np.isfinite(ds["tp"].values).sum(), "of", ds["tp"].size)

    if "expver" in ds.coords and ds["expver"].dims == ("valid_time",):
        for ev in np.unique(ds["expver"].values):
            sub = ds["tp"].where(ds["expver"] == ev)
            print(f"  expver {ev}: tp finite {np.isfinite(sub.values).sum()}")

    # Unique valid_time, drop duplicates by using the day
    ds = ds.assign_coords(valid_time=ds["valid_time"].dt.floor("D"))
    ds = ds.groupby("valid_time").max(skipna=True)
    ds = ds.drop_vars(["expver", "number"], errors="ignore")

    assert ds.indexes[
        "valid_time"
    ].is_unique, "Time coordinate doubled — stamps aren't collapsing"

    # Unit conversion
    ds["t2m"] = ds["t2m"] - 272.15
    ds["t2m"].attrs.update({"units": "°C"})
    ds["tp"] = ds["tp"] * 1000
    ds["tp"].attrs.update({"units": "mm"})

    # Land/sea mask
    lsm = ds["lsm"]
    land_mask = (
        (lsm > 0.5).reindex(valid_time=ds["valid_time"]).broadcast_like(ds["t2m"])
    )

    ds = ds.drop_vars("lsm")

    print(f"Cube contains '{len(ds.variables)}' variables")
    print(f"Time dimension corrected: {ds.indexes["valid_time"].is_unique}")

    OUTPUT_DIR = Path("outputs/cds-cubes/cds_era5_monthly_eu")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    variables = ["t2m", "tp"]
    SENTINEL = 255  # NaN marker; real data uses 0..254

    meta = {
        "lons": ds["longitude"].values.tolist(),
        "lats": ds["latitude"].values.tolist(),
        "times": ds["valid_time"].dt.strftime("%Y-%m").values.tolist(),
        "variables": {},
    }

    monthly = {}

    for name in variables:
        assert (
            ds[name].sizes["valid_time"] == land_mask.sizes["valid_time"]
        ), f"Variable '{name}' valid_time size doesn't match landmasks valid_time"

        da = ds[name].where(land_mask, np.nan).astype("float32")

        da_avg = da.mean(dim=["longitude", "latitude"], skipna=True).values
        da_sum = da.sum(dim=["longitude", "latitude"], skipna=True).values
        da_med = da.median(dim=["longitude", "latitude"], skipna=True).values
        da_min = da.min(dim=["longitude", "latitude"], skipna=True).values
        da_max = da.max(dim=["longitude", "latitude"], skipna=True).values
        monthly[name] = [
            {
                "variable": name,
                "time": t,
                "sum": float(da_sum[i]),
                "mean": float(da_avg[i]),
                "med": float(da_med[i]),
                "min": float(da_min[i]),
                "max": float(da_max[i]),
            }
            for i, t in enumerate(meta["times"])
        ]

        a = da.values.astype("float32")
        # Quantise to int8
        ok = np.isfinite(a)
        vmin, vmax = float(a[ok].min()), float(a[ok].max())
        scale = (vmax - vmin) / 254.0 or 1.0
        q = np.full(a.shape, SENTINEL, dtype="uint8")
        q[ok] = np.clip(np.round((a[ok] - vmin) / scale), 0, 254).astype("uint8")
        np.ascontiguousarray(q).tofile(OUTPUT_DIR / f"cube_{name}.u8")
        meta["variables"][name] = {
            "long_name": ds[name].attrs.get("long_name", name),
            "units": ds[name].attrs.get("units"),
            "vmin": vmin,
            "vmax": vmax,
            "scale": scale,
            "sentinel": SENTINEL,
        }

    with (OUTPUT_DIR / "cube.json").open("w") as f:
        json.dump(meta, f)

    with (OUTPUT_DIR / "monthly.json").open("w") as f:
        json.dump(monthly, f)


if __name__ == "__main__":
    arguments = call_for_arguments()
    main(nc_dir=arguments.nc_dir)
