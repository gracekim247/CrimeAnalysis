package com.crimeAnalysis;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;


public class CrimeDataset {
   List<CrimeRecord> records = new ArrayList<>();

   public void load(String filepath) throws IOException {
       List<String> lines = Files.readAllLines(Paths.get(filepath));
       lines.remove(0); // remove header

       for (String line : lines) {
           String[] parts = line.split(",");
           if (parts.length < 9) continue;
           CrimeRecord record = new CrimeRecord();
           record.date = parts[0].trim();
           record.time = parts[1].trim();
           //skip offense attribute
           record.borough = parts[3].trim().toUpperCase();
           record.latitude = Double.parseDouble(parts[4]);
           record.longitude = Double.parseDouble(parts[5]);
           record.vicAge = parts[6].trim();
           record.vicRace = parts[7].trim().toUpperCase();
           record.vicSex = parts[8].trim().toUpperCase();
           records.add(record);
       }
   }

   // handle "Unknown" values 
   public void imputeMissingValues() {
       Map<String, Map<String, Integer>> ageCounts = new HashMap<>();
       Map<String, Map<String, Integer>> sexCounts = new HashMap<>();
       Map<String, Map<String, Integer>> raceCounts = new HashMap<>();

       for (CrimeRecord r : records) {
           if (!r.vicAge.equals("UNKNOWN")) ageCounts.computeIfAbsent(r.borough, k -> new HashMap<>())
               .merge(r.vicAge, 1, Integer::sum);
           if (!r.vicSex.equals("UNKNOWN")) sexCounts.computeIfAbsent(r.borough, k -> new HashMap<>())
               .merge(r.vicSex, 1, Integer::sum);
           if (!r.vicRace.equals("UNKNOWN")) raceCounts.computeIfAbsent(r.borough, k -> new HashMap<>())
               .merge(r.vicRace, 1, Integer::sum);
       }

       Map<String, String> ageModes = computeModes(ageCounts);
       Map<String, String> sexModes = computeModes(sexCounts);
       Map<String, String> raceModes = computeModes(raceCounts);

       for (CrimeRecord r : records) {
           r.handleMissingValues(ageModes, sexModes, raceModes);
       }
   }

   private Map<String, String> computeModes(Map<String, Map<String, Integer>> counts) {
       Map<String, String> modes = new HashMap<>();
       for (String borough : counts.keySet()) {
           Map<String, Integer> inner = counts.get(borough);
           String mode = inner.entrySet().stream()
               .max(Map.Entry.comparingByValue())
               .map(Map.Entry::getKey).orElse("UNKNOWN");
           modes.put(borough, mode);
       }
       return modes;
   }

   public void labelData() {
       Map<String, Integer> groupCounts = new HashMap<>();

       // Group by borough+age+sex+race
       for (CrimeRecord r : records) {
           String key = r.getGroupKey();
           groupCounts.put(key, groupCounts.getOrDefault(key, 0) + 1);
       }

       List<Integer> countList = new ArrayList<>(groupCounts.values());
       Collections.sort(countList);

       // Calculate thresholds for high, medium, and low risks
       int total = countList.size();
       int p50 = countList.get(total / 2);
       int p75 = countList.get((int)(total * 0.75));

       // Set a risk label for each record based on above calculation
       for (CrimeRecord r : records) {
           int count = groupCounts.getOrDefault(r.getGroupKey(), 0);
           if (count >= p75) {
               r.setRiskLabel("High");
           } else if (count >= p50) {
               r.setRiskLabel("Medium");
           } else {
               r.setRiskLabel("Low");
           }
       }
   }

    // Converts processed records into a 2D feature array for SMILE. 
    // [ ageIndex, sexIndex, raceIndex, boroughIndex, hour, latitude, longitude ]
    public double[][] getFeatureArray() {
        double[][] features = new double[records.size()][];
        for (int i = 0; i < records.size(); i++) {
            features[i] = records.get(i).toFeatureVector();
        }
        return features;
    }

    // Converts riskLabel ("Low","Medium","High") into int[] --> (0,1,2) 
    public int[] getLabelArray() {
        int[] labels = new int[records.size()];
        for (int i = 0; i < records.size(); i++) {
            labels[i] = records.get(i).toLabelIndex();
        }
        return labels;
    }

    public List<CrimeRecord> getRecords() {
        return records;
    }

    //test 
    // public static void main(String[] args) throws IOException {
    //     if (args.length != 1) {
    //         System.err.println("Usage: java com.crimeAnalysis.CrimeDataset <csv-path>");
    //         System.exit(1);
    //     }
    //     CrimeDataset ds = new CrimeDataset();
    //     ds.load(args[0]);
    //     ds.imputeMissingValues();
    //     ds.labelData();
    //     System.out.println("Records: " + ds.getRecords().size());

    //     for (CrimeRecord r : ds.getRecords()) {
    //         System.out.println(r);
    //     }
    // }
}

