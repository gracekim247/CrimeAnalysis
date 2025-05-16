package com.crimeAnalysis.api;

import static spark.Spark.*;

import com.crimeAnalysis.CrimeRecord;
import com.crimeAnalysis.CrimeDataset;
import com.crimeAnalysis.TrainSaveLoadRF;

import smile.classification.RandomForest;
import smile.data.DataFrame;
import smile.data.Tuple;

import com.google.gson.Gson;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Collections;

public class RiskApi {
    private static final int PORT = 8080;
    private static final String MODEL_PATH = "src/main/resources/model/randomForest.model";
    private static final String DATA_CSV   = "src/main/resources/data/dataset.csv";

    private static RandomForest rf;
    private static Gson gson = new Gson();

    private static List<CrimeRecord> allCrimeRecords;
    private static String[] featureNames = {"age","sex","race","borough","hour","latitude","longitude"};

    public static void main(String[] args) throws Exception {
        File modelFile = new File(MODEL_PATH);
        if (!modelFile.exists()) {
            TrainSaveLoadRF.trainAndSaveModel(DATA_CSV, modelFile);
        }
        rf = TrainSaveLoadRF.loadModel(modelFile);
        if (rf == null) {
            throw new RuntimeException("Failed to load RF model.");
        }

        CrimeDataset ds = new CrimeDataset();
        ds.load(DATA_CSV);
        ds.imputeMissingValues();
        ds.labelData();
        allCrimeRecords = ds.getRecords();


        port(PORT);
        before((req, res) -> {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
            res.header("Access-Control-Allow-Headers", "Content-Type");
        });
        options("/*", (req, res) -> "");

        post("/api/predict", (req, res) -> {
            res.type("application/json");
            try {
                PredictionRequest in = gson.fromJson(req.body(), PredictionRequest.class);
                
                validateInput(in);
                
                double[] features = FeatureEncoder.encode(
                    in.age, in.sex, in.race, in.borough, in.hour, in.latitude, in.longitude
                );

                DataFrame userDf = DataFrame.of(new double[][] { features }, featureNames);
                
                if (userDf == null || userDf.isEmpty()) {
                    throw new IllegalStateException("Failed to create DataFrame from features");
                }
                
                int label;
                try {
                    Tuple tuple = userDf.get(0);
                    label = rf.predict(tuple);
                } catch (Exception e) {
                    System.err.println("Prediction error: " + e.getMessage());
                    e.printStackTrace();
                    label = 0; 
                }
                
                String risk = switch(label) {
                    case 0 -> "Low";
                    case 1 -> "Medium";
                    case 2 -> "High";
                    default -> "Unknown";
                };

                return gson.toJson(new PredictionResponse(risk));
            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(
                    Collections.singletonMap("error", e.getMessage())
                );
            }
        });

        post("/api/heatmap-data", (req, res) -> {
            
            res.type("application/json");
            try {
                PredictionRequest in = gson.fromJson(req.body(), PredictionRequest.class);

                validateInput(in);

                if (allCrimeRecords == null || allCrimeRecords.isEmpty()) {
                    throw new IllegalStateException("allCrimeRecords is empty; did you load the dataset?");
                }

                double[] userFeats = FeatureEncoder.encode(
                    in.age, in.sex, in.race, in.borough, in.hour, in.latitude, in.longitude
                );
                
                DataFrame userDf = DataFrame.of(new double[][] { userFeats }, featureNames);
                
                int userLabel;
                try {
                    Tuple userTup = userDf.get(0);
                    userLabel = rf.predict(userTup);
                } catch (Exception e) {
                    System.err.println("User prediction error: " + e.getMessage());
                    e.printStackTrace();
                    userLabel = 0;
                }

                List<Map<String,Object>> points = new ArrayList<>();
                
                int count = 0;
                double maxDistance = 0.01; 
                
                for (CrimeRecord r : allCrimeRecords) {
                    double[] recFeats = r.toFeatureVector();
                    double lat = recFeats[5];
                    double lng = recFeats[6];
                    
                    if (Math.abs(lat - in.latitude) > maxDistance || 
                        Math.abs(lng - in.longitude) > maxDistance) {
                        continue;
                    }
                    
                    if (count++ > 100) break;
                    
                    int recLabel;
                    try {
                        DataFrame recDf = DataFrame.of(new double[][] { recFeats }, featureNames);
                        Tuple recTup = recDf.get(0);
                        recLabel = rf.predict(recTup);
                    } catch (Exception e) {
                        continue;
                    }

                    double weight = recLabel == userLabel ? 1.0 : 0.3;
                    Map<String,Object> pt = new HashMap<>();
                    pt.put("lat", lat);
                    pt.put("lng", lng);
                    pt.put("weight", weight);
                    points.add(pt);
                }
                
                if (points.isEmpty()) {
                    Map<String,Object> userPt = new HashMap<>();
                    userPt.put("lat", in.latitude);
                    userPt.put("lng", in.longitude);
                    userPt.put("weight", 0.5);
                    points.add(userPt);
                }

                return gson.toJson(points);


            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(
                    Collections.singletonMap("error", e.getMessage())
                );
            }
            
        });

        awaitInitialization();
        System.out.println("RiskApi listening on port " + PORT);

        awaitStop();
    }

    private static void validateInput(PredictionRequest in) {
        if (in == null) {
            throw new IllegalArgumentException("Request body cannot be null");
        }
        
        if (in.age == null || in.age.isEmpty()) {
            in.age = "25-44"; 
        }
        
        if (in.sex == null || in.sex.isEmpty()) {
            in.sex = "unknown";
        }
        
        if (in.race == null || in.race.isEmpty()) {
            in.race = "unknown";
        }
        
        if (in.borough == null || in.borough.isEmpty()) {
            in.borough = "Manhattan"; 
        }
        
        if (in.hour == null || in.hour.isEmpty()) {
            in.hour = "12"; 
        }
        
        if (Double.isNaN(in.latitude) || Double.isInfinite(in.latitude)) {
            in.latitude = 40.7128; 
        }
        
        if (Double.isNaN(in.longitude) || Double.isInfinite(in.longitude)) {
            in.longitude = -74.0060; 
        }
    }


    static class PredictionRequest {
        String age;
        String sex;
        String race;
        String borough;
        String hour;      
        double latitude;  
        double longitude;
    }

    static class PredictionResponse {
        final String risk;
        PredictionResponse(String risk) { this.risk = risk; }
    }
}
