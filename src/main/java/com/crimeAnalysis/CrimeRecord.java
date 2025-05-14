package com.crimeAnalysis;

// import java.io.*;
// import java.nio.file.*;
//import java.util.Map;
import java.util.Map;

public class CrimeRecord {
    String date;
    String time;
    String borough;
    double latitude;
    double longitude;
    String vicAge;
    String vicRace;
    String vicSex;
    String riskLabel;

    // 1a) encode each category as an integer
    public static final Map<String,Integer> ageMap = Map.of(
        "<18", 0, "18-24", 1, "25-44", 2, "45-64", 3, "65+", 4
    );
    public static final Map<String,Integer> sexMap = Map.of(
        "M", 0, "F", 1
    );
    public static final Map<String,Integer> boroughMap = Map.of(
        "MANHATTAN", 0,
        "BROOKLYN",  1,
        "QUEENS",    2,
        "BRONX",     3,
        "STATEN ISLAND", 4
    );
    
    // 1b) a method to encode race categories
    public static int getRaceIndex(String race) {
        return switch (race) {
            case "BLACK" -> 0;
            case "WHITE" -> 1;
            case "ASIAN/PACIFIC ISLANDER" -> 2;
            case "WHITE HISPANIC" -> 3;
            case "AMERICAN INDIAN/ALASKAN NATIVE" -> 4;
            default -> -1; 
        };
    }

    /** Map the fields into a numeric feature vector */
    public double[] toFeatureVector() {
        int ageIdx     = CrimeRecord.ageMap.getOrDefault(vicAge, 0);
        int sexIdx     = CrimeRecord.sexMap.getOrDefault(vicSex, 0);
        int raceIdx    = getRaceIndex(vicRace);
        int boroughIdx = CrimeRecord.boroughMap.getOrDefault(borough, 0);
        int hour       = Integer.parseInt(time.split(":")[0]);
        return new double[]{ageIdx, sexIdx, raceIdx, boroughIdx, hour, latitude, longitude};
    }

    /** Convert your riskLabel string into the matching int code */
    public int toLabelIndex() {
        switch (riskLabel) {
            case "Low":    return 0;
            case "Medium": return 1;
            case "High":   return 2;
            default:       return -1;
        }
    }

    public void handleMissingValues(Map<String, String> ageModeMap,
                                    Map<String, String> sexModeMap,
                                    Map<String, String> raceModeMap) {
        if (vicAge.equals("UNKNOWN")) vicAge = ageModeMap.getOrDefault(borough, vicAge);
        if (vicSex.equals("UNKNOWN")) vicSex = sexModeMap.getOrDefault(borough, vicSex);
        if (vicRace.equals("UNKNOWN")) vicRace = raceModeMap.getOrDefault(borough, vicRace);
    }

    public boolean filterByLocation(double minLat, double maxLat, double minLng, double maxLng) {
        return latitude >= minLat && latitude <= maxLat && longitude >= minLng && longitude <= maxLng;
    }

    public String getGroupKey() {
        return borough + "_" + vicAge + "_" + vicSex + "_" + vicRace;
    }

    public void setRiskLabel(String label) {
        this.riskLabel = label;
    }

    //testing
    // public String toString() {
    //     return String.format(
    //     "CrimeRecord{date=%s, time=%s, borough=%s, lat=%.6f, lng=%.6f, age=%s, race=%s, sex=%s, label=%s}",
    //     date, time, borough, latitude, longitude, vicAge, vicRace, vicSex, riskLabel
    //     );
    // }
    public String toString() {
        return String.format(
            "CrimeRecord[date=%s, time=%s, borough=%s, lat=%.6f, lon=%.6f, age=%s, race=%s, sex=%s, label=%s]",
            date, time, borough, latitude, longitude, vicAge, vicRace, vicSex,
            (riskLabel != null ? riskLabel : "UNLABELED")
        );
    }

}