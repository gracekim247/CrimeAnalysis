// package com.crimeAnalysis;

// import smile.classification.RandomForest;
// import com.crimeAnalysis.model.DecisionTreeModel;
// import com.crimeAnalysis.model.RandomForestModel;


// public class CrimeRiskPredictor {

//     private final RandomForest rf;

//     public RiskPredictor(RandomForest model) {
//         this.rf = model;
//     }

//     public String predictRisk(String age, String sex, String race, String borough, int hour, double lat, double lng) {
//         double[] input = new double[]{
//             CrimeRecord.ageMap.getOrDefault(age, 0),
//             CrimeRecord.sexMap.getOrDefault(sex, 0),
//             CrimeRecord.getRaceIndex(race),
//             CrimeRecord.boroughMap.getOrDefault(borough, 0),
//             hour,
//             lat,
//             lng
//         };

//         int label = rf.predict(input);
//         return switch (label) {
//             case 0 -> "Low";
//             case 1 -> "Medium";
//             case 2 -> "High";
//             default -> "Unknown";
//         };
//     }
// }
