package com.crimeAnalysis.model;

import com.crimeAnalysis.CrimeDataset;

import smile.data.DataFrame;
import smile.data.formula.Formula;
import smile.base.cart.SplitRule;
import smile.classification.RandomForest;
import smile.data.vector.IntVector;

public class RandomForestModel {
   public static void main(String[] args) throws Exception {
      CrimeDataset ds = new CrimeDataset();

      ds.load(args[0]);
      ds.imputeMissingValues();
      ds.labelData();

      // Extract features & labels
      double[][] x = ds.getFeatureArray();
      int[] y = ds.getLabelArray();

      // build DataFrame from features
      String[] featureNames = {"age", "sex", "race", "borough", "hour", "latitude", "longitude"};

      DataFrame df = DataFrame.of(x, featureNames)
            .merge(IntVector.of("label", y));


      Formula formula = Formula.lhs("label");

      // Hyperparameters for RF 
      int    ntrees    = 150;
      int    mtry      = (int)Math.sqrt(featureNames.length);
      SplitRule rule   = SplitRule.GINI;
      int    maxDepth  = 15;
      int    maxNodes  = x.length;
      int    nodeSize  = 50;
      double subsample = 0.7;

      // 9-arg overload train
      RandomForest rf = RandomForest.fit(
          formula,
          df,
          ntrees,
          mtry,
          rule,
          maxDepth,
          maxNodes,
          nodeSize,
          subsample
      );


      // Evaluate the model on the training data
      int[] predictions = new int[df.size()];
      for (int i = 0; i < df.size(); i++) {
          predictions[i] = rf.predict(df.get(i));
      }
      
      // Calculate accuracy
      int correct = 0;
      int[] actual = df.column("label").toIntArray();
      for (int i = 0; i < actual.length; i++) {
          if (predictions[i] == actual[i]) {
              correct++;
          }
      }
      double accuracy = (double) correct / actual.length;
      double error = 1.0 - accuracy;
      
      System.out.printf("RandomForest with %d trees, error rate = %.4f%n",
         rf.size(), error
      );
      
      System.out.printf("Training accuracy: %.4f%n", accuracy);
   }
}