package com.crimeAnalysis;

import org.junit.jupiter.api.*;
import java.util.List;
import java.nio.file.*;
import static org.junit.jupiter.api.Assertions.*;

class CrimeDatasetTest {

   private static final String TEST_CSV = 
      "date,time,borough,lat,lng,age,race,sex\n" +
      "2020-01-01,13:45,QUEENS,40.7,-73.8,25-44,WHITE,M\n" +
      "2020-01-02,14:00,QUEENS,40.7,-73.8,UNKNOWN,UNKNOWN,UNKNOWN\n";

   @Test
   void loadAndImputeThenLabel() throws Exception {
      // write a small in-memory CSV to a temp file
      Path tmp = Files.createTempFile("test_crime", ".csv");
      Files.writeString(tmp, TEST_CSV);
        
      CrimeDataset ds = new CrimeDataset();
      ds.load(tmp.toString());
      ds.imputeMissingValues();
      ds.labelData();

      // After imputation, second record’s age/race/sex should no longer be "UNKNOWN"
      List<CrimeRecord> recs = ds.getRecords();
      assertEquals(2, recs.size());
      assertNotEquals("UNKNOWN", recs.get(1).vicAge);
      assertNotEquals("UNKNOWN", recs.get(1).vicRace);
      assertNotEquals("UNKNOWN", recs.get(1).vicSex);

      // Labels should be Low/Medium/High
      int[] labels = ds.getLabelArray();
      assertTrue(labels[0] >= 0 && labels[0] <= 2);
   }
}
