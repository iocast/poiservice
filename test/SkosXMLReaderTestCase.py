'''
Created on May 15, 2011

@author: michel
'''
import unittest
from lib.tagfinder import SkosXmlReader as skos
import os

class SkosXMLReaderTestCase(unittest.TestCase):


    def setUp(self):
        self.skos = skos.SkosXmlReader(os.path.dirname(os.path.abspath(__file__))+'/../resources/osm_skos.xml')
        self.skos.read()
        pass


    def tearDown(self):
        pass


    def testLanguage(self):
        self.assertEqual('de', self.skos.getLanguageCode('Busbahnhof'))
        self.assertEqual('en', self.skos.getLanguageCode('bus_stop'))
        pass
    
    def testPreferredLabel(self):
        self.assertEqual(['bus_stop'], self.skos.getPreferredLabels('Bushaltestelle'))
        self.assertEqual(['castle'], self.skos.getPreferredLabels('defensive'))
        self.assertEqual(['castle'], self.skos.getPreferredLabels('castle'))
        pass
    
    def testBroaderLabel(self):
        self.assertEqual(['highway'], self.skos.getPreferredBroaderLabels('Bushaltestelle'))
        pass

    def testNarrowerLabel(self):
        self.assertEqual(['bus_stop', 'platform'], self.skos.getPreferredNarrowerLabels('highway'))
        pass

    def testRelatedLabel(self):
        self.assertEqual(['bus_station', 'platform'], self.skos.getPreferredRelatedLabels('Bushaltestelle'))
        pass

if __name__ == "__main__":
    #import sys;sys.argv = ['', 'Test.testName']
    unittest.main()