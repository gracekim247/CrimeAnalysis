package com.crimeAnalysis.model;

import com.crimeanalysis.CrimeDataset;
import org.junit.jupiter.api.Test;
import smile.classification.RandomForest;
import smile.data.DataFrame;
import smile.data.formula.Formula;
import smile.data.vector.IntVector;

import java.util.Random;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.assertTrue;

class RandomForestModelTest {

   @Test
   void testTrainTestSplitAccuracy() throws Exception {
      //Load and preprocess
      CrimeDataset ds = new CrimeDataset();
      ds.load("data/harrassmentAndAssaultData.csv");
      ds.imputeMissingValues();
      ds.labelData();

      //Extract arrays
      double[][] X = ds.getFeatureArray();
      int[] y = ds.getLabelArray();

      //Shuffle + split 80/20
      int n = X.length;
      int trainSize = (int)(n * 0.8);
      int[] idx = IntStream.range(0, n).toArray();
      Random rnd = new Random(42);
      for (int i = n - 1; i > 0; i--) {
         int j = rnd.nextInt(i + 1);
         int tmp = idx[i];
         idx[i] = idx[j];
         idx[j] = tmp;
      }

      double[][] xTrain = new double[trainSize][];
      int[] yTrain = new int[trainSize];
      double[][] xTest  = new double[n - trainSize][];
      int[] yTest  = new int[n - trainSize];
     
      for (int i = 0; i < trainSize; i++) {
         xTrain[i] = X[idx[i]];
         yTrain[i] = y[idx[i]];
      }
      for (int i = trainSize; i < n; i++) {
         xTest[i - trainSize] = X[idx[i]];
         yTest[i - trainSize] = y[idx[i]];
      }

      //Build DataFrames
      String[] featureNames = {
         "age", "sex", "race", "borough", "hour", "latitude", "longitude"
      };
      DataFrame trainDf = DataFrame.of(xTrain, featureNames)
         .merge(new DataFrame(new IntVector("label", yTrain)));
      DataFrame testDf  = DataFrame.of(xTest, featureNames)
         .merge(new DataFrame(new IntVector("label", yTest)));

      //Train
      RandomForest rf = RandomForest.fit(Formula.lhs("label"), trainDf);

      //Predict + compute accuracy
      int[] pred = new int[yTest.length];
      for (int i = 0; i < testDf.nrow(); i++) {
         pred[i] = rf.predict(testDf.get(i));
      }
      double accuracy = accuracy(yTest, pred) * 100;
      System.out.printf("Test split accuracy = %.2f%%%n", accuracy);

      //Assert it’s at least better than random (e.g. > 33%)
      assertTrue(accuracy > 33.0, "Accuracy should beat random guess");
   }

   private static double accuracy(int[] truth, int[] pred) {
      int correct = 0;
      for (int i = 0; i < truth.length; i++) {
         if (truth[i] == pred[i]) correct++;
      }
      return (double) correct / truth.length;
   }
}
