import unittest
import pandas as pd
import numpy as np

from src.data.clean import (
    drop_duplicate_ids,
    rename_location_columns,
    clean_properties_dataset,
    LOCATION_COLUMNS_MAPPING,
)
from src.features.build_features import create_engineered_features


class TestDataCleaning(unittest.TestCase):
    def setUp(self):
        self.sample_df = pd.DataFrame({
            "id": [1, 2, 2, 3],
            "l1": ["Argentina", "Argentina", "Argentina", "Uruguay"],
            "l2": ["Capital Federal", "Córdoba", "Córdoba", "Montevideo"],
            "l3": ["Palermo", "Capital", "Capital", "Pocitos"],
            "l4": ["Palermo Soho", None, None, None],
            "price": [150000, 80000, 80000, 200000],
            "surface_total": [50.0, 70.0, 70.0, 90.0],
            "surface_covered": [45.0, 60.0, 60.0, 85.0],
            "rooms": [2, 3, 3, 4],
            "bedrooms": [1, 2, 2, 3],
        })

    def test_rename_location_columns(self):
        df_renamed = rename_location_columns(self.sample_df)

        self.assertIn("country", df_renamed.columns)
        self.assertIn("province", df_renamed.columns)
        self.assertIn("state", df_renamed.columns)
        self.assertIn("neighbourhood", df_renamed.columns)

        self.assertNotIn("l1", df_renamed.columns)
        self.assertNotIn("l2", df_renamed.columns)
        self.assertNotIn("l3", df_renamed.columns)
        self.assertNotIn("l4", df_renamed.columns)

    def test_drop_duplicate_ids(self):
        df_dedup = drop_duplicate_ids(self.sample_df)
        self.assertEqual(len(df_dedup), 3)
        self.assertEqual(df_dedup["id"].tolist(), [1, 2, 3])

    def test_clean_properties_dataset(self):
        df_cleaned = clean_properties_dataset(self.sample_df, country_filter="Argentina")

        # Uruguay record (id 3) dropped, duplicated id 2 dropped -> 2 records remain
        self.assertEqual(len(df_cleaned), 2)
        self.assertIn("country", df_cleaned.columns)
        self.assertTrue((df_cleaned["country"] == "Argentina").all())

    def test_filter_property_types(self):
        from src.data.clean import filter_property_types
        df_props = pd.DataFrame({
            "property_type": ["Departamento", "Casa", "PH", "Lote", "Local comercial", "departamento", "ph"]
        })
        filtered = filter_property_types(df_props)
        self.assertEqual(len(filtered), 5)
        self.assertTrue(filtered["property_type"].str.lower().isin(["departamento", "casa", "ph"]).all())


if __name__ == "__main__":
    unittest.main()
