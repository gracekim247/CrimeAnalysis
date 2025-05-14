package com.crimeAnalysis.api;

import static spark.Spark.*;

import com.crimeAnalysis.TrainSaveLoadRF;

import smile.classification.RandomForest;
import smile.data.DataFrame;

import com.google.gson.Gson;

import java.io.File;

public class RiskApi {
    private static final int PORT = 8080;
    private static final String MODEL_PATH = "src/main/resources/model/randomForest.model";
    private static final String DATA_CSV   = "src/main/resources/data/dataset.csv";

    private static RandomForest rf;
    private static Gson gson = new Gson();

    public static void main(String[] args) throws Exception {
        // 1) Train or load the model
        File modelFile = new File(MODEL_PATH);
        if (!modelFile.exists()) {
            TrainSaveLoadRF.trainAndSaveModel(DATA_CSV, modelFile);
        }
        rf = TrainSaveLoadRF.loadModel(modelFile);
        if (rf == null) {
            throw new RuntimeException("Failed to load RF model.");
        }

        // 2) Spark setup
        port(PORT);
        before((req, res) -> {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
            res.header("Access-Control-Allow-Headers", "Content-Type");
        });
        options("/*", (req, res) -> "");

        // 3) Prediction endpoint
        post("/api/predict", (req, res) -> {
            PredictionRequest in = gson.fromJson(req.body(), PredictionRequest.class);

            double[] features = FeatureEncoder.encode(
                in.age, in.sex, in.race, in.borough, in.hour,
                in.latitude, in.longitude
            );

            // 2) Wrap it in a 1-row DataFrame (so we can get a Tuple)
            String[] featureNames = {"age","sex","race","borough","hour","latitude","longitude"};
            DataFrame userDf = DataFrame.of(new double[][] { features }, featureNames);

            // 3) Predict by passing the first row (a Tuple) to RandomForest
            int label = rf.predict(userDf.get(0));
            String risk = switch(label) {
                case 0 -> "Low";
                case 1 -> "Medium";
                case 2 -> "High";
                default -> "Unknown";
            };

            res.type("application/json");
            return gson.toJson(new PredictionResponse(risk));
        });
    }

    // DTO for incoming JSON
    static class PredictionRequest {
        String age;
        String sex;
        String race;
        String borough;
        String hour;      // or int if you prefer
        double latitude;  
        double longitude;
    }

    // DTO for outgoing JSON
    static class PredictionResponse {
        final String risk;
        PredictionResponse(String risk) { this.risk = risk; }
    }
}
