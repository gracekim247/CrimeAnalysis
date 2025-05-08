package com.crimeAnalysis;

import smile.base.cart.SplitRule;
import smile.classification.RandomForest;
import smile.data.DataFrame;
import smile.data.formula.Formula;
import smile.data.vector.IntVector;

import java.io.*;
import java.util.Arrays;

public class ModelSmokeTest {

      public static void main(String[] args) throws Exception {
         if (args.length == 0) {
               System.err.println("Usage: mvn exec:java -Dexec.mainClass=com.crimeAnalysis.ModelSmokeTest -Dexec.args=\"<dataPath>\"");
               return;
         }

         String dataPath = args[0];
         File modelFile = new File("src/main/resources/model/randomForest.model");

         if (!modelFile.exists()) {
               trainAndSaveModel(dataPath, modelFile);
         } else {
            System.out.println("Model already exists at " + modelFile.getPath());
         }
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

   //      RandomForest rf = loadModel(modelFile);
   //      if (rf != null) {
   //          Scanner scanner = new Scanner(System.in);
   //          System.out.println("Enter user demographics to predict risk:");
   //          System.out.print("Age Group (<18, 18-24, 25-44, 45-64, 65+): ");
   //          String age = scanner.nextLine().trim();
   //          System.out.print("Sex (M/F): ");
   //          String sex = scanner.nextLine().trim().toUpperCase();
   //          System.out.print("Race: ");
   //          String race = scanner.nextLine().trim().toUpperCase();
   //          System.out.print("Borough: ");
   //          String borough = scanner.nextLine().trim().toUpperCase();
   //          System.out.print("Hour (0-23): ");
   //          int hour = Integer.parseInt(scanner.nextLine().trim());
   //          System.out.print("Latitude: ");
   //          double lat = Double.parseDouble(scanner.nextLine().trim());
   //          System.out.print("Longitude: ");
   //          double lng = Double.parseDouble(scanner.nextLine().trim());

   //          double[] input = new double[]{
   //              CrimeRecord.ageMap.getOrDefault(age, 0),
   //              CrimeRecord.sexMap.getOrDefault(sex, 0),
   //              CrimeRecord.getRaceIndex(race),
   //              CrimeRecord.boroughMap.getOrDefault(borough, 0),
   //              hour,
   //              lat,
   //              lng
   //          };

   //          String[] featureNames = {"age","sex","race","borough","hour","latitude","longitude"};

   //          //int pred = rf.predict(input);
   //          DataFrame userDf = DataFrame.of(new double[][] { input }, featureNames);
   //          int rfLabel = rf.predict(userDf.get(0));
            
   //          String[] labelNames = { "Low", "Medium", "High" };
   //          System.out.println("\n== User risk predictions ==");
   //          // System.out.println("DecisionTree says: " + labelNames[dtLabel]);
   //          System.out.println("Predicted Risk: " + labelNames[rfLabel]);

   //          // String label = switch (pred) {
   //          //     case 0 -> "Low";
   //          //     case 1 -> "Medium";
   //          //     case 2 -> "High";
   //          //     default -> "Unknown";
   //          // };
   //          // System.out.println("Predicted risk: " + label);
   //      }
   //  }

   //  public static void trainAndSaveModel(String dataPath, File modelFile) throws IOException {
   //      System.out.println("Training model...");
   //      CrimeDataset dataset = new CrimeDataset();
   //      dataset.load(dataPath);
   //      dataset.imputeMissingValues();
   //      dataset.labelData();

   //      double[][] X = dataset.getFeatureArray();
   //      int[] y = dataset.getLabelArray();
   //      int n = X.length;

   //      // 2) Split 80/20 for testing
   //      int trainN = (int)(n * 0.8);
   //      double[][] trainX = Arrays.copyOfRange(X, 0, trainN);
   //      int[] trainY = Arrays.copyOfRange(y, 0, trainN);
   //    //   double[][] testX  = Arrays.copyOfRange(X, trainN, n);
   //    //   int[] testY  = Arrays.copyOfRange(y, trainN, n);
        
   //      // 4) Train & evaluate RandomForest directly
   //      // Build a DataFrame of features + label
   //      String[] featureNames = {"age","sex","race","borough","hour","latitude","longitude"};
        
   //      DataFrame df = DataFrame.of(trainX, featureNames)
   //                              .merge(IntVector.of("label", trainY));
   //      Formula formula = Formula.lhs("label");

   //      // Hyperparameters (Smile 2.6.x nine-arg overload)
   //      int ntrees = 150;
   //      int mtry = (int) Math.sqrt(featureNames.length);
   //      SplitRule rule = SplitRule.GINI;
   //      int maxDepth = 15;
   //      int maxNodes = trainX.length;  // ≥1
   //      int nodeSize = 50;
   //      double subsample = 0.7;

   //      // Fit:
   //      RandomForest rf = RandomForest.fit(
   //          formula, df,
   //          ntrees, mtry, rule,
   //          maxDepth, maxNodes, nodeSize,
   //          subsample
   //      );

   //    //   RandomForest rf = new RandomForest(X, y, 100); // or tune hyperparameters
   //      System.out.println("Training complete.");

   //      // Save model
   //      modelFile.getParentFile().mkdirs(); // make sure directory exists
   //      try (ObjectOutputStream out = new ObjectOutputStream(new FileOutputStream(modelFile))) {
   //          out.writeObject(rf);
   //          System.out.println("Model saved to " + modelFile.getPath());
   //      }
   //  }

   //  public static RandomForest loadModel(File modelFile) {
   //      try (ObjectInputStream in = new ObjectInputStream(new FileInputStream(modelFile))) {
   //          return (RandomForest) in.readObject();
   //      } catch (IOException | ClassNotFoundException e) {
   //          System.err.println("Failed to load model.");
   //          e.printStackTrace();
   //          return null;
   //      }
   //  }
   // }
