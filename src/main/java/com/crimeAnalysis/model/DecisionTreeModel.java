package com.crimeAnalysis.model;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DecisionTreeModel {
    private DecisionTreeNode root;
    private int maxDepth;
    private int minSamplesSplit;

    public DecisionTreeModel(int maxDepth, int minSamplesSplit) {
        this.maxDepth = maxDepth;
        this.minSamplesSplit = minSamplesSplit;
    }

    //Train tree with data
    public void train(double[][] X, int[] y) {
        this.root = buildTree(X, y, 0);
    }

    //Build tree recursively 
    private DecisionTreeNode buildTree(double[][] X, int[] y, int depth) {
        int nSamples = y.length;
        if (depth >= maxDepth || nSamples < minSamplesSplit || isPure(y)) {
            return new DecisionTreeNode(majorityLabel(y));
        }
        // Find best split
        Split bestSplit = findBestSplit(X, y);
        if (bestSplit == null) {
            return new DecisionTreeNode(majorityLabel(y));
        }
        // Partition data
        Partition part = partition(X, y, bestSplit);
        DecisionTreeNode left = buildTree(part.Xleft, part.yLeft, depth + 1);
        DecisionTreeNode right = buildTree(part.Xright, part.yRight, depth + 1);
        return new DecisionTreeNode(bestSplit.featureIndex, bestSplit.threshold, left, right);
    }

    //Predict labels of a set of samples
    public int[] predict(double[][] X) {
        int[] preds = new int[X.length];
        for (int i = 0; i < X.length; i++) {
            preds[i] = root.predict(X[i]);
        }
        return preds;
    }

    // Helper to check if all labels are the same
    private boolean isPure(int[] y) {
        int first = y[0];
        for (int label : y) {
            if (label != first) return false;
        }
        return true;
    }

    // Compute the majority label
    private int majorityLabel(int[] y) {
        Map<Integer, Integer> counts = new HashMap<>();
        for (int label : y) {
            counts.merge(label, 1, Integer::sum);
        }
        return Collections.max(counts.entrySet(), Map.Entry.comparingByValue()).getKey();
    }

    // Structure to hold a candidate split
    private static class Split {
        int featureIndex;
        double threshold;
        double gini;
    }

    // Structure to hold partitioned data
    private static class Partition {
        double[][] Xleft;
        int[] yLeft;
        double[][] Xright;
        int[] yRight;
    }

    // Find the best split by iterating features and thresholds
    private Split findBestSplit(double[][] X, int[] y) {
        int nFeatures = X[0].length;
        Split best = null;
        for (int f = 0; f < nFeatures; f++) {
            final int featureIndex = f;
            // Extract all values of this feature
            double[] values = Arrays.stream(X)
                                    .mapToDouble(row -> row[featureIndex])
                                    .distinct()
                                    .sorted()
                                    .toArray();
            for (double threshold : values) {
                Partition p = partition(X, y, featureIndex, threshold);
                if (p == null) continue;
                double gini = weightedGini(p.yLeft, p.yRight);
                if (best == null || gini < best.gini) {
                    best = new Split();
                    best.featureIndex = featureIndex;
                    best.threshold = threshold;
                    best.gini = gini;
                }
            }
        }
        return best;
    }

    // Partition data given a split
    private Partition partition(double[][] X, int[] y, Split split) {
        return partition(X, y, split.featureIndex, split.threshold);
    }
    private Partition partition(double[][] X, int[] y, int feature, double threshold) {
        List<double[]> leftX = new ArrayList<>();
        List<Integer> leftY = new ArrayList<>();
        List<double[]> rightX = new ArrayList<>();
        List<Integer> rightY = new ArrayList<>();
        for (int i = 0; i < X.length; i++) {
            if (X[i][feature] <= threshold) {
                leftX.add(X[i]); leftY.add(y[i]);
            } else {
                rightX.add(X[i]); rightY.add(y[i]);
            }
        }
        if (leftY.isEmpty() || rightY.isEmpty()) return null;
        Partition p = new Partition();
        p.Xleft = leftX.toArray(new double[0][]);
        p.yLeft = leftY.stream().mapToInt(i -> i).toArray();
        p.Xright = rightX.toArray(new double[0][]);
        p.yRight = rightY.stream().mapToInt(i -> i).toArray();
        return p;
    }

    // Compute weighted Gini impurity of a split
    private double weightedGini(int[] leftY, int[] rightY) {
        int total = leftY.length + rightY.length;
        return (leftY.length * gini(leftY) + rightY.length * gini(rightY)) / (double) total;
    }

    // Gini impurity for a set of labels
    private double gini(int[] y) {
        Map<Integer, Integer> counts = new HashMap<>();
        for (int label : y) counts.merge(label, 1, Integer::sum);
        double impurity = 1.0;
        for (int count : counts.values()) {
            double p = count / (double) y.length;
            impurity -= p * p;
        }
        return impurity;
    }
}