'''
Created on May 16, 2011

@author: michel
'''
from lib.FilterEncodingWizard import FilterEncodingWizard
from Server import Request

class QueryBuilder(Request):
    
    wizard = None
    
    def handleRequest(self):
        self.wizard = FilterEncodingWizard()
    