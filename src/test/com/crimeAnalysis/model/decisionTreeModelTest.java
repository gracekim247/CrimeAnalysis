package com.crimeAnalysis.tests;

import com.crimeAnalysis.model.DecisionTreeModel;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class DecisionTreeModelTest {
    static double[][] X;
    static int[] y;

    @BeforeAll
    static void loadData() throws Exception {
        String path = "src/test/resources/toyDataset.csv";
        X = CsvLoader.loadFeatures(path);
        y = CsvLoader.loadLabels(path);
    }

    @Test
    void testPerfectFitOnToyData() {
        // set maxDepth high enough to perfectly separate
        DecisionTreeModel dt = new DecisionTreeModel(10, 1);
        dt.train(X, y);

        int[] preds = dt.predict(X);
        assertArrayEquals(y, preds, "Decision tree should perfectly classify toy data");
    }
}
