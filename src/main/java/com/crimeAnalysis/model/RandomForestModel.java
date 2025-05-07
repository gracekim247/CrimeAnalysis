package com.crimeAnalysis.model;

import com.crimeAnalysis.CrimeDataset;
// import com.crimeAnalysis.CrimeRecord;

// import java.io.*;
// import java.net.URISyntaxException;
// import java.util.*;
// import java.util.stream.IntStream;

import smile.data.DataFrame;
import smile.data.formula.Formula;
//import smile.io.Read;
import smile.classification.RandomForest;
import smile.data.vector.IntVector;

public class RandomForestModel {
   public static void main(String[] args) throws Exception {
      CrimeDataset ds = new CrimeDataset();

      ds.load("data/harrassmentAndAssaultData.csv");
      ds.imputeMissingValues();
      ds.labelData();

      // Extract features & labels
      double[][] x = ds.getFeatureArray();
      int[] y = ds.getLabelArray();

      // // Create a random train/test split (80/20)
      // int n = x.length;
      // int trainSize = (int) (n * 0.8);
      // int[] idx = IntStream.range(0, n).toArray();

      // // shuffle indices
      // Random rnd = new Random(42);  // fixed seed for reproducibility
      // for (int i = n - 1; i > 0; i--) {
      //    int j = rnd.nextInt(i + 1);
      //    int tmp = idx[i];
      //    idx[i] = idx[j];
      //    idx[j] = tmp;
      // }

      // // allocate train
      // double[][] xtrain = new double[trainSize][];
      // int[] ytrain = new int[trainSize];

      // //allocate test
      // double[][] xtest  = new double[n - trainSize][];
      // int[] ytest  = new int[n - trainSize];

      // // fill train
      // for (int i = 0; i < trainSize; i++) {
      //    xtrain[i] = x[idx[i]];
      //    ytrain[i] = y[idx[i]];
      // }

      // // fill test
      // for (int i = trainSize; i < n; i++) {
      //    xtest[i - trainSize] = x[idx[i]];
      //    ytest[i - trainSize] = y[idx[i]];
      // }

      // build DataFrame from features
      String[] featureNames = {
         "age", "sex", "race", "borough", "hour", "latitude", "longitude"
      };

      DataFrame df = DataFrame
            .of(x, featureNames)
            .merge(new DataFrame(new IntVector("label", y)));


      // DataFrame trainDf = DataFrame.of(xtrain, featureNames);
      // // wrap your label vector in its own DataFrame
      // DataFrame trainLabelDf = new DataFrame(new IntVector("label", ytrain));
      // // merge horizontally
      // trainDf = trainDf.merge(trainLabelDf);

      // DataFrame testDf = DataFrame.of(xtest, featureNames);
      // DataFrame testLabelDf = new DataFrame(new IntVector("label", ytrain));
      // testDf = testDf.merge(testLabelDf);

      // train
      RandomForest rf = RandomForest.fit(Formula.lhs("label"), df);

      // Predict on test set
      // int[] pred = new int[ytest.length];
      // for (int i = 0; i < testDf.nrow(); i++) {
      //    pred[i] = rf.predict(testDf.get(i));
      // }

      // Print accuracy
      System.out.printf("RandomForest with %d trees, OOB error = %.4f%n",
         rf.size()
      );
     //System.out.printf("Test accuracy: %.2f%%%n", 100*accuracy(ytest, pred));
  }

   // Simple accuracy helper
   // private static double accuracy(int[] truth, int[] pred) {
   //    int correct = 0;
   //    for (int i = 0; i < truth.length; i++) {
   //       if (truth[i] == pred[i]) correct++;
   //    }
   //    return (double) correct / truth.length;
   // }
}