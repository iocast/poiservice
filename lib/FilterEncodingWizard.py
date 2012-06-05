'''
Created on May 16, 2011

@author: michel
'''
import json

class FilterEncodingWizard(object):
    
    comparision = [{
             'value' : 'PropertyIsEqualTo',
             'display' : '=',
             'xml' : '<PropertyIsEqualTo><PropertyName>${value}</PropertyName><Literal>${literal}</Literal></PropertyIsEqualTo>'},
            {'value' : 'PropertyIsNotEqualTo',
             'display' : '!=',
             'xml' : '<PropertyIsNotEqualTo><PropertyName>${value}</PropertyName><Literal>${literal}</Literal></PropertyIsNotEqualTo>'},
            {'value' : 'PropertyIsLessThan',
             'display' : '<',
             'xml' : '<PropertyIsLessThan><PropertyName>${value}</PropertyName><Literal>${literal}</Literal></PropertyIsLessThan>'},
            {'value' : 'PropertyIsGreaterThan',
             'display' : '>',
             'xml' : '<PropertyIsGreaterThan><PropertyName>${value}</PropertyName><Literal>${literal}</Literal></PropertyIsGreaterThan>'},
            {'value' : 'PropertyIsLessThanOrEqualTo',
             'display' : '<=',
             'xml' : '<PropertyIsLessThanOrEqualTo><PropertyName>${value}</PropertyName><Literal>${literal}</Literal></PropertyIsLessThanOrEqualTo>'},
            {'value' : 'PropertyIsGreaterThanOrEqualTo',
             'display' : '>=',
             'xml' : '<PropertyIsGreaterThanOrEqualTo><PropertyName>${value}</PropertyName><Literal>${literal}</Literal></PropertyIsGreaterThanOrEqualTo>'}
            #{'value' : 'PropertyIsLike',
            # 'display' : 'Like',
            # 'xml' : ''},
            #{'value' : 'PropertyIsBetween',
            # 'display' : 'Between',
            # 'xml' : ''},
            #{'value' : 'PropertyIsNull',
            # 'display' : 'Nul',
            # 'xml' : ''}
            ]
    
    logical = [
            {'value' : 'Or',
             'display' : 'or',
             'xml' : '<Or>${statement}</Or>'},
            {
             'value' : 'And',
             'display' : 'and',
             'xml' : '<And>${statement}</And>'}
            ]

    
    def comparisonToJson(self):
        return json.dumps(self.comparision)
    def comparisonToHTML(self):
        html = '<select onChange="javascript:queryBuilder.operatorChanged(this);">'
        for value in self.comparision:
            html += '<option value="' + value['value'] + '">' + value['display'] + '</option>'
        html += '</select>'
        return html
    
    def logicalToJson(self):
        return json.dumps(self.logical)
    def logicalToHTML(self):
        html = '<select>'
        for value in self.logical:
            html += '<option value="' + value['value'] + '">' + value['display'] + '</option>'
        html += '</select>'
        return html;
            