package com.crimeAnalysis;

import smile.base.cart.SplitRule;
import smile.classification.RandomForest;
import smile.data.DataFrame;
// import smile.data.Tuple;
import smile.data.formula.Formula;
// import smile.data.type.StructType;
import smile.data.vector.IntVector;

import java.io.*;
import java.util.Arrays;

public class TrainSaveLoadRF {

      public static void main(String[] args) throws Exception {
         if (args.length == 0) {
               System.err.println("Usage: mvn exec:java -Dexec.mainClass=com.crimeAnalysis.ModelSmokeTest -Dexec.args=\"<dataPath>\"");
               return;
         }

         String dataPath = args[0];
         File modelFile = new File("src/main/resources/model/randomForest.model");

         // declare rf here so it's visible to the rest of main
         RandomForest rf = null;

         if (!modelFile.exists()) {
            // if you refactor trainAndSaveModel to return the trained RF, you could do:
            //     rf = trainAndSaveModel(dataPath, modelFile);
            // otherwise it just writes the file and you can immediately deserialize below:
            trainAndSaveModel(dataPath, modelFile);
            try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(modelFile))) {
                  rf = (RandomForest) ois.readObject();
            }
         } else {
            System.out.println("Model already exists at " + modelFile.getPath());
            try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(modelFile))) {
                  rf = (RandomForest) ois.readObject();
            } catch (IOException | ClassNotFoundException e) {
                  throw new RuntimeException("Failed to load RandomForest model", e);
            }
         }

         System.out.println("\nNumber of trees in RF = " + rf.size());
         //  double[] sample = new double[]{1,0,2,3,14,40.7128,-74.0060};
        
        //  StructType schema = rf.schema();
        //  //{"age", "sex", "race", "borough", "hour", "latitude", "longitude"}
        //  double[] raw = { 3, 1, 1, 2, 14, 40.7282, -73.7949 }; 
        //  Tuple sample = Tuple.of(raw, schema);
        //  int label = rf.predict(sample);

        //  String[] labelNames = { "Low", "Medium", "High" };
        //  System.out.println("\nUser risk predictions = "+ labelNames[label]);
      }

      public static void trainAndSaveModel(String dataPath, File modelFile) throws IOException {
         System.out.println("Training model...");
         CrimeDataset dataset = new CrimeDataset();
         dataset.load(dataPath);
         dataset.imputeMissingValues();
         dataset.labelData();
 
         double[][] X = dataset.getFeatureArray();
         int[] y = dataset.getLabelArray();

         int n = X.length;

        // 2) Split 80/20 for testing
        int trainN = (int)(n * 0.8);
        double[][] trainX = Arrays.copyOfRange(X, 0, trainN);
        int[] trainY = Arrays.copyOfRange(y, 0, trainN);
        
        // 4) Train & evaluate RandomForest directly
        // Build a DataFrame of features + label
        String[] featureNames = {"age","sex","race","borough","hour","latitude","longitude"};
        
        DataFrame df = DataFrame.of(trainX, featureNames)
                                .merge(IntVector.of("label", trainY));
        Formula formula = Formula.lhs("label");

        // Hyperparameters (Smile 2.6.x nine-arg overload)
        int ntrees = 150;
        int mtry = (int) Math.sqrt(featureNames.length);
        SplitRule rule = SplitRule.GINI;
        int maxDepth = 15;
        int maxNodes = trainX.length;  // ≥1
        int nodeSize = 50;
        double subsample = 0.7;

        // Fit:
        RandomForest rf = RandomForest.fit(
            formula, df,
            ntrees, mtry, rule,
            maxDepth, maxNodes, nodeSize,
            subsample
        );

        System.out.println("Training complete.");
 
         modelFile.getParentFile().mkdirs();
         try (ObjectOutputStream out = new ObjectOutputStream(new FileOutputStream(modelFile))) {
             out.writeObject(rf);
             System.out.println("Model saved to " + modelFile.getPath());
         }
     }
 
     public static RandomForest loadModel(File modelFile) {
         try (ObjectInputStream in = new ObjectInputStream(new FileInputStream(modelFile))) {
             return (RandomForest) in.readObject();
         } catch (IOException | ClassNotFoundException e) {
             System.err.println("Failed to load model.");
             e.printStackTrace();
             return null;
         }
      }
   }

