'''
Created on May 15, 2011

@author: michel
'''

from lxml import etree

class SkosXmlReader(object):
    
    namespaces = {
        'base' : 'http://openstreetmap.org',
        'dc' : 'http://purl.org/dc/elements/1.1/',
        'core' : 'http://www.w3.org/2004/02/skos/core#',
        'xml' : 'http://www.w3.org/2004/02/skos/core',
        'rdfs' : 'http://www.w3.org/2000/01/rdf-schema#',
        'owl2xml' : 'http://www.w3.org/2006/12/owl2-xml#',
        'owl' : 'http://www.w3.org/2002/07/owl#',
        'xsd' : 'http://www.w3.org/2001/XMLSchema#',
        'rdf' : 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        'skos' : 'http://www.w3.org/2004/02/skos/core#',
        'openstreetmap' : 'http://openstreetmap.org#'
    }
    
    def __init__(self, file):
        self.file = file
    
    def read(self):
        self.xml = etree.parse(self.file)
        self.root = self.xml.getroot()
    
    def isConcept(self, term):
        ''' '''
    
    def isPreferredLabel(self, term):
        preferred = self.getPreferredLabels(term)
        if len(preferred) > 0:
            return True
        return False
        
    def getLanguageCode(self, term):
        languages = self.root.xpath('//skos:Concept/*[node()="'+term+'"]/@xml:lang', namespaces=self.namespaces)
        if len(languages) > 0:
            return str(languages[0])
        return ''
    
    def getPreferredLabels(self, term):
        return self.getArray(self.root.xpath('//skos:Concept[*="'+term+'"]/skos:prefLabel', namespaces=self.namespaces))
    
    def getPreferredBroaderLabels(self, term):
        nodeList = []
        references = self.root.xpath('//skos:Concept[*="'+term+'"]/skos:broader/@rdf:resource', namespaces=self.namespaces)
        for node in references:
            nodeList.extend(self.getPrefferedLabelsOfConcept(str(node)))
        return nodeList
    
    def getPreferredNarrowerLabels(self, term):
        nodeList = []
        references = self.root.xpath('//skos:Concept[*="'+term+'"]/skos:narrower/@rdf:resource', namespaces=self.namespaces)
        for node in references:
            nodeList.extend(self.getPrefferedLabelsOfConcept(str(node)))
        return nodeList
    
    def getPreferredRelatedLabels(self, term):
        nodeList = []
        references = self.root.xpath('//skos:Concept[*="'+term+'"]/skos:related/@rdf:resource', namespaces=self.namespaces)
        for node in references:
            nodeList.extend(self.getPrefferedLabelsOfConcept(str(node)))
        return nodeList
    
    def getPrefferedLabelsOfConcept(self, about):
        return self.getArray(self.root.xpath('//skos:Concept[@rdf:about="'+about+'"]/skos:prefLabel', namespaces=self.namespaces))
    
    def getArray(self, nodeList):
        alist = []
        for node in nodeList:
            alist.append(node.text)
        return alist
    