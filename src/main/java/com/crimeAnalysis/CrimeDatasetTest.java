// package com.crimeAnalysis;

// import java.io.IOException;
// import java.util.Arrays;

// public class CrimeDatasetTest {
//     public static void main(String[] args) {
//         CrimeDataset ds = new CrimeDataset();
//         try {
//             // point to your toy CSV
//             ds.load("data/toyDataset.csv");

//             // run all processing steps
//             ds.imputeMissingValues();
//             ds.labelData();

//             // sanity-check: how many records?
//             System.out.println("Loaded " + ds.getRecords().size() + " records.");

//             // print out feature vectors + labels
//             double[][] features = ds.getFeatureArray();
//             int[] labels      = ds.getLabelArray();
//             for (int i = 0; i < features.length; i++) {
//                 System.out.println(
//                     "row " + i
//                   + " → features=" + Arrays.toString(features[i])
//                   + ", label=" + labels[i]
//                 );
//             }

//         } catch (IOException e) {
//             e.printStackTrace();
//         }
//     }
// }
