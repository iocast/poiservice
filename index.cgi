#!/usr/bin/env python
# -*- coding: UTF-8 -*-
import os, sys

from Server import Server, cgi

# debugging
import cgitb
cgitb.enable()

service = Server.load('poiserver.cfg')
cgi(service.dispatchRequest)


