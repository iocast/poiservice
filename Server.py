import sys, os, time, traceback
import cgi as cgimod

from Cheetah.Template import Template
import urllib2
import ConfigParser
from urllib2 import URLError

class Server (object):
    
    def __init__(self, poiserver = {}, featurefilter = {}, featureserver = {}, taginfo = {}):
        self.poiserver = poiserver
        self.featurefilter = featurefilter
        self.featureserver = featureserver
        self.taginfo = taginfo
        
    def dispatchRequest (self, request):
        request.featurefilter = self.featurefilter
        request.featureserver = self.featureserver
        request.taginfo = self.taginfo
        request.poiserver = self.poiserver
        
        #sys.path.append("/home/michel/.eclipse/org.eclipse.platform_3.5.0_155965261/plugins/org.python.pydev.debug_2.2.2.2011082312/pysrc/")
        #import pydevd; pydevd.settrace('localhost', port=5678, stdoutToServer=True, stderrToServer=True)
        
        
        if request.params.has_key('lat') == False:
            request.params['lat'] = str(self.poiserver['lat'])
        if request.params.has_key('lon') == False:
            request.params['lon'] = str(self.poiserver['lon'])
        if request.params.has_key('zoom') == False:
            request.params['zoom'] =  self.poiserver['zoom']
        
        content = ""
        
        # home screen
        from lib.FeatureFilter import FeatureFilter
        featurefilter = FeatureFilter()

        featurefilter.__dict__.update(request.__dict__)
        featurefilter.handleRequest()
        content = Template(file='templates/featurefilter.tmpl', searchList = [featurefilter])
        
        # check if eOSMDBOne is online
        try:
            request.attr['osm_data_date'] = urllib2.urlopen('http://labs.geometa.info/postgisterminal/about-db-query.php').readline()[11:]
        except URLError:
            request.attr['osm_data_date'] = "offline"
        
        
        if request.params.has_key('module'):
            
            request.modules = request.params['module'].split('/')
            if request.modules[0] == "download":
                from lib.Download import Download
                download = Download()
    
                download.__dict__.update(request.__dict__)
                download.handleRequest()
    
            
                if download.params.has_key('action') and download.params['action'] == 'download':
                    if download.params['format'].lower() == 'shp':
                        extension = 'zip'
                    else:
                        extension = download.params['format'].lower()
                    #headers = download.headers
                    headers = {}
                    headers['Content-Disposition'] = 'attachment; filename=poidownload.' + extension
                    headers['Content-Transfer-Encoding'] = 'binary'
                    return Response(data=download.content, content_type='application/octet-stream;', headers=headers)
                
                content = Template(file='templates/download.tmpl', searchList = [download])

            
            elif request.modules[0] == "tagfinder":
                from lib.TagFinder import TagFinder
                tagFinder = TagFinder()

                #casting
                tagFinder.__dict__.update(request.__dict__)
                tagFinder.handleRequest()
                
                if len(request.modules) > 1 and request.modules[1] == 'api':
                    return Response(data=str(tagFinder.getJSON(request.params['callback'])).decode('utf-8'), content_type="application/json; charset=utf-8")
                
                content = Template(file='templates/tagfinder.tmpl', searchList = [tagFinder])
                
                
            elif request.modules[0] == 'querybuilder':
                from lib.QueryBuilder import QueryBuilder
                qBuilder = QueryBuilder()
                
                #casting
                qBuilder.__dict__.update(request.__dict__)
                qBuilder.handleRequest()
                
                content = Template(file='templates/querybuilder.tmpl', searchList = [qBuilder])
            
            elif request.modules[0] == 'services':
                content = Template(file='templates/services.tmpl', searchList = [featurefilter])
        
                
        output = Template(file="templates/index.tmpl", searchList = [{'content':content}, request])
        response = Response(data=str(output).decode("utf-8"), content_type="text/html; charset=utf-8")
        return response
    
    def _load (cls, file):
        config = ConfigParser.ConfigParser()
        config.read(file)
        
        poiserver = {}
        if config.has_section('POIServer'):
            for key in config.options('POIServer'):
                poiserver[key] = config.get('POIServer', key)
        
        featurefilter = {}
        if config.has_section('FeatureFilter'):
            for key in config.options('FeatureFilter'):
                featurefilter[key] = config.get('FeatureFilter', key)
        
        featureserver = {}
        if config.has_section('FeatureServer'):
            for key in config.options('FeatureServer'):
                featureserver[key] = config.get('FeatureServer', key)

        taginfo = {}
        if config.has_section('TagInfo'):
            for key in config.options('TagInfo'):
                taginfo[key] = config.get('TagInfo', key)
        
        return cls(poiserver, featurefilter, featureserver, taginfo)
    load = classmethod(_load)


class Response(object): 
    status_code = 200
    extra_headers = None
    content_type = "text/html; charset=utf-8"
    data = None
    def __init__(self, data=None, content_type=None, headers=None, status_code=None):
        if data:
            self.data = data
        if content_type:
            self.content_type = content_type
        if headers:
            self.extra_headers = headers
        if status_code:
            self.status_code = status_code
    

class Request(object):
    def __init__(self):
        self.accepts    = ''
        self.method     = 'GET'
        self.params     = {}
        self.modules    = {}
        self.path       = ''
        self.host       = ''
        self.script     = 'index.cgi'
        self.featurefilter = {}
        self.featureserver = {}
        self.taginfo       = {}
        self.poiserver     = {}
        self.attr          = {}
    
    def handleRequest(self): pass
    
    def getFeatureFilterURL(self):
        return self.featurefilter['protocol'] + '://' + self.featurefilter['host'] + ':' + self.featurefilter['port'] + self.featurefilter['subdir'] + self.featurefilter['base']
    
    def getFeatureFilterBaseURL(self):
        return self.featurefilter['protocol'] + '://' + self.featurefilter['host'] + ':' + self.featurefilter['port'] + self.featurefilter['subdir']
    
    def getFeatureServerURL(self):
        return self.featureserver['protocol'] + '://' + self.featureserver['host'] + ':' + self.featureserver['port'] + self.featureserver['subdir'] + self.featureserver['base']
    
    def getFeatureServerWorkspaceURL(self):
        return self.featureserver['protocol'] + '://' + self.featureserver['host'] + ':' + self.featureserver['port'] + self.featureserver['subdir'] + self.featureserver['workspace']

    def getTagInfoURL(self):
        return self.taginfo['protocol'] + '://' + self.taginfo['host'] + ':' + self.taginfo['port'] + self.taginfo['base']
    
    def getReleaseVersion(self):
        return self.poiserver['version']


def cgi(callback):
    ''' '''
    request = Request()

    if "CONTENT_TYPE" in os.environ:
        request.accepts = os.environ['CONTENT_TYPE']
    elif "HTTP_ACCEPT" in os.environ:
        request.accepts = os.environ['HTTP_ACCEPT']
    
    request.method = os.environ["REQUEST_METHOD"]

    post_data = None 
    if request.method != "GET" and request.method != "DELETE":
        post_data = sys.stdin.read()
    
    if post_data:
        for key, value in cgimod.parse_qsl(post_data, keep_blank_values=True):
            request.params[key.lower()] = value

    fields = cgimod.FieldStorage()
    try:
        for key in fields.keys():
            try:
                request.params[key.lower()] = fields[key].value
            except AttributeError:
                request.params[key] = fields[key]
    except TypeError:
        pass
    
    if "PATH_INFO" in os.environ and len(os.environ["PATH_INFO"]) > 0:
        request.path = os.environ["PATH_INFO"]
    else:
        request.path = os.environ["SCRIPT_NAME"][:-(os.environ["SCRIPT_NAME"].rfind('/')-1)]
    if request.path == '/':
        request.path = ''

    if "HTTP_X_FORWARDED_HOST" in os.environ:
        request.host = "http://" + os.environ["HTTP_X_FORWARDED_HOST"]
    elif "HTTP_HOST" in os.environ:
        request.host = "http://" + os.environ["HTTP_HOST"]

    request.script = os.environ["SCRIPT_NAME"]
    
    response = callback(request)

    if response.extra_headers:
        for (key, value) in response.extra_headers.items(): 
            print "%s: %s" % (key, value)

    print "Content-type: %s\n" % response.content_type

    if sys.platform == "win32":
        binary_print(response.data)
    else:
        try:
            print response.data.encode('utf-8')
        except UnicodeDecodeError:
            print response.data
        

