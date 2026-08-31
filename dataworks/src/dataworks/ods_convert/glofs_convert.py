import pandas as pd

if __name__ == "__main__":
    sheets = pd.read_excel("others/glofdatabase_v4-2.ods", engine="odf", sheet_name=None)
    df = (
        pd.concat(sheets, names=["region"])
        .reset_index(level="region")
        .reset_index(drop=True)
    )
    df.to_csv("outputs/glofdatabase_v4-2.csv", index=False)
