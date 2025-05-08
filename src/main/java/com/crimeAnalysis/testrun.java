package com.crimeAnalysis;

import java.util.Arrays;

import com.crimeAnalysis.model.DecisionTreeModel;

import smile.base.cart.SplitRule;
import smile.classification.RandomForest;
import smile.data.DataFrame;
import smile.data.formula.Formula;
import smile.data.vector.IntVector;

public class testrun{
    public static void main(String[] args) throws Exception {
        if (args.length != 1) {
            System.err.println("Usage: java com.crimeAnalysis.ModelSmokeTest <csv-path>");
            System.exit(1);
        }

        // 1) Load & preprocess
        CrimeDataset ds = new CrimeDataset();
        ds.load(args[0]);
        ds.imputeMissingValues();
        ds.labelData();

        double[][] X = ds.getFeatureArray();
        int[] y       = ds.getLabelArray();
        int n         = X.length;

        // 2) Split 80/20 for testing
        int trainN = (int)(n * 0.8);
        double[][] trainX = Arrays.copyOfRange(X, 0, trainN);
        int[] trainY = Arrays.copyOfRange(y, 0, trainN);
        double[][] testX  = Arrays.copyOfRange(X, trainN, n);
        int[] testY  = Arrays.copyOfRange(y, trainN, n);

        // 3) Train & evaluate DecisionTreeModel
        DecisionTreeModel dt = new DecisionTreeModel(5, 2);
        dt.train(trainX, trainY);
        int[] dtPreds = dt.predict(testX);
        int correctDt = 0;
        for (int i = 0; i < dtPreds.length; i++) {
            if (dtPreds[i] == testY[i]) correctDt++;
        }
        System.out.printf(
            "DecisionTree → %d/%d correct (%.1f%%)%n",
            correctDt, testX.length,
            100.0 * correctDt / testX.length
        );

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
      
         //
         DataFrame testDf = DataFrame.of(testX, featureNames);

         // 2) row-by-row predict(Tuple)
         int correctRf = 0;
         for (int i = 0; i < testDf.nrows(); i++) {
            int pred = rf.predict(testDf.get(i));
            if (pred == testY[i]) correctRf++;
         }
         System.out.printf(
               "RandomForest → %d/%d correct (%.1f%%)%n",
               correctRf, testX.length,
               100.0 * correctRf / testX.length
         );


         // Build the user's feature vector
         CrimeRecord user = new CrimeRecord();
         user.vicAge   = "<18>";               
         user.vicRace  = "BLACK";
         user.vicSex   = "M";
         user.borough  = "MANHATTAN";
         user.time     = java.time.LocalTime.now()
                           .format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss"));
         // use the same coords from the row
         user.latitude  = 40.754081;  
         user.longitude = -73.993941;
         
         double[] userFeat = user.toFeatureVector();

         // 1) DecisionTree prediction
         // int dtLabel = dt.predict(new double[][] { userFeat })[0];

         // 2) RandomForest prediction (using a Tuple)
         DataFrame userDf = DataFrame.of(new double[][] { userFeat }, featureNames);
         int rfLabel = rf.predict(userDf.get(0));

         String[] labelNames = { "Low", "Medium", "High" };
         System.out.println("\n== User risk predictions ==");
         // System.out.println("DecisionTree says: " + labelNames[dtLabel]);
         System.out.println("RandomForest says: " + labelNames[rfLabel]);
      }
}