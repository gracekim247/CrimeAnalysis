package com.crimeAnalysis.model;

public class DecisionTreeNode {
    int featureIndex;
    double threshold;
    DecisionTreeNode left;
    DecisionTreeNode right;
    int label;        
    boolean isLeaf;

    //leaf node
    public DecisionTreeNode(int label) {
        this.label = label;
        this.isLeaf = true;
    }

    //internal node
    public DecisionTreeNode(int featureIndex, double threshold, DecisionTreeNode left, DecisionTreeNode right) {
        this.featureIndex = featureIndex;
        this.threshold = threshold;
        this.left = left;
        this.right = right;
        this.isLeaf = false;
    }

    //predict label for single feature
    public int predict(double[] x) {
        if (isLeaf) {
            return label;
        }
        if (x[featureIndex] <= threshold) {
            return left.predict(x);
        } else {
            return right.predict(x);
        }
    }
}