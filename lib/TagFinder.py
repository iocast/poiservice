import os, sys

import urllib
import simplejson
from operator import itemgetter, attrgetter

from Server import Request
from lib.ontology import SkosXmlReader as skos

class TagFinder(Request):
    ''' '''
    skos            = None
    taginfoKeyValue = { #Get values used with a given key.
        'url' : '/db/keys/values',
        'param' : 'key'
    }
    taginfoValue    = { #Search all tag values for string.
        'url' : '/search/values',
        'param' : 'q'
    }
    taginfoKeyKey   = { #Find keys that are used together with a given key.
        'url' : '/db/keys/keys',
        'param' : 'key'
    }
    searchQuery     = ''
    searchLang      = ''
    preferredValue  = ''
    resultlist      = []
    error           = ''
    
    
    def handleRequest(self):
        ''' '''
        if self.params.has_key('q'):
            self.skos = skos.SkosXmlReader(os.path.dirname(os.path.abspath(__file__))+'/../resources/osm_skos.xml')
            self.skos.read()

            self.searchQuery = str(self.params['q']).decode('utf-8')
            self.searchLang = self.skos.getLanguageCode(self.searchQuery)
            
            preferredLabels = self.skos.getPreferredLabels(self.searchQuery)
            if len(preferredLabels) == 0:
                #check if value is a key
                url = self.getTagInfoURL() + self.taginfoKeyValue['url']
                url += '?' + self.taginfoKeyValue['param'] + '=' + str(self.params['q'])
                url += '&sortname=count_ways'
                url += '&sortorder=desc'
                url += '&rp=1&page=1'
                values = simplejson.load(urllib.urlopen(url))
                if values['total'] == 0:
                    self.resultlist.append({'count' : 'not valid', 'key' : str(self.params['q']), 'value' : ''})
                else:
                    self.resultlist.append({'count' : 'is key', 'key' : str(self.params['q']), 'value' : ''})
                
            
            # given preffered values, search for key value pair
            for label in preferredLabels:
                self.preferredValue = label
                
                url = self.getTagInfoURL() + self.taginfoValue['url']
                url += '?' + self.taginfoValue['param'] + '=' + label
                url += '&sortname=' + self.getSortName()
                url += '&sortorder=' + self.getSortOrder()
                url += '&rp=10&page=1'
                values = simplejson.load(urllib.urlopen(url))
                for value in values['data']:
                    self.resultlist.append({'count' : value['count_all'], 'key' : value['key'].encode('utf-8'), 'value' : value['value'].encode('utf-8')})
                    
            self.resultlist = sorted(self.resultlist, key=itemgetter('count'), reverse=True)
            
            self.searchQuery = str(self.params['q'])
            
    def getSortName(self):
        if self.params.has_key('sortname'):
            return self.params['sortname']
        return 'count_all'
    
    def getSortOrder(self):
        if self.params.has_key('sortorder'):
            return self.params['sortorder']
        return 'desc'
    
    def getFilter(self):
        if self.params.has_key('filter'):
            return self.params['filter']
        return 'all'

    def getJSON(self, callback):
        if len(self.resultlist) == 0:
            return 'Nothing found'
        
        output = callback + '({"total":"' + str(len(self.resultlist)) + '",'
        output += '"data":['
        
        for result in self.resultlist:
            output += '{"' + result['key'] + '":'
            try:
                int(result['value'])
            except ValueError, TypeError:
                output += '"' + result['value'] + '"'
            else:
                output += result['value']
            output += '},'
            
        output = output[:-1] + ']});'
        return output
    
    