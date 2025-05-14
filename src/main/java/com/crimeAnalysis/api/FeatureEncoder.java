package com.crimeAnalysis.api;

import com.crimeAnalysis.CrimeRecord;  // assuming your maps live here

public class FeatureEncoder {
    /**
     * Must match exactly the order & encoding you used when training.
     */
    public static double[] encode(
        String age, String sex, String race, String borough, String tod,
        double latitude, double longitude
    ) {
        // map categorical→numeric (same as in CrimeRecord or CrimeDataset)
        double a = CrimeRecord.ageMap.getOrDefault(age.toUpperCase(), 0);
        double s = CrimeRecord.sexMap.getOrDefault(sex.toUpperCase(), 0);
        double r = CrimeRecord.getRaceIndex(race.toUpperCase());
        double b = CrimeRecord.boroughMap.getOrDefault(borough.toUpperCase(), 0);
        double h = Integer.parseInt(tod);    // if you used hour as numeric
        // latitude & longitude pass through:
        return new double[]{ a, s, r, b, h, latitude, longitude };
    }
}
