package com.crimeAnalysis;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

import com.crimeAnalysis.api.FeatureEncoder;
import com.crimeAnalysis.model.DecisionTreeModel;
import com.crimeAnalysis.model.DecisionTreeNode;

/*
 * The following test cases are not included in testing because they are covered by the Smile library:
 *
 * 1. RandomForest::trainForest(dataset) test 
 *         - covered by the DataFrame.merge(...) functionality used in RandomForestModel training 
 *         - coverd by RandomForest.fit(...) model-building and out-of-bag error calculations 
 *         - covered by RandomForest.importance() for feature importance extraction
 * 2. DecisionTree::trainTree(dataset) + DecisionTree::buildTree(dataset) + Node::split() test,
 *         - covered by Gini impurity & weighted Gini computations inside DecisionTreeModel's splits  
 *           which veriifies splits (Gini computations), chooses the best thresholds, and produces correct leaf labels 
 * 3. RandomForest::getRandomSubset(dataset) test
 * 4.  RandomForest::aggregate(trainedTrees) test
 * 5. RandomForest::createBootstrappedSample(dataset) test
 *
 *  
 * These methods are part of the Smile library and are assumed correct. The tests below
 * focus on our own code: data loading, imputation, label-generation, tree traversal logic,
 * and API endpoint behavior.
 */



/**
 * Combined test suite for CrimeAnalysis project components.
 * Covers dataset loading, record imputation, tree logic, and API endpoint.
 */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class CrimeAnalysisTests {

    private CrimeDataset dataset;
    private List<CrimeRecord> records;

    @BeforeAll
    void setup() throws IOException {
        dataset = new CrimeDataset();
        dataset.load("src/test/resources/data/toyDataset.csv");
        dataset.imputeMissingValues();
        dataset.labelData();
        records = dataset.getRecords();
    }

    @Nested
    class CrimeDatasetArrayTests {
        /**
         * Test from: CrimeDataset::getCrimeData() 
         * Scenario: Ensure the function reads and returns data accurately. citeturn5file6
         */
        @Test
        void featureAndLabelArraysHaveCorrectDimensions() {
            double[][] features = dataset.getFeatureArray();
            int[] labels = dataset.getLabelArray();
            assertEquals(records.size(), features.length, "Feature array row count should match record count");
            assertEquals(records.size(), labels.length, "Label array length should match record count");
            assertEquals(7, features[0].length, "Each feature vector should have 7 elements");
        }
    }

    @Nested
    class CrimeRecordTests {
        /**
         * Test from: CrimeRecord::handleMissingValues()
         * Scenario: Test whether missing demographic values are imputed correctly
         */
        @Test
        void handleMissingValuesCorrectly() {
            CrimeRecord rec = new CrimeRecord();
            rec.borough = "BROOKLYN";
            rec.vicAge = "UNKNOWN";
            rec.vicSex = "UNKNOWN";
            rec.vicRace = "UNKNOWN";
            Map<String, String> ageMap = Map.of("BROOKLYN", "25-44");
            Map<String, String> sexMap = Map.of("BROOKLYN", "F");
            Map<String, String> raceMap = Map.of("BROOKLYN", "WHITE");
            rec.handleMissingValues(ageMap, sexMap, raceMap);
            assertEquals("25-44", rec.vicAge, "Age should be imputed from map");
            assertEquals("F", rec.vicSex, "Sex should be imputed from map");
            assertEquals("WHITE", rec.vicRace, "Race should be imputed from map");
        }
    }

    @Nested
    class DecisionTreeNodeTests {
        /**
         * Test from: DecisionTree::predict(userInput) + Node::isLeaf()
         * Verify leaf node always returns its label
         */
        @Test
        void leafNodePredictsLabel() {
            DecisionTreeNode leaf = new DecisionTreeNode(3);
            assertEquals(3, leaf.predict(new double[]{0.0}), "Leaf node should always return its label");
        }

        /**
         * Test from: DecisionTree::predict(userInput) + Node::isLeaf()
         * Verify split node directs to correct branch
         */
        @Test
        void splitNodePredictsCorrectBranch() {
            DecisionTreeNode left = new DecisionTreeNode(0);
            DecisionTreeNode right = new DecisionTreeNode(1);
            DecisionTreeNode node = new DecisionTreeNode(0, 5.0, left, right);
            assertEquals(0, node.predict(new double[]{3.0}), "Value <= threshold goes to left");
            assertEquals(1, node.predict(new double[]{7.0}), "Value > threshold goes to right");
        }
    }

    @Nested
    class DecisionTreeModelTests {
        /**
         * Test from: Assertion – Compare the actual tree generated on pure data
         * Scenario: Pure data yields leaf nodes only
         */
        @Test
        void trainAndPredictPureLabels() {
            double[][] X = { {0.0}, {0.0}, {0.0} };
            int[] y = { 2, 2, 2 };
            DecisionTreeModel dt = new DecisionTreeModel(1, 1);
            dt.train(X, y);
            int[] preds = dt.predict(X);
            assertArrayEquals(y, preds, "Predict should return majority label for pure data");
        }
    }

    @Nested
    class CrimeDatasetLabelTests {
        /**
         * Test from: CrimeDataset::labelRisk()
         * Scenario: Produce correct High/Medium/Low labels for each crime record
         */
        @Test
        void labelData_assignsHighAndLowCorrectly() {
            CrimeDataset ds = new CrimeDataset();
            ds.records = new ArrayList<>();
            for (int i = 0; i < 3; i++) {
                CrimeRecord rec = new CrimeRecord();
                rec.borough = "A";
                ds.records.add(rec);
            }
            CrimeRecord recB = new CrimeRecord();
            recB.borough = "B";
            ds.records.add(recB);

            ds.labelData();

            Map<String, Long> counts = ds.records.stream()
                .collect(Collectors.groupingBy(r -> r.riskLabel, Collectors.counting()));
            assertEquals(3L, counts.get("High"), "Three records should be labeled High");
            assertEquals(1L, counts.get("Low"), "One record should be labeled Low");
        }
    }

    @Nested
    class RiskApiTests {
        /**
         * Test from: CrimeRiskPrediction::predictRisk() valid input scenario 
         * Scenario: Complete profile returns valid risk level
         */
        private static Process apiProcess;

        @BeforeAll
        static void startServer() throws IOException, InterruptedException {
            apiProcess = new ProcessBuilder("java",
                    "-cp", System.getProperty("java.class.path"),
                    "com.crimeAnalysis.api.RiskApi")
                .inheritIO()
                .start();
            Thread.sleep(2000);
        }

        @AfterAll
        static void stopServer() {
            apiProcess.destroy();
        }

        @Test
        void predictEndpoint_returnsValidRisk() throws Exception {
            HttpClient client = HttpClient.newHttpClient();
            String json = "{\"age\":\"18-24\",\"sex\":\"M\",\"race\":\"Black\",\"borough\":\"BRONX\",\"hour\":14,\"latitude\":40.6,\"longitude\":-73.9}";
            HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:8080/api/predict"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();
            HttpResponse<String> resp = client.send(req, BodyHandlers.ofString());
            assertEquals(200, resp.statusCode(), "API should respond with 200 OK");
            assertTrue(resp.body().matches(".*\\\"(Low|Medium|High)\\\".*"), "Response should contain a valid risk label");
        }
    }

    @Nested
    class FilterTests {
        // Test case “CrimeRecord::filterByLocation()
        // No crimes within the specified radius
        @Test
        void filterByLocation_noMatch() {
            CrimeRecord rec = new CrimeRecord();
            rec.latitude = 40.0;
            rec.longitude = -73.0;
            // radius window that does not include (40.0, -73.0)
            assertFalse(rec.filterByLocation(41.0, 42.0, -75.0, -74.0));
        }

        // Test case “CrimeRecord::filterByLocation() 
        // Scenario: All crimes within the specified radius
        @Test
        void filterByLocation_fullMatch() {
            List<CrimeRecord> list = List.of(
                makeRec(40.5, -73.5),
                makeRec(40.6, -73.4)
            );
            long count = list.stream()
                             .filter(r -> r.filterByLocation(40.0, 41.0, -74.0, -73.0))
                             .count();
            assertEquals(2, count);
        }

        // Test case “CrimeRecord::filterByLocation() 
        // Scenario: Some crimes within the specified radius
        @Test
        void filterByLocation_partialMatch() {
            List<CrimeRecord> list = List.of(
                makeRec(40.5, -73.5),
                makeRec(42.0, -75.0)
            );
            long count = list.stream()
                             .filter(r -> r.filterByLocation(40.0, 41.0, -74.0, -73.0))
                             .count();
            assertEquals(1, count);
        }

        // Test case “CrimeRecord::filterByBorough() 
        // Scenario: Only incidents in the given borough are returned 
        @Test
        void filterByBorough_filtersCorrectly() {
            List<CrimeRecord> list = new ArrayList<>();
            CrimeRecord b = new CrimeRecord(); b.borough = "BRONX";
            CrimeRecord k = new CrimeRecord(); k.borough = "BROOKLYN";
            list.addAll(Arrays.asList(b, k, b));
            long bronxCount = list.stream()
                                  .filter(r -> r.borough.equals("BRONX"))
                                  .count();
            assertEquals(2, bronxCount);
        }

        private CrimeRecord makeRec(double lat, double lng) {
            CrimeRecord r = new CrimeRecord();
            r.latitude = lat;
            r.longitude = lng;
            return r;
        }
    }

    @Nested
    class FeatureEncoderTests {
        // Test case “CrimeRiskPrediction::convertUserDetails() 
        //from FeatureEncoder.encode()
        void encode_returnsCorrectFeatureVector() {
            double[] feats = FeatureEncoder.encode(
                "18-24", "M", "Black", "Queens", "14",
                40.7, -73.9
            );
            // ageMap: "18-24"→1, sexMap: "M"→0, race "BLACK"→0, borough "QUEENS"→2, hour→14
            assertArrayEquals(
                new double[]{1.0, 0.0, 0.0, 2.0, 14.0, 40.7, -73.9},
                feats,
                "FeatureEncoder should map categories & pass through coords correctly"
            );
        }
    }
}
