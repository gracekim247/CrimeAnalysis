package com.crimeAnalysis.model;

/**
 * A node in the decision tree. Can be either an internal decision node or a leaf node.
 */
public class DecisionTreeNode {
    int featureIndex;
    double threshold;
    DecisionTreeNode left;
    DecisionTreeNode right;
    int label;        // Class label for leaf nodes
    boolean isLeaf;

    /**
     * Constructor for leaf node
     */
    public DecisionTreeNode(int label) {
        this.label = label;
        this.isLeaf = true;
    }

    /**
     * Constructor for internal decision node
     */
    public DecisionTreeNode(int featureIndex, double threshold, DecisionTreeNode left, DecisionTreeNode right) {
        this.featureIndex = featureIndex;
        this.threshold = threshold;
        this.left = left;
        this.right = right;
        this.isLeaf = false;
    }

    /**
     * Predict the label for a single feature vector
     */
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