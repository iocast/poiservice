from Server import Request
import httplib, urllib

class Download(Request):
    
    headers = {}
    
    def handleRequest(self):
        
        if self.params.has_key('action') and self.params['action'] == 'download':
            
            data = {
                'SERVICE' : self.params['format'],
                'VERSION' : '1.0.0',
                'REQUEST' : 'GetFeature',
                'TYPENAME' : self.featureserver['layer'],
            }
            if self.params.has_key('filter') and len(self.params['filter']) > 0:
                data['FILTER'] = self.params['filter']
            if self.params.has_key('bbox') and len(self.params['bbox']) > 0:
                data['BBOX'] = self.params['bbox']
            
            params = urllib.urlencode(data)
            connection = httplib.HTTPConnection(self.featureserver['host'], self.featureserver['port'])
            headers = {"Connection": "keep-alive",
                       "Accept": "*/*"}
            connection.request(method='GET', url=self.featureserver['subdir'] + self.featureserver['base'] + '?' + params, headers=headers)
            response = connection.getresponse()
            resp = response.read()
            self.content = str(resp)
            #self.content_length = response.getheader('Content-Length')
            for header in response.msg.headers:
                item = header.split(': ')
                if len(item) > 1:
                    self.headers[item[0]] = item[1]
            connection.close()
            